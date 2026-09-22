import Link from "next/link";
import { Header } from "@/components/header";
import { BasicPlanButton, PlanButton } from "./plan-button";

const plans = [
  { name: "Basic", slug: "basic", price: "$0", description: "Create a profile and receive limited opportunities.", features: ["Basic provider profile", "Limited lead access", "1 service market"] },
  { name: "Verified", slug: "verified", price: "$49", description: "Build trust and expand lead access.", features: ["Verified provider badge", "Expanded lead access", "Customer reviews", "Multiple service areas"] },
  { name: "Professional", slug: "professional", price: "$149", description: "Priority access for growing security companies.", features: ["Priority lead access", "Unlimited service areas", "Enhanced company profile", "Quote analytics"] },
  { name: "Prime", slug: "prime", price: "$399", description: "Maximum marketplace visibility.", features: ["Sponsored placement", "Early access to selected leads", "Emergency lead priority", "Advanced analytics"] },
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
