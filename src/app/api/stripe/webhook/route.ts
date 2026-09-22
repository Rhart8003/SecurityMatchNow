import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  billingMode,
  getStripe,
  planForPrice,
  webhookSecret,
  type StripeBillingMode,
} from "@/lib/stripe";

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
  mode: StripeBillingMode,
) {
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = eventType === "customer.subscription.deleted" ? null : planForPrice(priceId, mode);

  if (eventType !== "customer.subscription.deleted" && !plan) {
    throw new Error(`Stripe price is not mapped to a SecurityMatch ${mode} plan: ${priceId || "missing"}`);
  }

  const providerId = subscription.metadata?.provider_id || null;
  const customerId = stripeId(subscription.customer);

  if (!providerId && !customerId) {
    throw new Error("Stripe subscription is missing provider and customer identity");
  }

  const db = createWebhookDbClient();
  const { error } = await db.from("stripe_webhook_inbox").insert({
    event_id: `${mode}:${eventId}`,
    event_type: eventType,
    provider_id: providerId,
    plan,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    current_period_end: periodEndIso(subscription),
    stripe_mode: mode,
  });

  if (error) throw error;
}

export async function POST(request: NextRequest) {
  const mode = billingMode();
  const signature = request.headers.get("stripe-signature");
  const secret = webhookSecret(mode);

  if (!signature || !secret) {
    return NextResponse.json({ error: `${mode} webhook is not configured.` }, { status: 503 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    console.error(`Invalid Stripe ${mode} webhook signature`, error);
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
        await enqueueSubscriptionEvent(event.id, event.type, subscription, mode);
        break;
      }

      case "customer.subscription.updated":
        await enqueueSubscriptionEvent(
          event.id,
          event.type,
          event.data.object as Stripe.Subscription,
          mode,
        );
        break;

      case "customer.subscription.deleted":
        await enqueueSubscriptionEvent(
          event.id,
          event.type,
          event.data.object as Stripe.Subscription,
          mode,
        );
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true, mode });
  } catch (error) {
    console.error(`Stripe ${mode} webhook processing error`, error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
