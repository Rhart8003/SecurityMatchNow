import { NextResponse } from "next/server";
import {
  billingMode,
  stripeModeReady,
  stripeWebhookReady,
} from "@/lib/stripe";

export async function GET() {
  const mode = billingMode();

  return NextResponse.json({
    app: "SecurityMatchNow",
    status: "ok",
    billingMode: mode,
    stripeTestReady: stripeModeReady("test"),
    stripeLiveReady: stripeModeReady("live"),
    activeStripeReady: stripeModeReady(mode),
    activeWebhookReady: stripeWebhookReady(mode),
    supabaseReady: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    ),
    emailReady: Boolean(
      process.env.RESEND_API_KEY?.trim() &&
      process.env.RESEND_FROM_EMAIL?.trim()
    ),
    appUrl: (process.env.NEXT_PUBLIC_APP_URL || "").trim() || null,
    checkedAt: new Date().toISOString(),
  });
}
