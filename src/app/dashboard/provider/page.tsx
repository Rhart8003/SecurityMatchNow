import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/server";
import { BillingButton } from "./billing-button";
import { ServiceAreaEditor } from "./service-area-editor";

function serviceName(value: unknown) {
  const relation = value as { name?: string } | null;
  return relation?.name || "Security Service";
}

export default async function ProviderDashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const billingSuccess = params.billing === "success";

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  if (!userId) redirect("/login?next=" + encodeURIComponent("/dashboard/provider"));

  const { data: provider } = await supabase.from("providers").select("id,legal_name,status,accepting_leads,primary_state").eq("owner_user_id", userId).maybeSingle();
  if (!provider) {
    return <main><Header /><div className="container dashboard"><div className="empty-state"><span className="eyebrow">PROVIDER DASHBOARD</span><h1>Create your provider profile.</h1><p>Your account is ready, but you haven’t registered a security company yet.</p><Link href="/provider/join" className="button button-primary">Create Provider Profile</Link></div></div></main>;
  }

  const [{ data: matches = [] }, { data: quotes = [] }, { data: subscription }, { data: area }] = await Promise.all([
    supabase.from("matches").select("id,request_id,match_score,distance_miles,sponsored,affiliated,created_at,security_requests(id,zip_code,city,state,officer_count,officer_type,is_urgent,status,services(name))").eq("provider_id", provider.id).order("created_at", { ascending: false }),
    supabase.from("quotes").select("id,status,estimated_total").eq("provider_id", provider.id),
    supabase.from("subscriptions").select("plan,status,stripe_customer_id,stripe_subscription_id").eq("provider_id", provider.id).maybeSingle(),
    supabase.from("provider_service_areas").select("id,zip_code,city,state,statewide,radius_miles").eq("provider_id", provider.id).order("created_at", { ascending: true }).limit(1).maybeSingle(),
  ]);

  const jobsWon = (quotes || []).filter((quote) => quote.status === "accepted");
  const valueWon = jobsWon.reduce((sum, quote) => sum + Number(quote.estimated_total || 0), 0);
  const plan = subscription?.plan || "basic";
  const paid = plan !== "basic" && !!subscription?.stripe_customer_id;

  return (
    <main>
      <Header />
      <div className="container dashboard">
        {billingSuccess && <div className="form-alert success billing-success">Stripe checkout completed. Your paid plan will appear here as soon as the signed Stripe webhook confirms the subscription.</div>}

        <div className="dashboard-title">
          <div><span className="eyebrow">PROVIDER DASHBOARD</span><h1>{provider.legal_name}</h1></div>
          <div className="provider-billing-actions">
            <Link href="/providers" className={"button " + (plan === "prime" ? "button-light" : "button-dark")}>Plan: {plan.toUpperCase()}</Link>
            {paid && <BillingButton />}
          </div>
        </div>

        {provider.status !== "active" && <div className="provider-status-banner"><b>Marketplace status: {provider.status}</b><span>Your profile is saved, but customer leads begin only after SecurityMatch activates the provider.</span></div>}

        <div className="stats">
          <div><b>{matches?.length || 0}</b><span>Matched leads</span></div>
          <div><b>{quotes?.length || 0}</b><span>Quotes sent</span></div>
          <div><b>{jobsWon.length}</b><span>Jobs won</span></div>
          <div><b>{"$" + valueWon.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b><span>Accepted quote value</span></div>
        </div>

        <ServiceAreaEditor providerId={provider.id} primaryState={provider.primary_state} area={area || null} />

        {!matches?.length ? (
          <div className="empty-state"><h2>No matched leads yet.</h2><p>{provider.status === "active" ? "New requests inside your service radius that match your services will appear here." : "Complete verification and activation first; then matching leads will appear automatically."}</p></div>
        ) : (
          <div className="dashboard-list">
            {matches.map((match) => {
              const request = match.security_requests as unknown as { id: string; zip_code: string; city?: string; state?: string; officer_count: number; officer_type: string; is_urgent: boolean; status: string; services?: { name?: string } } | null;
              if (!request) return null;
              const label = request.is_urgent ? "URGENT LEAD" : match.affiliated ? "AFFILIATED LEAD" : match.sponsored ? "PRIME LEAD" : "MATCHED LEAD";
              return (
                <div className="dashboard-card" key={match.id}>
                  <div>
                    <span className={request.is_urgent ? "urgent-badge" : "status-badge"}>{label}</span>
                    <h3>{serviceName(request.services)}</h3>
                    <p>{request.city ? request.city + ", " : ""}{request.state || ""} {request.zip_code} · {request.officer_count} {request.officer_type} officer{request.officer_count === 1 ? "" : "s"}</p>
                    {match.distance_miles !== null && match.distance_miles !== undefined && <span className="distance-note">Approx. {Number(match.distance_miles).toFixed(1)} miles from your service-area center</span>}
                  </div>
                  <div className="quote-count"><b>{Number(match.match_score).toFixed(0)}%</b><span>match</span></div>
                  <Link className="button button-primary" href={"/dashboard/provider/lead/" + request.id}>View Lead</Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
