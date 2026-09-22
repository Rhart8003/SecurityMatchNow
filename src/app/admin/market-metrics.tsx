import { createClient } from "@/lib/supabase/server";
import { launchMarkets } from "@/lib/markets";

type Plan = { plan?: string; status?: string };

export async function MarketMetrics() {
  const supabase = await createClient();

  const [requestsResult, matchesResult, areasResult, providersResult] = await Promise.all([
    supabase.from("security_requests").select("id,zip_code,state,status"),
    supabase.from("matches").select("request_id"),
    supabase.from("provider_service_areas").select("provider_id,zip_code,city,state,statewide"),
    supabase.from("providers").select("id,status,subscriptions(plan,status)"),
  ]);

  const requests = requestsResult.data || [];
  const matches = matchesResult.data || [];
  const areas = areasResult.data || [];
  const providers = providersResult.data || [];

  const matchedRequestIds = new Set(matches.map((match) => match.request_id));
  const providerById = new Map(providers.map((provider) => [provider.id, provider]));

  const rows = launchMarkets.map((market) => {
    const prefix = market.zip.slice(0, 3);

    const marketRequests = requests.filter((request) =>
      request.state === market.state && String(request.zip_code || "").startsWith(prefix)
    );

    const providerIds = new Set(
      areas
        .filter((area) =>
          area.state === market.state &&
          (
            area.statewide ||
            String(area.zip_code || "").startsWith(prefix) ||
            String(area.city || "").toLowerCase().includes(market.name.split("–")[0].toLowerCase())
          )
        )
        .map((area) => area.provider_id)
        .filter((id) => providerById.get(id)?.status === "active")
    );

    const paidProviders = [...providerIds].filter((id) => {
      const provider = providerById.get(id);
      const relation = provider?.subscriptions as unknown as Plan | Plan[] | null;
      const sub = Array.isArray(relation) ? relation[0] : relation;
      return Boolean(sub && sub.status === "active" && sub.plan && sub.plan !== "basic");
    }).length;

    const matchedRequests = marketRequests.filter((request) => matchedRequestIds.has(request.id)).length;
    const unmatchedRequests = marketRequests.filter((request) =>
      !matchedRequestIds.has(request.id) && !["closed", "cancelled"].includes(request.status)
    ).length;

    return {
      market,
      requests: marketRequests.length,
      matchedRequests,
      unmatchedRequests,
      activeProviders: providerIds.size,
      paidProviders,
    };
  });

  return (
    <section className="admin-section">
      <div className="section-heading admin-heading">
        <div><span className="eyebrow">MARKET MONETIZATION</span><h2>Rollout market scorecard</h2></div>
        <p>Demand and provider density are tracked separately so expansion spending can follow marketplace activity.</p>
      </div>
      <div className="market-metrics-table">
        <div className="market-metrics-row market-metrics-header">
          <span>Market</span><span>Requests</span><span>Matched</span><span>Unmatched</span><span>Active providers</span><span>Paid</span>
        </div>
        {rows.map((row) => (
          <div className="market-metrics-row" key={row.market.slug}>
            <span><b>{row.market.name}, {row.market.state}</b><small>{row.market.phaseLabel}</small></span>
            <span>{row.requests}</span>
            <span>{row.matchedRequests}</span>
            <span className={row.unmatchedRequests > 0 ? "metric-attention" : ""}>{row.unmatchedRequests}</span>
            <span>{row.activeProviders}</span>
            <span>{row.paidProviders}</span>
          </div>
        ))}
      </div>
      <p className="admin-muted market-metrics-note">Market counts use the launch ZIP prefix plus provider service-area records as an operational rollout indicator; they are not a census of an entire metro area.</p>
    </section>
  );
}
