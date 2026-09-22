import { NextResponse } from "next/server";
import { billingMode, stripeModeReady, stripeWebhookReady } from "@/lib/stripe";

export function GET() {
  const mode = billingMode();

  return NextResponse.json({
    ok: true,
    service: "SecurityMatch",
    billing: {
      mode,
      activeCheckoutConfigured: stripeModeReady(mode),
      activeWebhookConfigured: stripeWebhookReady(mode),
      test: {
        checkoutConfigured: stripeModeReady("test"),
        webhookConfigured: stripeWebhookReady("test"),
      },
      live: {
        checkoutConfigured: stripeModeReady("live"),
        webhookConfigured: stripeWebhookReady("live"),
      },
    },
    timestamp: new Date().toISOString(),
  });
}
