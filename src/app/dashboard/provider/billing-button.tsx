"use client";

import { useState } from "react";

export function BillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openBilling() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await response.json();

    if (!response.ok || !data.url) {
      setError(data.error || "Unable to open billing.");
      setLoading(false);
      return;
    }

    window.location.assign(data.url);
  }

  return (
    <div className="billing-button-wrap">
      <button className="button button-dark" onClick={openBilling} disabled={loading}>
        {loading ? "Opening billing…" : "Manage Billing"}
      </button>
      {error && <div className="inline-error">{error}</div>}
    </div>
  );
}
