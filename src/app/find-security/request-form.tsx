"use client";

import { useEffect, useMemo, useState } from "react";
import { services } from "@/lib/services";
import { usStates } from "@/lib/states";
import { createClient } from "@/lib/supabase/client";

type Step = 1 | 2 | 3 | 4;

type ZipGeo = {
  city?: string | null;
  stateCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type PendingRequest = {
  zip: string;
  state: string;
  service: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  officerCount: string;
  officerType: string;
  frequency: string;
  requirements: string[];
  description: string;
  firstName: string;
  lastName: string;
  organization: string;
  phone: string;
  email: string;
  urgent: boolean;
};

const PENDING_KEY = "securitymatch_pending_request_v1";
const requirementOptions = ["Uniformed officers", "Plainclothes personnel", "Vehicle patrol", "Access control", "Crowd control", "Parking control", "Overnight coverage", "Supervisor required"];

function isoDateTime(date: string, time: string) {
  if (!date) return null;
  const value = new Date(`${date}T${time || "00:00"}`);
  return Number.isNaN(value.getTime()) ? null : value.toISOString();
}

async function lookupZip(zip: string): Promise<ZipGeo | null> {
  try {
    const response = await fetch(`/api/geo/zip?zip=${encodeURIComponent(zip)}`);
    if (!response.ok) return null;
    return await response.json() as ZipGeo;
  } catch {
    return null;
  }
}

export function RequestForm({
  initialZip = "",
  initialState = "CA",
  initialService = "",
  urgent = false,
  resume = false,
}: {
  initialZip?: string;
  initialState?: string;
  initialService?: string;
  urgent?: boolean;
  resume?: boolean;
}) {
  const [step, setStep] = useState<Step>(1);
  const [zip, setZip] = useState(initialZip);
  const [state, setState] = useState(initialState || "CA");
  const [service, setService] = useState(initialService || (urgent ? "emergency-security" : ""));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [officerCount, setOfficerCount] = useState("1");
  const [officerType, setOfficerType] = useState("unarmed");
  const [frequency, setFrequency] = useState(urgent ? "emergency" : "one_time");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [requestId, setRequestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restored, setRestored] = useState(false);

  const selectedService = useMemo(() => services.find((item) => item.slug === service), [service]);

  useEffect(() => {
    if (!resume) return;
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return;
    try {
      const pending = JSON.parse(raw) as PendingRequest;
      setZip(pending.zip || "");
      setState(pending.state || "CA");
      setService(pending.service || "");
      setStartDate(pending.startDate || "");
      setEndDate(pending.endDate || "");
      setStartTime(pending.startTime || "");
      setEndTime(pending.endTime || "");
      setOfficerCount(pending.officerCount || "1");
      setOfficerType(pending.officerType || "unarmed");
      setFrequency(pending.frequency || "one_time");
      setRequirements(pending.requirements || []);
      setDescription(pending.description || "");
      setFirstName(pending.firstName || "");
      setLastName(pending.lastName || "");
      setOrganization(pending.organization || "");
      setPhone(pending.phone || "");
      setEmail(pending.email || "");
      setStep(4);
      setRestored(true);
    } catch {
      window.localStorage.removeItem(PENDING_KEY);
    }
  }, [resume]);

  if (submitted) {
    return (
      <div className="request-success">
        <div className="success-check">✓</div>
        <span className="eyebrow">REQUEST LIVE</span>
        <h1>{matchCount && matchCount > 0 ? "We found providers for your request." : "Your request is now in SecurityMatch."}</h1>
        <p>Your request for <strong>{selectedService?.name ?? "security services"}</strong> in ZIP <strong>{zip}</strong> has been saved.</p>
        <div className="match-progress">
          <div className="done">✓ Request saved securely</div>
          <div className="done">✓ Location, radius and service checked</div>
          <div className="active">● {matchCount === null ? "Checking provider matches" : `${matchCount} provider match${matchCount === 1 ? "" : "es"} available now`}</div>
        </div>
        {matchCount === 0 && <p className="demo-note">No active provider currently matches this service and coverage area. The request remains in your dashboard while the provider network expands.</p>}
        <div className="request-buttons">
          <a className="button button-primary" href="/dashboard/customer">View My Dashboard</a>
          <button className="button button-ghost" onClick={() => { setSubmitted(false); setStep(1); setRequestId(""); }}>New Request</button>
        </div>
        {requestId && <p className="request-id">Request ID: {requestId}</p>}
      </div>
    );
  }

  const next = () => setStep((Math.min(step + 1, 4) as Step));
  const back = () => setStep((Math.max(step - 1, 1) as Step));

  function toggleRequirement(item: string) {
    setRequirements((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  }

  function pendingPayload(): PendingRequest {
    return { zip, state, service, startDate, endDate, startTime, endTime, officerCount, officerType, frequency, requirements, description, firstName, lastName, organization, phone, email, urgent };
  }

  async function submitRequest() {
    setLoading(true);
    setError("");

    if (!consent || !firstName || !lastName || !email || zip.length !== 5 || !service) {
      setError("Please complete your name, email, ZIP code, service, and authorization before submitting.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      window.localStorage.setItem(PENDING_KEY, JSON.stringify(pendingPayload()));
      const nextPath = "/find-security?resume=1";
      window.location.assign(`/login?mode=signup&next=${encodeURIComponent(nextPath)}`);
      return;
    }

    const geo = await lookupZip(zip);
    if (geo?.stateCode && geo.stateCode !== state) {
      setError(`ZIP ${zip} is in ${geo.stateCode}, not ${state}. Please correct the ZIP or state.`);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").update({
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      organization: organization || null,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    const { data: serviceRecord, error: serviceError } = await supabase.from("services").select("id").eq("slug", service).single();
    if (serviceError || !serviceRecord) {
      setError("We could not load that security service. Please try again.");
      setLoading(false);
      return;
    }

    const { data: created, error: requestError } = await supabase.from("security_requests").insert({
      customer_user_id: user.id,
      service_id: serviceRecord.id,
      zip_code: zip,
      city: geo?.city || null,
      state,
      latitude: geo?.latitude ?? null,
      longitude: geo?.longitude ?? null,
      start_at: isoDateTime(startDate, startTime),
      end_at: isoDateTime(endDate || startDate, endTime),
      officer_count: Number(officerCount),
      officer_type: officerType,
      frequency,
      is_urgent: urgent || frequency === "emergency",
      requirements,
      description: description || null,
    }).select("id,status").single();

    if (requestError || !created) {
      setError(requestError?.message || "Your request could not be saved.");
      setLoading(false);
      return;
    }

    const { count } = await supabase.from("matches").select("id", { count: "exact", head: true }).eq("request_id", created.id);
    window.localStorage.removeItem(PENDING_KEY);
    setRequestId(created.id);
    setMatchCount(count ?? 0);
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="request-shell">
      <div className="request-progress" aria-label={`Step ${step} of 4`}>
        {[1,2,3,4].map((n) => <span key={n} className={n <= step ? "active" : ""} />)}
      </div>
      <div className="request-step-label">Step {step} of 4</div>
      {restored && step === 4 && <div className="form-alert success">Your request details were restored. Review them and submit when ready.</div>}
      {error && <div className="form-alert error">{error}</div>}

      {step === 1 && (
        <section>
          <span className="eyebrow">LOCATION & SERVICE</span>
          <h1>{urgent ? "Tell us where you need urgent coverage." : "What kind of security do you need?"}</h1>
          <div className="form-grid compact-grid">
            <label>ZIP code<input className="field" value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0,5))} placeholder="93721" inputMode="numeric" /></label>
            <label>State<select className="field" value={state} onChange={(e) => setState(e.target.value)}>{usStates.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
          </div>
          <div className="select-service-grid">
            {services.map((item) => (
              <button key={item.slug} type="button" className={`select-service ${service === item.slug ? "selected" : ""}`} onClick={() => setService(item.slug)}>
                <span>{item.icon}</span><b>{item.name}</b>
              </button>
            ))}
          </div>
          <button disabled={zip.length !== 5 || !service} className="button button-primary request-next" onClick={next}>Continue</button>
        </section>
      )}

      {step === 2 && (
        <section>
          <span className="eyebrow">COVERAGE DETAILS</span>
          <h1>When and how much coverage do you need?</h1>
          <div className="form-grid">
            <label>Start date<input className="field" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
            <label>End date<input className="field" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
            <label>Start time<input className="field" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></label>
            <label>End time<input className="field" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></label>
            <label>Number of officers<select className="field" value={officerCount} onChange={(e) => setOfficerCount(e.target.value)}>{Array.from({ length: 20 }, (_, index) => index + 1).map((number) => <option key={number} value={number}>{number}</option>)}</select></label>
            <label>Officer type<select className="field" value={officerType} onChange={(e) => setOfficerType(e.target.value)}><option value="unarmed">Unarmed</option><option value="armed">Armed</option><option value="either">Either</option><option value="unsure">Not sure</option></select></label>
          </div>
          <label className="field-label">Coverage frequency</label>
          <div className="pill-options">{[["one_time","One-time"],["daily","Daily"],["weekly","Weekly"],["ongoing","Ongoing"],["emergency","Emergency"]].map(([value,label]) => <button type="button" key={value} className={frequency === value ? "selected" : ""} onClick={() => setFrequency(value)}>{label}</button>)}</div>
          <div className="request-buttons"><button className="button button-ghost" onClick={back}>Back</button><button className="button button-primary" onClick={next}>Continue</button></div>
        </section>
      )}

      {step === 3 && (
        <section>
          <span className="eyebrow">ASSIGNMENT DETAILS</span>
          <h1>Help providers understand the assignment.</h1>
          <label className="field-label">Additional requirements</label>
          <div className="check-grid">
            {requirementOptions.map((item) => <label key={item}><input type="checkbox" checked={requirements.includes(item)} onChange={() => toggleRequirement(item)} /> {item}</label>)}
          </div>
          <label className="field-label" htmlFor="details">Describe what you need</label>
          <textarea id="details" className="field textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Example: We are hosting a three-day outdoor event and need five guards each evening from 7 PM until 1 AM." />
          <div className="request-buttons"><button className="button button-ghost" onClick={back}>Back</button><button className="button button-primary" onClick={next}>Continue</button></div>
        </section>
      )}

      {step === 4 && (
        <section>
          <span className="eyebrow">CONTACT INFORMATION</span>
          <h1>Where should matched providers send quotes?</h1>
          <div className="form-grid">
            <label>First name<input className="field" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" /></label>
            <label>Last name<input className="field" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" /></label>
            <label>Business / organization<input className="field" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Optional" /></label>
            <label>Mobile phone<input className="field" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="(555) 555-5555" /></label>
            <label className="full-span">Email<input className="field" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" /></label>
          </div>
          <label className="consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> I authorize SecurityMatch to share this request with providers matched to my security need.</label>
          <div className="summary-card"><b>Request summary</b><span>{selectedService?.name} · {zip}, {state}</span><span>{officerCount} {officerType} officer{Number(officerCount) === 1 ? "" : "s"} · {frequency.replace("_", " ")}</span></div>
          <div className="request-buttons"><button className="button button-ghost" onClick={back}>Back</button><button className="button button-primary" disabled={loading || !consent} onClick={submitRequest}>{loading ? "Submitting…" : "Find My Security Providers"}</button></div>
          <p className="auth-helper">If you are not signed in, SecurityMatch will securely save these details in your browser and ask you to create a free account before submitting.</p>
        </section>
      )}
    </div>
  );
}
