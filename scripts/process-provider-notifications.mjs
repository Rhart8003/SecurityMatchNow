const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://securitymatchnow.onrender.com").replace(/\/$/, "");
const secret = process.env.NOTIFY_CRON_SECRET;

if (!secret) {
  console.error("NOTIFY_CRON_SECRET is not configured.");
  process.exit(1);
}

const response = await fetch(`${appUrl}/api/internal/process-provider-notifications`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  },
});

const text = await response.text();
console.log(`Notification worker: HTTP ${response.status} ${text}`);

if (!response.ok) process.exit(1);
