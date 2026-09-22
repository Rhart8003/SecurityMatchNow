import Link from "next/link";
import { Header } from "@/components/header";
import { launchMarkets } from "@/lib/markets";

export default function FoundingProvidersPage() {
  const launch = launchMarkets.filter((market) => market.phase === 1);

  return (
    <main>
      <Header />
      <section className="provider-hero">
        <div className="container narrow">
          <span className="eyebrow light">FOUNDING PROVIDER PROGRAM</span>
          <h1>Help build the first SecurityMatch markets.</h1>
          <p>Security companies in Fresno, Bakersfield and Sacramento can join the marketplace early, define their service radius, and receive matching opportunities after marketplace approval.</p>
          <div className="market-actions">
            <Link href="/provider/join" className="button button-light">Apply as a Founding Provider</Link>
            <Link href="/providers" className="button button-outline-light">Compare Provider Plans</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="center-heading">
            <span className="eyebrow">WHY JOIN EARLY</span>
            <h2>Start free and build your SecurityMatch presence.</h2>
          </div>
          <div className="steps">
            <div className="step"><span>01</span><h3>Founding-market recognition</h3><p>Approved early providers can be identified internally as part of the launch cohort as SecurityMatch builds local marketplace density.</p></div>
            <div className="step"><span>02</span><h3>Radius-based opportunities</h3><p>Set a 25, 50, 75, 100 or 150-mile service radius so your company receives opportunities that fit the territory you actually serve.</p></div>
            <div className="step"><span>03</span><h3>Upgrade only when it makes sense</h3><p>Basic enrollment is free. Paid plans are optional and add marketplace features after you decide the platform is producing value for your company.</p></div>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">FIRST THREE MARKETS</span><h2>Choose your launch territory.</h2></div>
          </div>
          <div className="market-grid">
            {launch.map((market) => (
              <article className="market-card" key={market.slug}>
                <span className="market-phase">Founding Market</span>
                <h2>{market.name}, {market.state}</h2>
                <p>{market.pitch}</p>
                <div className="market-tags">{market.verticals.map((vertical) => <span key={vertical}>{vertical}</span>)}</div>
                <Link className="button button-primary" href={"/provider/join?zip=" + market.zip + "&state=" + market.state + "&market=" + market.slug}>Join {market.name}</Link>
              </article>
            ))}
          </div>
          <p className="admin-muted" style={{ marginTop: 18 }}>Founding Provider participation does not replace licensing, insurance, workers’ compensation, or SecurityMatch marketplace approval requirements.</p>
        </div>
      </section>
    </main>
  );
}
