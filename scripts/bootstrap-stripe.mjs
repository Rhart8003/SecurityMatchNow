import Stripe from "stripe";

const rawKey = process.env.STRIPE_SECRET_KEY || "";
const key = rawKey.trim();

console.log("SECURITYMATCH_STRIPE_KEY_DIAGNOSTIC=" + JSON.stringify({
  present: rawKey.length > 0,
  trimmedLength: key.length,
  startsTest: key.startsWith("sk_test_"),
  startsLive: key.startsWith("sk_live_"),
  trimChanged: rawKey !== key,
}));

if (!key.startsWith("sk_test_")) {
  console.log("SECURITYMATCH_STRIPE_BOOTSTRAP_SKIPPED");
  process.exit(0);
}

const stripe = new Stripe(key);
const plans = [
  { slug: "verified", name: "SecurityMatch Verified", amount: 4900 },
  { slug: "professional", name: "SecurityMatch Professional", amount: 14900 },
  { slug: "prime", name: "SecurityMatch Prime", amount: 39900 },
];

const products = await stripe.products.list({ active: true, limit: 100 });
const out = [];

for (const plan of plans) {
  let product = products.data.find((p) => p.metadata?.securitymatch_plan === plan.slug);
  if (!product) {
    product = await stripe.products.create({
      name: plan.name,
      description: `${plan.name} monthly provider subscription for SecurityMatch.`,
      metadata: { securitymatch_plan: plan.slug, securitymatch_product: "provider_subscription" },
    });
  }

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  let price = prices.data.find((p) =>
    p.currency === "usd" &&
    p.unit_amount === plan.amount &&
    p.recurring?.interval === "month"
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

  out.push({ plan: plan.slug, productId: product.id, priceId: price.id });
}

console.log("SECURITYMATCH_STRIPE_PRICES=" + JSON.stringify(out));
