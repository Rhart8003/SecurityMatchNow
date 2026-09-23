import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/server";

function serviceName(value: unknown) {
  const relation = value as { name?: string } | null;
  return relation?.name || "Security Service";
}

export default async function CustomerDashboard() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  if (!userId) redirect(`/login?next=${encodeURIComponent("/dashboard/customer")}`);

  const { data: requests = [] } = await supabase
    .from("security_requests")
    .select("id,zip_code,city,state,property_name,street_address,officer_count,officer_type,status,is_urgent,created_at,services(name)")
    .eq("customer_user_id", userId)
    .order("created_at", { ascending: false });

  const enriched = await Promise.all((requests || []).map(async (request) => {
    const [{ count: quoteCount }, { count: matchCount }] = await Promise.all([
      supabase.from("quotes").select("id", { count: "exact", head: true }).eq("request_id", request.id),
      supabase.from("matches").select("id", { count: "exact", head: true }).eq("request_id", request.id),
    ]);
    return { ...request, quoteCount: quoteCount || 0, matchCount: matchCount || 0 };
  }));

  const activeCount = enriched.filter((request) => !["closed", "cancelled"].includes(request.status)).length;
  const quoteTotal = enriched.reduce((sum, request) => sum + request.quoteCount, 0);
  const selectedCount = enriched.filter((request) => request.status === "awarded").length;

  return (
    <main>
      <Header />
      <div className="container dashboard">
        <div className="dashboard-title">
          <div><span className="eyebrow">CUSTOMER DASHBOARD</span><h1>Your security requests</h1></div>
          <Link href="/find-security" className="button button-primary">New Request</Link>
        </div>
        <div className="stats">
          <div><b>{activeCount}</b><span>Active requests</span></div>
          <div><b>{quoteTotal}</b><span>Quotes received</span></div>
          <div><b>{selectedCount}</b><span>Providers selected</span></div>
          <div><b>{enriched.reduce((sum, request) => sum + request.matchCount, 0)}</b><span>Provider matches</span></div>
        </div>

        {enriched.length === 0 ? (
          <div className="empty-state"><h2>No requests yet.</h2><p>Tell SecurityMatch what you need and we’ll check the provider network.</p><Link href="/find-security" className="button button-primary">Find Security</Link></div>
        ) : (
          <div className="dashboard-list">
            {enriched.map((request) => (
              <div className="dashboard-card" key={request.id}>
                <div>
                  <span className={request.is_urgent ? "urgent-badge" : "status-badge"}>{request.is_urgent ? "URGENT" : request.status.toUpperCase()}</span>
                  <h3>{serviceName(request.services)}</h3>
                  <p>{request.property_name ? request.property_name + " · " : ""}{request.city ? request.city + ", " : ""}{request.state || "US"} {request.zip_code} · {request.officer_count} {request.officer_type} officer{request.officer_count === 1 ? "" : "s"}</p>
                </div>
                <div className="quote-count"><b>{request.quoteCount}</b><span>quotes</span></div>
                <Link className="button button-ghost" href={`/dashboard/customer/request/${request.id}`}>{request.quoteCount ? "View Quotes" : "View Request"}</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
