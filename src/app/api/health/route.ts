import { NextResponse } from "next/server";

export function GET() {
  const stripeSecret = (process.env.STRIPE_SECRET_KEY_FULL || process.env.STRIPE_SECRET_KEY || "").trim();
  const checkoutConfigured = Boolean(
    stripeSecret &&
    process.env.STRIPE_PRICE_VERIFIED?.trim() &&
    process.env.STRIPE_PRICE_PROFESSIONAL?.trim() &&
    process.env.STRIPE_PRICE_PRIME?.trim()
  );
  const webhookConfigured = Boolean(
    process.env.STRIPE_WEBHOOK_SECRET?.trim() &&
    process.env.SECURITYMATCH_WEBHOOK_DB_KEY?.trim()
  );

  return NextResponse.json({
    ok: true,
    service: "SecurityMatch",
    billing: {
      checkoutConfigured,
      webhookConfigured,
    },
    timestamp: new Date().toISOString(),
  });
}
