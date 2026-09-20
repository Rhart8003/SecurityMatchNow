import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

const plans = [
  { slug: "verified", name: "SecurityMatch Verified", amount: 4900 },
  { slug: "professional", name: "SecurityMatch Professional", amount: 14900 },
  { slug: "prime", name: "SecurityMatch Prime", amount: 39900 },
] as const;

export async function GET(request: NextRequest) {
  const supplied = request.nextUrl.searchParams.get("token");
  const expected = process.env.STRIPE_BOOTSTRAP_TOKEN;

  if (!expected || supplied !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.STRIPE_SECRET_KEY || "";
  if (!secret.startsWith("sk_test_")) {
    return NextResponse.json({ error: "Bootstrap is restricted to Stripe test mode." }, { status: 400 });
  }

  const stripe = getStripe();
  const existingProducts = await stripe.products.list({ active: true, limit: 100 });
  const results: Array<{ plan: string; productId: string; priceId: string }> = [];

  for (const plan of plans) {
    let product = existingProducts.data.find((item) => item.metadata?.securitymatch_plan === plan.slug);

    if (!product) {
      product = await stripe.products.create({
        name: plan.name,
        description: `${plan.name} monthly provider subscription for SecurityMatch.`,
        metadata: {
          securitymatch_plan: plan.slug,
          securitymatch_product: "provider_subscription",
        },
      });
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 100,
    });

    let price = prices.data.find((item) =>
      item.currency === "usd" &&
      item.unit_amount === plan.amount &&
      item.recurring?.interval === "month"
    );

    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.amount,
        currency: "usd",
        recurring: { interval: "month" },
        metadata: { securitymatch_plan: plan.slug },
      });
    }

    results.push({ plan: plan.slug, productId: product.id, priceId: price.id });
  }

  return NextResponse.json({ ok: true, mode: "test", results });
}
