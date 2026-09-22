"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { services } from "@/lib/services";
import { usStates } from "@/lib/states";
import { createClient } from "@/lib/supabase/client";

type UserState = "checking" | "signed-out" | "signed-in";
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

export function ProviderJoinForm({
  initialZip = "",
  initialState = "CA",
  marketName,
}: {
  initialZip?: string;
  initialState?: string;
  marketName?: string;
}) {
  const [userState, setUserState] = useState<UserState>("checking");
  const [userId, setUserId] = useState("");
  const [legalName, setLegalName] = useState("");
  const [dba, setDba] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState(initialState || "CA");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [officerCount, setOfficerCount] = useState("");
  const [zip, setZip] = useState(initialZip);
  const [radius, setRadius] = useState("50");
  const [statewide, setStatewide] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const selectedNames = useMemo(() => services.filter((service) => selectedServices.includes(service.slug)).map((service) => service.name), [selectedServices]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setUserState("signed-out");
        return;
      }
      setUserId(data.user.id);
      setBusinessEmail(data.user.email || "");
      setUserState("signed-in");
    });
  }, []);

  function toggleService(slug: string) {
    setSelectedServices((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
  }

  async function submit() {
    setError("");
    if (!legalName || !businessEmail || !state || selectedServices.length === 0 || (!statewide && zip.length !== 5)) {
      setError("Complete your company name, email, state, at least one service, and a valid service-area ZIP (or choose statewide coverage).");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: existing } = await supabase.from("providers").select("id").eq("owner_user_id", userId).maybeSingle();
    if (existing) {
      setError("A provider profile already exists for this account. Open your provider dashboard to manage it.");
      setLoading(false);
      return;
    }

    let geo: ZipGeo | null = null;
    if (!statewide) {
      geo = await lookupZip(zip);
      if (!geo) {
        setError("We could not locate that ZIP code. Please check it and try again.");
        setLoading(false);
        return;
      }
      if (geo.stateCode && geo.stateCode !== state) {
        setError(`ZIP ${zip} is in ${geo.stateCode}, not ${state}. Please correct the ZIP or state.`);
        setLoading(false);
        return;
      }
    }

    const { data: provider, error: providerError } = await supabase.from("providers").insert({
      owner_user_id: userId,
      legal_name: legalName,
      dba: dba || null,
      business_email: businessEmail,
      business_phone: businessPhone || null,
      website: website || null,
      primary_state: state,
      license_number: licenseNumber || null,
      years_in_business: yearsInBusiness ? Number(yearsInBusiness) : null,
      officer_count: officerCount ? Number(officerCount) : null,
      accepting_leads: true,
    }).select("id").single();

    if (providerError || !provider) {
      setError(providerError?.message || "Provider profile could not be created.");
      setLoading(false);
      return;
    }

    const { data: serviceRows, error: serviceError } = await supabase.from("services").select("id,slug").in("slug", selectedServices);
    if (serviceError || !serviceRows) {
      setError("Your company was created, but services could not be saved. Open the dashboard to finish setup.");
      setLoading(false);
      return;
    }

    const { error: providerServicesError } = await supabase.from("provider_services").insert(serviceRows.map((row) => ({ provider_id: provider.id, service_id: row.id })));
    if (providerServicesError) {
      setError("Your company was created, but services could not be saved. Open the dashboard to finish setup.");
      setLoading(false);
      return;
    }

    const { error: areaError } = await supabase.from("provider_service_areas").insert({
      provider_id: provider.id,
      zip_code: statewide ? null : zip,
      city: statewide ? null : (geo?.city || null),
      state,
      statewide,
      radius_miles: statewide ? null : Number(radius),
      anchor_lat: statewide ? null : (geo?.latitude ?? null),
      anchor_lng: statewide ? null : (geo?.longitude ?? null),
    });

    if (areaError) {
      setError("Your company and services were saved, but the service area needs attention in your dashboard.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (userState === "checking") return <div className="request-shell"><p>Checking your SecurityMatch account…</p></div>;

  if (userState === "signed-out") {
    const joinPath = `/provider/join?zip=${encodeURIComponent(initialZip)}&state=${encodeURIComponent(initialState)}`;
    return (
      <div className="request-shell">
        <span className="eyebrow">PROVIDER ACCOUNT</span>
        <h1>Start with a free SecurityMatch account.</h1>
        <p className="form-copy">Sign in or create an account first. After that, you’ll return here to create your security-company profile and service area.</p>
        <Link href={`/login?mode=signup&next=${encodeURIComponent(joinPath)}`} className="button button-primary full-button">Create Provider Account</Link>
        <Link href={`/login?next=${encodeURIComponent(joinPath)}`} className="button button-ghost full-button secondary-button">I already have an account</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="request-success">
        <div className="success-check">✓</div>
        <span className="eyebrow">PROFILE SUBMITTED</span>
        <h1>Your provider profile is in SecurityMatch.</h1>
        <p><strong>{legalName}</strong> is on the Basic plan and is pending marketplace approval. Your selected services are {selectedNames.join(", ")}.</p>
        <p className="demo-note">{statewide ? `Coverage: statewide in ${state}.` : `Coverage: ${radius} miles from ZIP ${zip}.`} Pending providers can manage their profile, but SecurityMatch will not send customer leads until the company is approved/activated.</p>
        <Link href="/dashboard/provider" className="button button-primary">Open Provider Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="request-shell">
      <span className="eyebrow">COMPANY REGISTRATION</span>
      <h1>{marketName ? `Join SecurityMatch in ${marketName}.` : "Create your provider profile."}</h1>
      {error && <div className="form-alert error">{error}</div>}
      <div className="form-grid">
        <label>Company legal name<input className="field" value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="Company name" /></label>
        <label>DBA<input className="field" value={dba} onChange={(e) => setDba(e.target.value)} placeholder="Optional" /></label>
        <label>Business phone<input className="field" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} type="tel" /></label>
        <label>Business email<input className="field" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} type="email" /></label>
        <label>Website<input className="field" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" /></label>
        <label>Primary state<select className="field" value={state} onChange={(e) => setState(e.target.value)}>{usStates.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
        <label>Security agency license #<input className="field" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="PPO / agency license" /></label>
        <label>Years in business<input className="field" value={yearsInBusiness} onChange={(e) => setYearsInBusiness(e.target.value.replace(/\D/g,""))} inputMode="numeric" /></label>
        <label>Approx. officer count<input className="field" value={officerCount} onChange={(e) => setOfficerCount(e.target.value.replace(/\D/g,""))} inputMode="numeric" /></label>
      </div>

      <label className="field-label">Services offered</label>
      <div className="select-service-grid provider-services">
        {services.map((item) => <button type="button" key={item.slug} className={`select-service ${selectedServices.includes(item.slug) ? "selected" : ""}`} onClick={() => toggleService(item.slug)}><span>{item.icon}</span><b>{item.name}</b></button>)}
      </div>

      <label className="field-label service-area-heading">Primary service area</label>
      <div className="form-grid">
        <label>Base ZIP code<input className="field" value={zip} disabled={statewide} onChange={(e) => setZip(e.target.value.replace(/\D/g,"").slice(0,5))} inputMode="numeric" placeholder="93721" /></label>
        <label>State<select className="field" value={state} onChange={(e) => setState(e.target.value)}>{usStates.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
        <label>Service radius<select className="field" value={radius} disabled={statewide} onChange={(e) => setRadius(e.target.value)}>{radiusOptions.map((miles) => <option value={miles} key={miles}>{miles} miles</option>)}</select></label>
      </div>
      <p className="radius-note">SecurityMatch will match requests inside the selected radius from your base ZIP, within the licensed state.</p>
      <label className="consent"><input type="checkbox" checked={statewide} onChange={(e) => setStatewide(e.target.checked)} /> My company can accept qualified assignments statewide in {state}.</label>
      <button className="button button-primary request-next" disabled={loading} onClick={submit}>{loading ? "Creating profile…" : "Create Provider Profile"}</button>
      <p className="auth-helper">SecurityMatch verifies provider information separately. A paid plan never substitutes for licensing or marketplace approval.</p>
    </div>
  );
}
