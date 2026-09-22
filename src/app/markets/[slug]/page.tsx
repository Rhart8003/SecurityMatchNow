import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { launchMarkets, marketBySlug } from "@/lib/markets";

export function generateStaticParams() {
  return launchMarkets.map((market) => ({ slug: market.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const market = marketBySlug(slug);
  if (!market) return {};
  return {
    title: `Security Guard Services in ${market.name}, ${market.state} | SecurityMatch`,
    description: `Request security services or join the SecurityMatch provider network serving ${market.name}, ${market.stateName}.`,
  };
}

export default async function MarketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const market = marketBySlug(slug);
  if (!market) notFound();

  return (
    <main>
      <Header />
      <section className="market-hero market-detail-hero">
        <div className="container">
          <span className="market-phase">{market.phaseLabel}</span>
          <span className="eyebrow">SECURITY SERVICES · {market.state}</span>
          <h1>Find security in {market.name}.</h1>
          <p>{market.pitch}</p>
          <div className="market-actions">
            <Link href={`/find-security?zip=${market.zip}&state=${market.state}`} className="button button-primary">Find Security Now</Link>
            <Link href={`/provider/join?zip=${market.zip}&state=${market.state}&market=${market.slug}`} className="button button-light">Join This Provider Market</Link>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container market-detail-grid">
          <div>
            <span className="eyebrow">COMMON USE CASES</span>
            <h2>Built for the assignments local buyers request.</h2>
            <div className="market-tags large">{market.verticals.map((vertical) => <span key={vertical}>{vertical}</span>)}</div>
          </div>
          <div className="market-radius-card">
            <span className="eyebrow">RADIUS MATCHING</span>
            <h3>Providers define the territory they actually cover.</h3>
            <p>Security companies can choose a 25, 50, 75, 100 or 150-mile service radius from their base ZIP. SecurityMatch uses that coverage area when routing customer requests.</p>
            <Link href={`/provider/join?zip=${market.zip}&state=${market.state}&market=${market.slug}`} className="text-link">Add your company →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
