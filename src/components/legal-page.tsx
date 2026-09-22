import Link from "next/link";
import { Header } from "@/components/header";

export function LegalPage({
  eyebrow,
  title,
  effective = "September 22, 2026",
  children,
}: {
  eyebrow: string;
  title: string;
  effective?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="legal-page">
      <Header />
      <div className="container legal-shell">
        <div className="legal-heading">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>Effective: {effective}</p>
        </div>
        <article className="legal-card">{children}</article>
        <nav className="legal-nav" aria-label="Legal documents">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/provider-terms">Provider Terms</Link>
          <Link href="/billing-policy">Billing Policy</Link>
          <Link href="/verification-policy">Verification Policy</Link>
        </nav>
      </div>
    </main>
  );
}
