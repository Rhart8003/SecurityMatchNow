import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appUrl, billingMode, getStripe, priceForPlan, type PaidPlan } from "@/lib/stripe";

const paidPlans = new Set<PaidPlan>(["verified", "professional", "prime"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const plan = body?.plan as PaidPlan;

    if (!paidPlans.has(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const mode = billingMode();
    const price = priceForPlan(plan, mode);

    if (!price) {
      return NextResponse.json({ error: `This plan is not configured for ${mode} billing yet.` }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      return NextResponse.json({ error: "Authentication required", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const { data: provider } = await supabase
      .from("providers")
      .select("id,legal_name,business_email")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (!provider) {
      return NextResponse.json({ error: "Create your provider profile before choosing a paid plan.", code: "PROVIDER_REQUIRED" }, { status: 409 });
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id,stripe_subscription_id,stripe_mode,status")
      .eq("provider_id", provider.id)
      .maybeSingle();

    const sameModeSubscription = subscription?.stripe_mode === mode;
    const activeSameModeSubscription =
      sameModeSubscription &&
      subscription?.stripe_subscription_id &&
      !["canceled", "incomplete_expired"].includes(subscription.status || "");

    if (activeSameModeSubscription) {
      return NextResponse.json({ error: "Use Manage Billing to change an existing paid plan.", code: "PORTAL_REQUIRED" }, { status: 409 });
    }

    const stripe = getStripe();
    const base = appUrl();
    const reusableCustomer = sameModeSubscription ? subscription?.stripe_customer_id : null;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      customer: reusableCustomer || undefined,
      customer_email: reusableCustomer ? undefined : (provider.business_email || user.email || undefined),
      success_url: `${base}/dashboard/provider?billing=success`,
      cancel_url: `${base}/providers?billing=cancelled`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      client_reference_id: provider.id,
      metadata: {
        provider_id: provider.id,
        plan,
        stripe_mode: mode,
      },
      subscription_data: {
        metadata: {
          provider_id: provider.id,
          plan,
          stripe_mode: mode,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json({ error: "Unable to start Stripe Checkout." }, { status: 500 });
  }
}
