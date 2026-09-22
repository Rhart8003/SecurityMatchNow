"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usStates } from "@/lib/states";
import { createClient } from "@/lib/supabase/client";

type Area = {
  id: string;
  zip_code: string | null;
  city: string | null;
  state: string;
  statewide: boolean;
  radius_miles: number | null;
} | null;

type ZipGeo = { city?: string | null; stateCode?: string | null; latitude?: number | null; longitude?: number | null };
const radiusOptions = [25, 50, 75, 100, 150];

async function lookupZip(zip: string): Promise<ZipGeo | null> {
  try {
    const response = await fetch(`/api/geo/zip?zip=${encodeURIComponent(zip)}`);
    if (!response.ok) return null;
    return await response.json() as ZipGeo;
  } catch {
    return null;
  }
}

export function ServiceAreaEditor({
  providerId,
  primaryState,
  area,
}: {
  providerId: string;
  primaryState: string;
  area: Area;
}) {
  const router = useRouter();
  const [zip, setZip] = useState(area?.zip_code || "");
  const [state, setState] = useState(area?.state || primaryState || "CA");
  const [radius, setRadius] = useState(String(area?.radius_miles || 50));
  const [statewide, setStatewide] = useState(area?.statewide || false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save() {
    setError("");
    setMessage("");

    if (!statewide && zip.length !== 5) {
      setError("Enter a valid 5-digit base ZIP or choose statewide coverage.");
      return;
    }

    setSaving(true);
    let geo: ZipGeo | null = null;

    if (!statewide) {
      geo = await lookupZip(zip);
      if (!geo) {
        setError("We could not locate that ZIP code. Please check it and try again.");
        setSaving(false);
        return;
      }
      if (geo.stateCode && geo.stateCode !== state) {
        setError(`ZIP ${zip} is in ${geo.stateCode}, not ${state}.`);
        setSaving(false);
        return;
      }
    }

    const supabase = createClient();
    const payload = {
      provider_id: providerId,
      zip_code: statewide ? null : zip,
      city: statewide ? null : (geo?.city || null),
      state,
      statewide,
      radius_miles: statewide ? null : Number(radius),
      anchor_lat: statewide ? null : (geo?.latitude ?? null),
      anchor_lng: statewide ? null : (geo?.longitude ?? null),
    };

    const result = area?.id
      ? await supabase.from("provider_service_areas").update(payload).eq("id", area.id)
      : await supabase.from("provider_service_areas").insert(payload);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setMessage("Coverage updated. SecurityMatch refreshed your eligible leads.");
    setSaving(false);
    router.refresh();
  }

  return (
    <section className="coverage-editor">
      <div className="coverage-editor-head">
        <div>
          <span className="eyebrow">SERVICE TERRITORY</span>
          <h2>Set your lead radius.</h2>
          <p>Choose how far your company will travel for matched assignments. Radius matching stays within the selected state.</p>
        </div>
        <span className="coverage-status">{statewide ? `Statewide · ${state}` : `${radius} miles · ${zip || "ZIP needed"}`}</span>
      </div>

      {error && <div className="form-alert error">{error}</div>}
      {message && <div className="form-alert success">{message}</div>}

      <div className="form-grid">
        <label>Base ZIP<input className="field" value={zip} disabled={statewide} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0,5))} inputMode="numeric" /></label>
        <label>State<select className="field" value={state} onChange={(e) => setState(e.target.value)}>{usStates.map(([code,name]) => <option key={code} value={code}>{name}</option>)}</select></label>
        <label>Service radius<select className="field" value={radius} disabled={statewide} onChange={(e) => setRadius(e.target.value)}>{radiusOptions.map((miles) => <option key={miles} value={miles}>{miles} miles</option>)}</select></label>
      </div>

      <label className="consent"><input type="checkbox" checked={statewide} onChange={(e) => setStatewide(e.target.checked)} /> Accept qualified assignments statewide in {state}.</label>
      <div className="request-buttons">
        <button className="button button-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Service Territory"}</button>
      </div>
    </section>
  );
}
