import Link from "next/link";
import { Brand } from "@/components/brand";

export function Header() {
  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/find-security">Find Security</Link>
          <Link href="/providers">For Providers</Link>
          <Link href="/#how-it-works">How It Works</Link>
        </nav>
        <div className="nav-actions">
          <Link href="/login" className="text-link">Sign in</Link>
          <Link href="/provider/join" className="button button-small button-dark">Join as Provider</Link>
        </div>
      </div>
    </header>
  );
}
