import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/server";
import { AcceptQuoteButton } from "./quote-actions";

export default async function CustomerRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect(`/login?next=${encodeURIComponent(`/dashboard/customer/request/${id}`)}`);

  const { data: request } = await supabase.from("security_requests").select("id,zip_code,state,officer_count,officer_type,status,selected_provider_id,description,services(name)").eq("id", id).maybeSingle();
  if (!request) notFound();

  const { data: quoteRows } = await supabase.from("quotes").select("id,provider_id,hourly_rate,officer_count,minimum_hours,supervisor_fee,vehicle_fee,additional_charges,estimated_total,notes,expires_at,status,providers(legal_name,dba,rating,license_verified,insurance_verified,workers_comp_verified)").eq("request_id", id).order("estimated_total", { ascending: true });
  const quotes = quoteRows ?? [];
  const service = request.services as unknown as { name?: string } | null;

  return (
    <main><Header /><div className="container dashboard">
      <Link href="/dashboard/customer" className="text-link">← Back to dashboard</Link>
      <div className="detail-heading"><span className="eyebrow">QUOTE COMPARISON</span><h1>{service?.name || "Security Request"}</h1><p>{request.zip_code}, {request.state} · {request.officer_count} {request.officer_type} officer{request.officer_count === 1 ? "" : "s"}</p></div>
      {request.description && <div className="request-description"><b>Assignment details</b><p>{request.description}</p></div>}

      {!quotes.length ? <div className="empty-state"><h2>No quotes yet.</h2><p>Matched providers can submit proposals from their SecurityMatch dashboards.</p></div> : (
        <div className="quote-grid">
          {quotes.map((quote) => {
            const provider = quote.providers as unknown as { legal_name?: string; dba?: string; rating?: number; license_verified?: boolean; insurance_verified?: boolean; workers_comp_verified?: boolean } | null;
            const selected = quote.status === "accepted" || request.selected_provider_id === quote.provider_id;
            return <article className={`quote-card ${selected ? "selected-quote" : ""}`} key={quote.id}>
              <div className="quote-card-head"><div><span className={selected ? "status-badge" : "verified-pill"}>{selected ? "SELECTED" : "QUOTE"}</span><h2>{provider?.dba || provider?.legal_name || "Security Provider"}</h2></div><div className="quote-total">${Number(quote.estimated_total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div className="verification-row"><span>{provider?.license_verified ? "✓" : "○"} License</span><span>{provider?.insurance_verified ? "✓" : "○"} Insurance</span><span>{provider?.workers_comp_verified ? "✓" : "○"} Workers’ Comp</span></div>
              <div className="quote-details"><span>Hourly rate: {quote.hourly_rate ? `$${Number(quote.hourly_rate).toFixed(2)}` : "—"}</span><span>Officers: {quote.officer_count || request.officer_count}</span><span>Minimum hours: {quote.minimum_hours || "—"}</span></div>
              {quote.notes && <p className="quote-notes">{quote.notes}</p>}
              {request.status !== "awarded" && quote.status !== "declined" && <AcceptQuoteButton quoteId={quote.id} />}
            </article>;
          })}
        </div>
      )}
    </div></main>
  );
}
