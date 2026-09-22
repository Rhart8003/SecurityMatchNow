import { LegalPage } from "@/components/legal-page";

export default function VerificationPolicyPage() {
  return (
    <LegalPage eyebrow="TRUST & SAFETY" title="SecurityMatch Provider Verification Policy">
      <h2>1. Purpose</h2>
      <p>Verification indicators help customers understand which provider information SecurityMatch has reviewed. They are informational marketplace signals and are not a guarantee of performance, safety, solvency, availability, or regulatory compliance.</p>

      <h2>2. Information SecurityMatch may review</h2>
      <p>Depending on the provider and jurisdiction, SecurityMatch may review company licensing information, insurance evidence, workers’ compensation evidence, business identity, service areas, and other documentation relevant to marketplace participation.</p>

      <h2>3. Verification status</h2>
      <p>SecurityMatch may mark individual verification categories separately. A provider should not be treated as fully verified merely because one category is verified. Customers should review the verification indicators shown on the provider profile or quote.</p>

      <h2>4. Ongoing responsibility</h2>
      <p>Providers remain responsible for maintaining current credentials at all times. SecurityMatch may require reverification, expire a badge, request updated documents, or suspend marketplace visibility when information becomes stale, inconsistent, or unavailable.</p>

      <h2>5. No endorsement</h2>
      <p>Verification means information was reviewed under SecurityMatch’s then-current process. It does not constitute a professional endorsement or a promise that a provider is suitable for every assignment. Customers remain responsible for evaluating the provider and the specific service contract.</p>

      <h2>6. Reporting concerns</h2>
      <p>Users should report suspected misrepresentation, expired credentials, fraud, or safety concerns through the contact or support channel displayed on SecurityMatchNow.com so the information can be reviewed.</p>
    </LegalPage>
  );
}
