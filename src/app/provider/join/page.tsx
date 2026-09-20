import { Header } from "@/components/header";
import { ProviderJoinForm } from "./join-form";

export default function ProviderJoinPage() {
  return (
    <main className="request-page">
      <Header />
      <div className="container request-page-grid">
        <div className="request-aside">
          <span className="eyebrow">PROVIDER NETWORK</span>
          <h2>Put your security company in front of active buyers.</h2>
          <p>Create your provider profile and define exactly where and what you cover.</p>
          <ul><li>Choose services you actually offer</li><li>Set ZIP or statewide coverage</li><li>Receive matching opportunities after approval</li><li>Quote only work you want</li></ul>
        </div>
        <ProviderJoinForm />
      </div>
    </main>
  );
}
