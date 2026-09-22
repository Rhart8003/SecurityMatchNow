import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/server";
import { ProviderActions } from "./provider-actions";
import { MarketMetrics } from "./market-metrics";

type PlanCode = "basic" | "verified" | "professional" | "prime";
const PLAN_MRR: Record<PlanCode, number> = {
  basic: 0,
  verified: 49,
  professional: 149,
  prime: 399,
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function dateLabel(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  if (!userId) redirect(`/login?next=${encodeURIComponent("/admin")}`);

  const { data: adminCheck, error: adminCheckError } = await supabase.rpc("current_user_is_admin");
  if (adminCheckError || !adminCheck) redirect("/dashboard/customer");

  const [providersResult, requestsResult, quotesResult, auditResult] = await Promise.all([
    supabase
      .from("providers")
      .select("id,legal_name,dba,business_email,business_phone,primary_state,license_number,license_expires_on,status,license_verified,insurance_verified,workers_comp_verified,created_at,subscriptions(plan,status)")
      .order("created_at", { ascending: false }),
    supabase
      .from("security_requests")
      .select("id,zip_code,city,state,officer_count,officer_type,is_urgent,status,created_at,services(name)")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("quotes")
      .select("id,status,estimated_total,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("admin_audit_log")
      .select("id,action,provider_id,details,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const providers = providersResult.data || [];
  const requests = requestsResult.data || [];
  const quotes = quotesResult.data || [];
  const audit = auditResult.data || [];

  const activeProviders = providers.filter((provider) => provider.status === "active").length;
  const pendingProviders = providers.filter((provider) => provider.status === "pending").length;
  const urgentRequests = requests.filter((request) => request.is_urgent && !["closed", "cancelled"].includes(request.status)).length;
  const awardedValue = quotes
    .filter((quote) => quote.status === "accepted")
    .reduce((sum, quote) => sum + Number(quote.estimated_total || 0), 0);
  const projectedMrr = providers.reduce((sum, provider) => {
    const relation = provider.subscriptions as unknown as { plan?: PlanCode; status?: string } | { plan?: PlanCode; status?: string }[] | null;
    const sub = Array.isArray(relation) ? relation[0] : relation;
    if (!sub || sub.status !== "active") return sum;
    return sum + PLAN_MRR[(sub.plan || "basic") as PlanCode];
  }, 0);

  return (
    <main>
      <Header />
      <div className="container admin-dashboard">
        <div className="dashboard-title">
          <div>
            <span className="eyebrow">SECURITYMATCH CONTROL CENTER</span>
            <h1>Marketplace administration</h1>
            <p className="admin-subtitle">Approve providers, verify credentials, manage plan placement, and watch marketplace activity.</p>
          </div>
          <Link href="/" className="button button-dark">View Marketplace</Link>
        </div>

        <div className="stats admin-stats">
          <div><b>{providers.length}</b><span>Registered providers</span></div>
          <div><b>{activeProviders}</b><span>Active providers</span></div>
          <div><b>{pendingProviders}</b><span>Awaiting review</span></div>
          <div><b>{urgentRequests}</b><span>Urgent requests</span></div>
          <div><b>{money(projectedMrr)}</b><span>Projected provider MRR</span></div>
          <div><b>{money(awardedValue)}</b><span>Accepted quote value</span></div>
        </div>

        <MarketMetrics />

        <section className="admin-section">
          <div className="section-heading admin-heading">
            <div><span className="eyebrow">PROVIDER OPERATIONS</span><h2>Provider review queue</h2></div>
            <p>Verification and status changes are logged automatically.</p>
          </div>

          {!providers.length ? (
            <div className="empty-state"><h3>No providers have registered yet.</h3><p>New provider applications will appear here.</p></div>
          ) : (
            <div className="admin-provider-list">
              {providers.map((provider) => {
                const relation = provider.subscriptions as unknown as { plan?: PlanCode; status?: string } | { plan?: PlanCode; status?: string }[] | null;
                const subscription = Array.isArray(relation) ? relation[0] : relation;
                const plan = (subscription?.plan || "basic") as PlanCode;
                return (
                  <article className="admin-provider-card" key={provider.id}>
                    <div className="admin-provider-main">
                      <div className="admin-provider-title-row">
                        <div>
                          <span className={`status-badge admin-status ${provider.status}`}>{provider.status.toUpperCase()}</span>
                          <h3>{provider.legal_name}</h3>
                          {provider.dba && <p>DBA: {provider.dba}</p>}
                        </div>
                        <div className="admin-plan-chip">{plan.toUpperCase()}</div>
                      </div>
                      <div className="admin-provider-meta">
                        <span>{provider.primary_state}</span>
                        <span>License: {provider.license_number || "Not entered"}</span>
                        <span>Expires: {dateLabel(provider.license_expires_on)}</span>
                        <span>{provider.business_email || "No email"}</span>
                        <span>{provider.business_phone || "No phone"}</span>
                      </div>
                    </div>
                    <ProviderActions
                      providerId={provider.id}
                      status={provider.status}
                      licenseVerified={provider.license_verified}
                      insuranceVerified={provider.insurance_verified}
                      workersCompVerified={provider.workers_comp_verified}
                      plan={plan}
                    />
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="admin-grid">
          <div className="admin-section admin-panel">
            <div className="section-heading admin-heading compact"><div><span className="eyebrow">DEMAND</span><h2>Recent requests</h2></div></div>
            {!requests.length ? <p className="admin-muted">No customer requests yet.</p> : (
              <div className="admin-activity-list">
                {requests.map((request) => {
                  const service = request.services as unknown as { name?: string } | null;
                  return (
                    <div className="admin-activity-row" key={request.id}>
                      <div>
                        <b>{service?.name || "Security service"}</b>
                        <span>{request.city ? `${request.city}, ` : ""}{request.state || ""} {request.zip_code} · {request.officer_count} {request.officer_type}</span>
                      </div>
                      <div className="admin-activity-right">
                        {request.is_urgent && <span className="urgent-badge">URGENT</span>}
                        <span>{request.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="admin-section admin-panel">
            <div className="section-heading admin-heading compact"><div><span className="eyebrow">AUDIT</span><h2>Recent admin activity</h2></div></div>
            {!audit.length ? <p className="admin-muted">No admin changes yet.</p> : (
              <div className="admin-activity-list">
                {audit.map((entry) => {
                  const details = (entry.details || {}) as Record<string, unknown>;
                  return (
                    <div className="admin-activity-row" key={entry.id}>
                      <div><b>Provider updated</b><span>{dateLabel(entry.created_at)}</span></div>
                      <div className="admin-activity-right"><span>{String(details.status || "")}</span><span>{String(details.plan || "")}</span></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
