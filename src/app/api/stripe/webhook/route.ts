import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getStripe, planForPrice } from "@/lib/stripe";

type WebhookEventType =
  | "checkout.session.completed"
  | "customer.subscription.updated"
  | "customer.subscription.deleted";

function createWebhookDbClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const webhookDbKey = process.env.SECURITYMATCH_WEBHOOK_DB_KEY;

  if (!url || !publishableKey || !webhookDbKey) {
    throw new Error("Webhook database connection is not configured");
  }

  return createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "x-securitymatch-webhook-key": webhookDbKey,
      },
    },
  });
}

function stripeId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function periodEndIso(subscription: Stripe.Subscription) {
  const subscriptionLevel = subscription as unknown as { current_period_end?: number };
  const itemLevel = subscription.items.data[0] as unknown as { current_period_end?: number };
  const seconds = subscriptionLevel.current_period_end ?? itemLevel?.current_period_end;
  return typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : null;
}

async function enqueueSubscriptionEvent(
  eventId: string,
  eventType: WebhookEventType,
  subscription: Stripe.Subscription,
) {
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = eventType === "customer.subscription.deleted" ? null : planForPrice(priceId);

  if (eventType !== "customer.subscription.deleted" && !plan) {
    throw new Error(`Stripe price is not mapped to a SecurityMatch plan: ${priceId || "missing"}`);
  }

  const providerId = subscription.metadata?.provider_id || null;
  const customerId = stripeId(subscription.customer);

  if (!providerId && !customerId) {
    throw new Error("Stripe subscription is missing provider and customer identity");
  }

  const db = createWebhookDbClient();
  const { error } = await db.from("stripe_webhook_inbox").insert({
    event_id: eventId,
    event_type: eventType,
    provider_id: providerId,
    plan,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    current_period_end: periodEndIso(subscription),
  });

  if (error) throw error;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Invalid Stripe webhook signature", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = stripeId(session.subscription);

        if (!subscriptionId) {
          throw new Error("Checkout session completed without a subscription");
        }

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        await enqueueSubscriptionEvent(event.id, event.type, subscription);
        break;
      }

      case "customer.subscription.updated":
        await enqueueSubscriptionEvent(
          event.id,
          event.type,
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await enqueueSubscriptionEvent(
          event.id,
          event.type,
          event.data.object as Stripe.Subscription,
        );
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
