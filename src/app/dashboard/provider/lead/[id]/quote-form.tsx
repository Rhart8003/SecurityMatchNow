"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ExistingQuote = {
  id: string;
  hourly_rate: number | null;
  officer_count: number | null;
  minimum_hours: number | null;
  supervisor_fee: number | null;
  vehicle_fee: number | null;
  additional_charges: number | null;
  estimated_total: number;
  notes: string | null;
  status: string;
} | null;

export function QuoteForm({ requestId, providerId, defaultOfficerCount, existing }: { requestId: string; providerId: string; defaultOfficerCount: number; existing: ExistingQuote }) {
  const [hourlyRate, setHourlyRate] = useState(existing?.hourly_rate?.toString() || "");
  const [officerCount, setOfficerCount] = useState((existing?.officer_count || defaultOfficerCount).toString());
  const [minimumHours, setMinimumHours] = useState(existing?.minimum_hours?.toString() || "4");
  const [supervisorFee, setSupervisorFee] = useState(existing?.supervisor_fee?.toString() || "0");
  const [vehicleFee, setVehicleFee] = useState(existing?.vehicle_fee?.toString() || "0");
  const [additionalCharges, setAdditionalCharges] = useState(existing?.additional_charges?.toString() || "0");
  const [estimatedTotal, setEstimatedTotal] = useState(existing?.estimated_total?.toString() || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const calculated = useMemo(() => {
    const rate = Number(hourlyRate || 0);
    const officers = Number(officerCount || 0);
    const hours = Number(minimumHours || 0);
    return rate * officers * hours + Number(supervisorFee || 0) + Number(vehicleFee || 0) + Number(additionalCharges || 0);
  }, [hourlyRate, officerCount, minimumHours, supervisorFee, vehicleFee, additionalCharges]);

  async function submit() {
    setError("");
    setMessage("");
    const total = Number(estimatedTotal || calculated);
    if (!hourlyRate || !officerCount || total <= 0) {
      setError("Enter an hourly rate, officer count, and valid estimated total.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const payload = {
      request_id: requestId,
      provider_id: providerId,
      hourly_rate: Number(hourlyRate),
      officer_count: Number(officerCount),
      minimum_hours: Number(minimumHours || 0),
      supervisor_fee: Number(supervisorFee || 0),
      vehicle_fee: Number(vehicleFee || 0),
      additional_charges: Number(additionalCharges || 0),
      estimated_total: total,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    };

    const result = existing
      ? await supabase.from("quotes").update(payload).eq("id", existing.id)
      : await supabase.from("quotes").insert(payload);

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setMessage(existing ? "Quote updated." : "Quote sent to the customer.");
    setEstimatedTotal(total.toFixed(2));
    setLoading(false);
    window.setTimeout(() => window.location.reload(), 600);
  }

  return (
    <div className="quote-form-card">
      <div className="quote-form-heading"><div><span className="eyebrow">{existing ? "YOUR QUOTE" : "SUBMIT A QUOTE"}</span><h2>{existing ? "Update your proposal" : "Price this opportunity"}</h2></div>{existing && <span className="status-badge">{existing.status.toUpperCase()}</span>}</div>
      {error && <div className="form-alert error">{error}</div>}
      {message && <div className="form-alert success">{message}</div>}
      <div className="form-grid">
        <label>Hourly rate<input className="field" type="number" min="0" step="0.01" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="38.00" /></label>
        <label>Officers<input className="field" type="number" min="1" value={officerCount} onChange={(e) => setOfficerCount(e.target.value)} /></label>
        <label>Minimum hours<input className="field" type="number" min="0" step="0.5" value={minimumHours} onChange={(e) => setMinimumHours(e.target.value)} /></label>
        <label>Supervisor fee<input className="field" type="number" min="0" step="0.01" value={supervisorFee} onChange={(e) => setSupervisorFee(e.target.value)} /></label>
        <label>Vehicle fee<input className="field" type="number" min="0" step="0.01" value={vehicleFee} onChange={(e) => setVehicleFee(e.target.value)} /></label>
        <label>Other charges<input className="field" type="number" min="0" step="0.01" value={additionalCharges} onChange={(e) => setAdditionalCharges(e.target.value)} /></label>
        <label className="full-span">Estimated total<input className="field" type="number" min="0" step="0.01" value={estimatedTotal} onChange={(e) => setEstimatedTotal(e.target.value)} placeholder={calculated ? calculated.toFixed(2) : "Total contract estimate"} /></label>
      </div>
      <label className="field-label">Notes to customer</label>
      <textarea className="field textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe what is included, minimums, supervisor coverage, cancellation terms, or other important details." />
      <div className="calculated-total"><span>Calculated from entered rate/minimums</span><b>${calculated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></div>
      <button className="button button-primary full-button" disabled={loading || existing?.status === "accepted"} onClick={submit}>{loading ? "Saving…" : existing ? "Update Quote" : "Send Quote"}</button>
    </div>
  );
}
