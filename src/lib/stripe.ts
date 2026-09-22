import Stripe from "stripe";

export type PaidPlan = "verified" | "professional" | "prime";
export type StripeBillingMode = "test" | "live";

let stripeClient: Stripe | null = null;
let stripeClientMode: StripeBillingMode | null = null;

export function billingMode(): StripeBillingMode {
  return process.env.STRIPE_BILLING_MODE?.trim().toLowerCase() === "live" ? "live" : "test";
}

function readStripeSecret(mode: StripeBillingMode = billingMode()) {
  if (mode === "live") {
    return (process.env.STRIPE_LIVE_SECRET_KEY || "").trim();
  }

  return (
    process.env.STRIPE_SECRET_KEY_FULL ||
    process.env.STRIPE_SECRET_KEY ||
    ""
  ).trim();
}

export function getStripe() {
  const mode = billingMode();
  const secretKey = readStripeSecret(mode);

  if (!secretKey) {
    throw new Error(`Stripe ${mode} secret key is not configured`);
  }

  if (!stripeClient || stripeClientMode !== mode) {
    stripeClient = new Stripe(secretKey);
    stripeClientMode = mode;
  }

  return stripeClient;
}

export function priceForPlan(plan: PaidPlan, mode: StripeBillingMode = billingMode()) {
  const prices: Record<PaidPlan, string | undefined> = mode === "live"
    ? {
        verified: process.env.STRIPE_LIVE_PRICE_VERIFIED?.trim(),
        professional: process.env.STRIPE_LIVE_PRICE_PROFESSIONAL?.trim(),
        prime: process.env.STRIPE_LIVE_PRICE_PRIME?.trim(),
      }
    : {
        verified: process.env.STRIPE_PRICE_VERIFIED?.trim(),
        professional: process.env.STRIPE_PRICE_PROFESSIONAL?.trim(),
        prime: process.env.STRIPE_PRICE_PRIME?.trim(),
      };

  return prices[plan];
}

export function planForPrice(
  priceId: string | null | undefined,
  mode: StripeBillingMode = billingMode(),
): PaidPlan | null {
  if (!priceId) return null;

  const entries: Array<[PaidPlan, string | undefined]> = [
    ["verified", priceForPlan("verified", mode)],
    ["professional", priceForPlan("professional", mode)],
    ["prime", priceForPlan("prime", mode)],
  ];

  return entries.find(([, id]) => id && id === priceId)?.[0] ?? null;
}

export function webhookSecret(mode: StripeBillingMode = billingMode()) {
  return mode === "live"
    ? process.env.STRIPE_LIVE_WEBHOOK_SECRET?.trim()
    : process.env.STRIPE_WEBHOOK_SECRET?.trim();
}

export function stripeModeReady(mode: StripeBillingMode) {
  const secret = readStripeSecret(mode);
  return Boolean(
    secret &&
    priceForPlan("verified", mode) &&
    priceForPlan("professional", mode) &&
    priceForPlan("prime", mode)
  );
}

export function stripeWebhookReady(mode: StripeBillingMode) {
  return Boolean(
    webhookSecret(mode) &&
    process.env.SECURITYMATCH_WEBHOOK_DB_KEY?.trim()
  );
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://securitymatchnow.onrender.com").replace(/\/$/, "");
}
