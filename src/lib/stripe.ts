import Stripe from "stripe";

export type PaidPlan = "verified" | "professional" | "prime";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = (process.env.STRIPE_SECRET_KEY || "").trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function priceForPlan(plan: PaidPlan) {
  const prices: Record<PaidPlan, string | undefined> = {
    verified: process.env.STRIPE_PRICE_VERIFIED?.trim(),
    professional: process.env.STRIPE_PRICE_PROFESSIONAL?.trim(),
    prime: process.env.STRIPE_PRICE_PRIME?.trim(),
  };

  return prices[plan];
}

export function planForPrice(priceId: string | null | undefined): PaidPlan | null {
  if (!priceId) return null;

  const entries: Array<[PaidPlan, string | undefined]> = [
    ["verified", process.env.STRIPE_PRICE_VERIFIED?.trim()],
    ["professional", process.env.STRIPE_PRICE_PROFESSIONAL?.trim()],
    ["prime", process.env.STRIPE_PRICE_PRIME?.trim()],
  ];

  return entries.find(([, id]) => id && id === priceId)?.[0] ?? null;
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://securitymatchnow.onrender.com").replace(/\/$/, "");
}
