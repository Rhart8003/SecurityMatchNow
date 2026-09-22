import { Header } from "@/components/header";
import { marketBySlug } from "@/lib/markets";
import { ProviderJoinForm } from "./join-form";

export default async function ProviderJoinPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const zip = typeof params.zip === "string" ? params.zip : "";
  const state = typeof params.state === "string" ? params.state : "CA";
  const marketSlug = typeof params.market === "string" ? params.market : "";
  const market = marketSlug ? marketBySlug(marketSlug) : undefined;

  return (
    <main className="request-page">
      <Header />
      <div className="container request-page-grid">
        <div className="request-aside">
          <span className="eyebrow">PROVIDER NETWORK</span>
          <h2>{market ? `Join the ${market.name} provider market.` : "Put your security company in front of active buyers."}</h2>
          <p>Create your provider profile and define exactly where and what you cover.</p>
          <ul><li>Choose services you actually offer</li><li>Set a 25–150 mile service radius or statewide coverage</li><li>Receive matching opportunities after approval</li><li>Quote only work you want</li></ul>
        </div>
        <ProviderJoinForm initialZip={zip} initialState={state} marketName={market?.name} />
      </div>
    </main>
  );
}
