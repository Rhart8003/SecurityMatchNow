import { LegalPage } from "@/components/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="PRIVACY" title="SecurityMatch Privacy Policy">
      <h2>1. Information we collect</h2>
      <p>SecurityMatch may collect account details, contact information, business and licensing information, security-request details, service locations, provider service areas, quotes, subscription information, communications, device and usage data, and records needed to operate or secure the marketplace.</p>

      <h2>2. Payment information</h2>
      <p>Payment card information is processed by our payment processor. SecurityMatch receives transaction identifiers, subscription status, plan information, customer identifiers, and related billing metadata needed to administer subscriptions, but does not need to store full payment-card numbers in the application database.</p>

      <h2>3. How we use information</h2>
      <p>We use information to create accounts, match requests with providers, display provider information, process quotes, administer subscriptions, send transactional messages, support users, prevent abuse, improve marketplace performance, enforce policies, and comply with legal obligations.</p>

      <h2>4. How information is shared</h2>
      <p>Customer request information may be shared with providers matched to that request. Provider profile and verification information may be shown to customers. We also use service providers for hosting, authentication, database operations, payments, email delivery, analytics, security, and related infrastructure. These providers process information for the services they perform for SecurityMatch.</p>

      <h2>5. Public and marketplace information</h2>
      <p>Information intentionally submitted for a provider marketplace profile may be visible to customers or other users as part of the Platform. Do not submit confidential information in public profile fields.</p>

      <h2>6. Data retention</h2>
      <p>We retain information for as long as reasonably needed to operate the Platform, maintain transaction and audit records, resolve disputes, enforce agreements, meet legal obligations, and protect the marketplace. Retention periods may differ by data type and legal requirement.</p>

      <h2>7. Security</h2>
      <p>We use technical and organizational safeguards appropriate to the nature of the Platform. No internet or storage system can be guaranteed completely secure, so users should protect account credentials and promptly report suspected misuse.</p>

      <h2>8. Your choices and rights</h2>
      <p>You may update certain account information through the Platform. Depending on where you live and which privacy laws apply, you may also have rights to request access, correction, deletion, portability, or information about certain uses or disclosures of personal information. Requests may be subject to identity verification and legal exceptions.</p>

      <h2>9. California privacy notice</h2>
      <p>Where the California Consumer Privacy Act or similar law applies, California residents may have additional rights regarding personal information. SecurityMatch does not currently sell personal information for money. If our practices change in a way that creates additional opt-out rights, we will update this Policy and provide the required controls.</p>

      <h2>10. Children</h2>
      <p>SecurityMatch is intended for business and adult users and is not directed to children under 13. We do not knowingly solicit children to create marketplace accounts.</p>

      <h2>11. Changes and contact</h2>
      <p>We may update this Privacy Policy as the Platform and applicable requirements evolve. Privacy questions or requests may be submitted through the contact information or support channel displayed on SecurityMatchNow.com.</p>
    </LegalPage>
  );
}
