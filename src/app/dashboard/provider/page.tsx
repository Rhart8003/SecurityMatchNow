import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/server";

function serviceName(value: unknown) {
  const relation = value as { name?: string } | null;
  return relation?.name || "Security Service";
}

export default async function ProviderDashboard() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  if (!userId) redirect(`/login?next=${encodeURIComponent("/dashboard/provider")}`);

  const { data: provider } = await supabase.from("providers").select("id,legal_name,status,accepting_leads").eq("owner_user_id", userId).maybeSingle();
  if (!provider) {
    return <main><Header /><div className="container dashboard"><div className="empty-state"><span className="eyebrow">PROVIDER DASHBOARD</span><h1>Create your provider profile.</h1><p>Your account is ready, but you haven’t registered a security company yet.</p><Link href="/provider/join" className="button button-primary">Create Provider Profile</Link></div></div></main>;
  }

  const [{ data: matches = [] }, { data: quotes = [] }, { data: subscription }] = await Promise.all([
    supabase.from("matches").select("id,request_id,match_score,sponsored,created_at,security_requests(id,zip_code,city,state,officer_count,officer_type,is_urgent,status,services(name))").eq("provider_id", provider.id).order("created_at", { ascending: false }),
    supabase.from("quotes").select("id,status,estimated_total").eq("provider_id", provider.id),
    supabase.from("subscriptions").select("plan,status").eq("provider_id", provider.id).maybeSingle(),
  ]);

  const jobsWon = (quotes || []).filter((quote) => quote.status === "accepted");
  const valueWon = jobsWon.reduce((sum, quote) => sum + Number(quote.estimated_total || 0), 0);

  return (
    <main>
      <Header />
      <div className="container dashboard">
        <div className="dashboard-title">
          <div><span className="eyebrow">PROVIDER DASHBOARD</span><h1>{provider.legal_name}</h1></div>
          <Link href="/providers" className="button button-dark">Plan: {(subscription?.plan || "basic").toUpperCase()}</Link>
        </div>

        {provider.status !== "active" && <div className="provider-status-banner"><b>Marketplace status: {provider.status}</b><span>Your profile is saved, but customer leads begin only after SecurityMatch activates the provider.</span></div>}

        <div className="stats">
          <div><b>{matches?.length || 0}</b><span>Matched leads</span></div>
          <div><b>{quotes?.length || 0}</b><span>Quotes sent</span></div>
          <div><b>{jobsWon.length}</b><span>Jobs won</span></div>
          <div><b>${valueWon.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b><span>Accepted quote value</span></div>
        </div>

        {!matches?.length ? (
          <div className="empty-state"><h2>No matched leads yet.</h2><p>{provider.status === "active" ? "New requests that match your service area will appear here." : "Complete verification and activation first; then matching leads will appear automatically."}</p></div>
        ) : (
          <div className="dashboard-list">
            {matches.map((match) => {
              const request = match.security_requests as unknown as { id: string; zip_code: string; city?: string; state?: string; officer_count: number; officer_type: string; is_urgent: boolean; status: string; services?: { name?: string } } | null;
              if (!request) return null;
              return (
                <div className="dashboard-card" key={match.id}>
                  <div>
                    <span className={request.is_urgent ? "urgent-badge" : "status-badge"}>{request.is_urgent ? "URGENT LEAD" : match.sponsored ? "PRIME LEAD" : "MATCHED LEAD"}</span>
                    <h3>{serviceName(request.services)}</h3>
                    <p>{request.city ? `${request.city}, ` : ""}{request.state || ""} {request.zip_code} · {request.officer_count} {request.officer_type} officer{request.officer_count === 1 ? "" : "s"}</p>
                  </div>
                  <div className="quote-count"><b>{Number(match.match_score).toFixed(0)}%</b><span>match</span></div>
                  <Link className="button button-primary" href={`/dashboard/provider/lead/${request.id}`}>View Lead</Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
