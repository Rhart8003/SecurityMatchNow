"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ initialMode = "signin", next = "/dashboard/customer" }: { initialMode?: "signin" | "signup"; next?: string }) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const supabase = createClient();

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      window.location.assign(next);
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy to create an account.");
      setLoading(false);
      return;
    }

    const acceptedAt = new Date().toISOString();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          terms_accepted_at: acceptedAt,
          terms_version: "2026-09-22",
          privacy_accepted_at: acceptedAt,
          privacy_version: "2026-09-22",
        },
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.assign(next);
      return;
    }

    setMessage("Account created. Check your email to confirm your address, then return here to sign in.");
    setMode("signin");
    setLoading(false);
  }

  return (
    <>
      <div className="auth-tabs" role="tablist" aria-label="Account action">
        <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>Sign in</button>
        <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Create account</button>
      </div>
      <form onSubmit={submit}>
        <label>Email<input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
        <label>Password<input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={mode === "signup" ? 8 : 6} autoComplete={mode === "signin" ? "current-password" : "new-password"} required /></label>
        {mode === "signup" && (
          <label className="consent provider-terms-consent">
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} required /> I agree to the <Link href="/terms" target="_blank">Terms of Service</Link> and acknowledge the <Link href="/privacy" target="_blank">Privacy Policy</Link>.
          </label>
        )}
        {error && <div className="form-alert error">{error}</div>}
        {message && <div className="form-alert success">{message}</div>}
        <button className="button button-primary full-button" type="submit" disabled={loading}>{loading ? "Working…" : mode === "signin" ? "Sign In" : "Create Free Account"}</button>
      </form>
      <p className="auth-divider"><span>SecurityMatch account</span></p>
      <p className="auth-helper">Customers use the same account to request security and compare quotes. Security companies can create a provider profile after signing in.</p>
      <p className="auth-legal">Marketplace participation is also subject to the <Link href="/terms">Terms</Link>, <Link href="/billing-policy">Billing Policy</Link>, and <Link href="/verification-policy">Verification Policy</Link>.</p>
      <Link className="button button-ghost full-button" href={`/provider/join`}>I’m a Security Provider</Link>
    </>
  );
}
