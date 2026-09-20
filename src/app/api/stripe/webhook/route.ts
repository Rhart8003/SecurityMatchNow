import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, planForPrice } from "@/lib/stripe";

async function syncSubscription(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const subscriptionId = subscription.id;
  const providerId = subscription.metadata?.provider_id || null;
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = planForPrice(priceId);

  if (!plan) {
    console.warn("Stripe subscription price is not mapped to a SecurityMatch plan", priceId);
    return;
  }

  let query = admin.from("subscriptions").update({
    plan,
    status: subscription.status,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    updated_at: new Date().toISOString(),
  });

  if (providerId) {
    query = query.eq("provider_id", providerId);
  } else {
    query = query.eq("stripe_customer_id", customerId);
  }

  const { error } = await query;
  if (error) throw error;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("stripe_webhook_events")
      .select("id")
      .eq("id", event.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const providerId = session.metadata?.provider_id;
        const plan = session.metadata?.plan as "verified" | "professional" | "prime" | undefined;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (providerId && plan && customerId && subscriptionId) {
          const stripeSubscription = await getStripe().subscriptions.retrieve(subscriptionId);
          await syncSubscription(stripeSubscription);
        }
        break;
      }

      case "customer.subscription.updated": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        const providerId = subscription.metadata?.provider_id || null;

        let query = admin.from("subscriptions").update({
          plan: "basic",
          status: "canceled",
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        });

        query = providerId ? query.eq("provider_id", providerId) : query.eq("stripe_customer_id", customerId);
        const { error } = await query;
        if (error) throw error;
        break;
      }

      default:
        break;
    }

    const { error: logError } = await admin.from("stripe_webhook_events").insert({
      id: event.id,
      event_type: event.type,
    });
    if (logError && logError.code !== "23505") throw logError;

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
