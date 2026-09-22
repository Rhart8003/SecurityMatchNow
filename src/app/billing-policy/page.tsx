import { LegalPage } from "@/components/legal-page";

export default function BillingPolicyPage() {
  return (
    <LegalPage eyebrow="BILLING" title="SecurityMatch Subscription & Billing Policy">
      <h2>1. Provider plans</h2>
      <p>SecurityMatch may offer free and paid provider plans. Current plan prices, included features, and billing intervals are displayed before checkout. Paid plans are separate from the price a provider charges customers for security services.</p>

      <h2>2. Recurring billing</h2>
      <p>Paid provider subscriptions renew automatically at the disclosed billing interval until canceled. By starting a paid subscription, you authorize the payment processor to charge the applicable recurring amount and any required taxes.</p>

      <h2>3. Changes and upgrades</h2>
      <p>Existing paid subscribers may be directed to the billing portal to manage payment methods, plan changes, invoices, and cancellation. Timing and proration for plan changes are controlled by the checkout or billing-portal terms shown at the time of the change.</p>

      <h2>4. Cancellation</h2>
      <p>You may cancel a paid subscription through the available billing-management flow. Cancellation stops future renewals but does not automatically reverse charges already incurred. Access to paid features may continue through the end of the paid billing period unless otherwise stated.</p>

      <h2>5. Refunds</h2>
      <p>Except where required by law or expressly stated at checkout, subscription charges are non-refundable once a billing period begins. SecurityMatch may issue discretionary credits or refunds in appropriate cases without creating an obligation to do so in other cases.</p>

      <h2>6. Failed payments and chargebacks</h2>
      <p>Paid features may be restricted or suspended when payment fails, a subscription expires, or a charge is disputed. Fraudulent or abusive chargebacks may result in account suspension.</p>

      <h2>7. Taxes</h2>
      <p>Displayed subscription prices may not include all taxes. Applicable taxes may be collected where required.</p>
    </LegalPage>
  );
}
