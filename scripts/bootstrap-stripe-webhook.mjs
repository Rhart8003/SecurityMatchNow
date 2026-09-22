import Stripe from "stripe";

const stripeKey = (process.env.STRIPE_SECRET_KEY_FULL || "").trim();
const pad = Buffer.from(process.env.STRIPE_WEBHOOK_BOOTSTRAP_PAD || "", "base64");
const url = "https://securitymatchnow.onrender.com/api/stripe/webhook";

if (!stripeKey.startsWith("sk_test_")) {
  throw new Error("Stripe webhook bootstrap requires a test secret key");
}

if (pad.length < 64) {
  throw new Error("Webhook bootstrap pad is missing or too short");
}

const stripe = new Stripe(stripeKey);
const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });

for (const endpoint of endpoints.data.filter((item) => item.url === url)) {
  await stripe.webhookEndpoints.del(endpoint.id);
}

const created = await stripe.webhookEndpoints.create({
  url,
  enabled_events: [
    "checkout.session.completed",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ],
  description: "SecurityMatch test subscription webhook",
});

if (!created.secret) {
  throw new Error("Stripe did not return a webhook signing secret");
}

const secretBytes = Buffer.from(created.secret, "utf8");
if (pad.length < secretBytes.length) {
  throw new Error("Webhook bootstrap pad is shorter than the signing secret");
}

const encrypted = Buffer.alloc(secretBytes.length);
for (let i = 0; i < secretBytes.length; i += 1) {
  encrypted[i] = secretBytes[i] ^ pad[i];
}

console.log("SECURITYMATCH_WEBHOOK_BOOTSTRAP=" + JSON.stringify({
  endpointId: created.id,
  ciphertext: encrypted.toString("base64"),
  secretLength: secretBytes.length,
}));
