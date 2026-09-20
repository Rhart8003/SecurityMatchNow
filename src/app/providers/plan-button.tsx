"use client";

import { useState } from "react";
import Link from "next/link";

type PaidPlan = "verified" | "professional" | "prime";

export function PlanButton({ plan, label, featured = false }: { plan: PaidPlan; label: string; featured?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    const response = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await response.json();
    if (data.url) {
      window.location.assign(data.url);
      return;
    }
    setError(data.error || "Unable to open billing.");
  }

  async function checkout() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await response.json();

    if (response.status === 401 || data.code === "AUTH_REQUIRED") {
      window.location.assign(`/login?next=${encodeURIComponent("/providers")}`);
      return;
    }

    if (data.code === "PROVIDER_REQUIRED") {
      window.location.assign("/provider/join");
      return;
    }

    if (data.code === "PORTAL_REQUIRED") {
      await openPortal();
      setLoading(false);
      return;
    }

    if (!response.ok || !data.url) {
      setError(data.error || "Unable to start checkout.");
      setLoading(false);
      return;
    }

    window.location.assign(data.url);
  }

  return (
    <div>
      <button className={`button full-button ${featured ? "button-primary" : "button-ghost"}`} onClick={checkout} disabled={loading}>
        {loading ? "Opening Stripe…" : label}
      </button>
      {error && <p className="inline-error">{error}</p>}
    </div>
  );
}

export function BasicPlanButton() {
  return <Link href="/provider/join" className="button button-ghost full-button">Choose Basic</Link>;
}
