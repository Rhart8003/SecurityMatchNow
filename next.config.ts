import type { NextConfig } from "next";

if (process.env.RENDER) {
  const stripeSecret = (process.env.STRIPE_SECRET_KEY_FULL || process.env.STRIPE_SECRET_KEY || "").trim();
  console.log("SECURITYMATCH_BILLING_CONFIG=" + JSON.stringify({
    checkoutConfigured: Boolean(
      stripeSecret &&
      process.env.STRIPE_PRICE_VERIFIED?.trim() &&
      process.env.STRIPE_PRICE_PROFESSIONAL?.trim() &&
      process.env.STRIPE_PRICE_PRIME?.trim()
    ),
    webhookSecretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
    supabaseServiceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
  }));
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;
