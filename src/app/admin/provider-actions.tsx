"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProviderStatus = "pending" | "active" | "suspended";
type PlanCode = "basic" | "verified" | "professional" | "prime";

type Props = {
  providerId: string;
  status: ProviderStatus;
  licenseVerified: boolean;
  insuranceVerified: boolean;
  workersCompVerified: boolean;
  plan: PlanCode;
};

export function ProviderActions({
  providerId,
  status,
  licenseVerified,
  insuranceVerified,
  workersCompVerified,
  plan,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function update(payload: Record<string, unknown>, label: string) {
    setBusy(label);
    setError(null);
    const { error: rpcError } = await supabase.rpc("admin_update_provider", {
      p_provider_id: providerId,
      p_status: null,
      p_license_verified: null,
      p_insurance_verified: null,
      p_workers_comp_verified: null,
      p_plan: null,
      ...payload,
    });
    if (rpcError) {
      setError(rpcError.message);
    } else {
      router.refresh();
    }
    setBusy(null);
  }

  return (
    <div className="admin-actions">
      <div className="admin-action-group">
        <span>Verification</span>
        <button
          type="button"
          className={licenseVerified ? "admin-toggle is-on" : "admin-toggle"}
          disabled={!!busy}
          onClick={() => update({ p_license_verified: !licenseVerified }, "license")}
        >
          {busy === "license" ? "Saving…" : `License ${licenseVerified ? "✓" : "○"}`}
        </button>
        <button
          type="button"
          className={insuranceVerified ? "admin-toggle is-on" : "admin-toggle"}
          disabled={!!busy}
          onClick={() => update({ p_insurance_verified: !insuranceVerified }, "insurance")}
        >
          {busy === "insurance" ? "Saving…" : `Insurance ${insuranceVerified ? "✓" : "○"}`}
        </button>
        <button
          type="button"
          className={workersCompVerified ? "admin-toggle is-on" : "admin-toggle"}
          disabled={!!busy}
          onClick={() => update({ p_workers_comp_verified: !workersCompVerified }, "workersComp")}
        >
          {busy === "workersComp" ? "Saving…" : `Workers' Comp ${workersCompVerified ? "✓" : "○"}`}
        </button>
      </div>

      <div className="admin-action-group">
        <span>Marketplace status</span>
        {status !== "active" ? (
          <button
            type="button"
            className="button button-small button-primary"
            disabled={!!busy}
            onClick={() => update({ p_status: "active" }, "activate")}
          >
            {busy === "activate" ? "Saving…" : "Activate"}
          </button>
        ) : (
          <button
            type="button"
            className="button button-small button-dark"
            disabled={!!busy}
            onClick={() => update({ p_status: "suspended" }, "suspend")}
          >
            {busy === "suspend" ? "Saving…" : "Suspend"}
          </button>
        )}
      </div>

      <div className="admin-action-group plan-buttons">
        <span>Plan</span>
        {(["basic", "verified", "professional", "prime"] as PlanCode[]).map((item) => (
          <button
            key={item}
            type="button"
            className={plan === item ? "admin-plan is-current" : "admin-plan"}
            disabled={!!busy}
            onClick={() => update({ p_plan: item }, `plan-${item}`)}
          >
            {busy === `plan-${item}` ? "…" : item}
          </button>
        ))}
      </div>

      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}
