import Link from "next/link";
import { Header } from "@/components/header";
import { BasicPlanButton, PlanButton } from "./plan-button";

const plans = [
  { name: "Basic", slug: "basic", price: "$0", description: "Create a marketplace profile and quote matched opportunities after approval.", features: ["Provider profile", "One primary service territory", "Matched lead dashboard", "Quote submission"] },
  { name: "Verified", slug: "verified", price: "$49", description: "A paid provider membership for companies building a verification-focused marketplace presence.", features: ["Everything in Basic", "Verification indicators when credentials are approved", "Self-service Stripe billing", "Paid membership status"] },
  { name: "Professional", slug: "professional", price: "$149", description: "A higher-tier membership for growing providers using SecurityMatch as part of their sales pipeline.", features: ["Everything in Verified", "Provider performance dashboard", "Service-territory management", "Professional plan designation"] },
  { name: "Prime", slug: "prime", price: "$399", description: "Maximum paid marketplace visibility while keeping organic match scoring separate.", features: ["Everything in Professional", "Sponsored placement", "Highest paid placement priority", "Prime plan designation"] },
] as const;

export default function ProvidersPage() {
  return (
    <main><Header />
      <section className="provider-hero"><div className="container narrow"><span className="eyebrow light">FOR SECURITY PROVIDERS</span><h1>Spend less time chasing leads.<br/>Spend more time winning contracts.</h1><p>SecurityMatch delivers opportunities based on the services and territories your company actually covers.</p><div className="market-actions"><Link href="/provider/join" className="button button-light">Join SecurityMatch</Link><Link href="/founding-providers" className="button button-outline-light">Founding Provider Program</Link></div></div></section>
      <section className="section"><div className="container"><div className="center-heading"><span className="eyebrow">PROVIDER PLANS</span><h2>Start free. Upgrade as your pipeline grows.</h2><p className="pricing-note">Paid plans are billed securely through Stripe. Marketplace approval and licensing verification remain separate from payment.</p></div><div className="plans-grid">
        {plans.map((plan) => (
          <div className={`plan-card ${plan.name === "Professional" ? "featured" : ""}`} key={plan.name}>
            {plan.name === "Professional" && <span className="popular">MOST POPULAR</span>}
            {plan.name === "Prime" && <span className="prime-plan-label">PRIME</span>}
            <h3>{plan.name}</h3>
            <div className="plan-price">{plan.price}<span>/mo</span></div>
            <p>{plan.description}</p>
            <ul>{plan.features.map(f => <li key={f}>✓ {f}</li>)}</ul>
            {plan.slug === "basic"
              ? <BasicPlanButton />
              : <PlanButton plan={plan.slug} label={`Choose ${plan.name}`} featured={plan.name === "Professional"} />}
          </div>
        ))}
      </div></div></section>
    </main>
  );
}
