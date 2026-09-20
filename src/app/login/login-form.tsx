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

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
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
        <label>Password<input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} required /></label>
        {error && <div className="form-alert error">{error}</div>}
        {message && <div className="form-alert success">{message}</div>}
        <button className="button button-primary full-button" type="submit" disabled={loading}>{loading ? "Working…" : mode === "signin" ? "Sign In" : "Create Free Account"}</button>
      </form>
      <p className="auth-divider"><span>SecurityMatch account</span></p>
      <p className="auth-helper">Customers use the same account to request security and compare quotes. Security companies can create a provider profile after signing in.</p>
      <Link className="button button-ghost full-button" href={`/provider/join`}>I’m a Security Provider</Link>
    </>
  );
}
