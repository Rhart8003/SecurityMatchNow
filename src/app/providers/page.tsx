import Link from "next/link";
import { Header } from "@/components/header";

const plans = [
  { name: "Basic", price: "$0", description: "Create a profile and receive limited opportunities.", features: ["Basic provider profile", "Limited lead access", "1 service market"] },
  { name: "Verified", price: "$49", description: "Build trust and expand lead access.", features: ["Verified provider badge", "Expanded lead access", "Customer reviews", "Multiple service areas"] },
  { name: "Professional", price: "$149", description: "Priority access for growing security companies.", features: ["Priority lead access", "Unlimited service areas", "Enhanced company profile", "Quote analytics"] },
  { name: "Prime", price: "$399", description: "Maximum marketplace visibility.", features: ["Sponsored placement", "Early access to selected leads", "Emergency lead priority", "Advanced analytics"] },
];

export default function ProvidersPage() {
  return (
    <main><Header />
      <section className="provider-hero"><div className="container narrow"><span className="eyebrow light">FOR SECURITY PROVIDERS</span><h1>Spend less time chasing leads.<br/>Spend more time winning contracts.</h1><p>SecurityMatch delivers opportunities based on the services and territories your company actually covers.</p><Link href="/provider/join" className="button button-light">Join SecurityMatch</Link></div></section>
      <section className="section"><div className="container"><div className="center-heading"><span className="eyebrow">PROVIDER PLANS</span><h2>Start free. Upgrade as your pipeline grows.</h2></div><div className="plans-grid">{plans.map((plan) => <div className={`plan-card ${plan.name === "Professional" ? "featured" : ""}`} key={plan.name}>{plan.name === "Professional" && <span className="popular">MOST POPULAR</span>}<h3>{plan.name}</h3><div className="plan-price">{plan.price}<span>/mo</span></div><p>{plan.description}</p><ul>{plan.features.map(f => <li key={f}>✓ {f}</li>)}</ul><Link href="/provider/join" className={`button ${plan.name === "Professional" ? "button-primary" : "button-ghost"}`}>Choose {plan.name}</Link></div>)}</div></div></section>
    </main>
  );
}
