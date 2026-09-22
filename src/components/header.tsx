import Link from "next/link";
import { Brand } from "@/components/brand";

export function Header() {
  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/#services">Services</Link>
          <Link href="/#how-it-works">How It Works</Link>
          <Link href="/providers">For Providers</Link>
          <Link href="/markets">Markets</Link>
        </nav>
        <div className="nav-actions">
          <Link href="/login" className="text-link">Sign in</Link>
          <Link href="/provider/join" className="button button-small button-outline-light header-provider-button">Join Provider</Link>
          <Link href="/find-security" className="button button-small button-primary header-find-button">Find Security</Link>
        </div>
      </div>
    </header>
  );
}
