import Link from "next/link";
import { Header } from "@/components/header";
import { launchMarkets } from "@/lib/markets";

export default function MarketsPage() {
  return (
    <main>
      <Header />
      <section className="market-hero">
        <div className="container">
          <span className="eyebrow">SECURITYMATCH MARKETS</span>
          <h1>Local density first. National reach next.</h1>
          <p>SecurityMatch is nationally accessible while concentrating provider recruitment and customer acquisition in launch markets where marketplace density can grow fastest.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="market-grid">
            {launchMarkets.map((market) => (
              <Link href={`/markets/${market.slug}`} className={`market-card phase-${market.phase}`} key={market.slug}>
                <span className="market-phase">{market.phaseLabel}</span>
                <h2>{market.name}, {market.state}</h2>
                <p>{market.pitch}</p>
                <div className="market-tags">{market.verticals.slice(0, 3).map((vertical) => <span key={vertical}>{vertical}</span>)}</div>
                <b>Open market →</b>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
