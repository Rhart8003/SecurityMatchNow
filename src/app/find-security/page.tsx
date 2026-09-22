import { Header } from "@/components/header";
import { RequestForm } from "./request-form";

export default async function FindSecurityPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const zip = typeof params.zip === "string" ? params.zip : "";
  const state = typeof params.state === "string" ? params.state : "CA";
  const service = typeof params.service === "string" ? params.service : "";
  const urgent = params.urgent === "1";
  const resume = params.resume === "1";

  return (
    <main className="request-page">
      <Header />
      <div className="container request-page-grid">
        <div className="request-aside">
          <span className="eyebrow">SECURITYMATCH</span>
          <h2>{urgent ? "Urgent coverage, routed fast." : "One request. Qualified local providers."}</h2>
          <p>We use your ZIP code, service requirements and provider coverage radius to identify security companies positioned to cover the assignment.</p>
          <ul><li>Radius-based provider matching</li><li>Provider verification framework</li><li>Multiple quotes in one place</li><li>No obligation to choose a provider</li></ul>
          {urgent && <div className="urgent-box"><b>Urgent request</b><span>Emergency requests will be flagged for providers that accept rapid-response assignments.</span></div>}
        </div>
        <RequestForm initialZip={zip} initialState={state} initialService={service} urgent={urgent} resume={resume} />
      </div>
    </main>
  );
}
