import Link from "next/link";
import { Header } from "@/components/header";

export default function AuthErrorPage() {
  return (
    <main>
      <Header />
      <div className="container dashboard">
        <div className="empty-state">
          <span className="eyebrow">ACCOUNT CONFIRMATION</span>
          <h1>That confirmation link could not be completed.</h1>
          <p>The link may have expired or already been used. Return to sign in, or create the account again if needed.</p>
          <Link href="/login" className="button button-primary">Return to Sign In</Link>
        </div>
      </div>
    </main>
  );
}
