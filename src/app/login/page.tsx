import Link from "next/link";
import { Brand } from "@/components/brand";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const requestedNext = typeof params.next === "string" ? params.next : "/dashboard/customer";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard/customer";
  const initialMode = params.mode === "signup" ? "signup" : "signin";

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Brand />
        <span className="eyebrow">SECURITYMATCH ACCOUNT</span>
        <h1>{initialMode === "signup" ? "Create your account" : "Welcome back"}</h1>
        <LoginForm initialMode={initialMode} next={next} />
        <Link className="text-link auth-home" href="/">← Back to home</Link>
      </div>
    </main>
  );
}
