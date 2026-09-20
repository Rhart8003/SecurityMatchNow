import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/server";
import { QuoteForm } from "./quote-form";

export default async function ProviderLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  if (!userId) redirect(`/login?next=${encodeURIComponent(`/dashboard/provider/lead/${id}`)}`);

  const { data: provider } = await supabase.from("providers").select("id,legal_name,status").eq("owner_user_id", userId).maybeSingle();
  if (!provider) redirect("/provider/join");

  const [{ data: request }, { data: match }, { data: existing }] = await Promise.all([
    supabase.from("security_requests").select("id,zip_code,city,state,start_at,end_at,officer_count,officer_type,frequency,is_urgent,requirements,description,status,services(name)").eq("id", id).maybeSingle(),
    supabase.from("matches").select("match_score,location_score,service_score,availability_score,verification_score,responsiveness_score,rating_score,sponsored").eq("request_id", id).eq("provider_id", provider.id).maybeSingle(),
    supabase.from("quotes").select("id,hourly_rate,officer_count,minimum_hours,supervisor_fee,vehicle_fee,additional_charges,estimated_total,notes,status").eq("request_id", id).eq("provider_id", provider.id).maybeSingle(),
  ]);

  if (!request || !match) notFound();
  const service = request.services as unknown as { name?: string } | null;
  const reqs = Array.isArray(request.requirements) ? request.requirements as string[] : [];

  return (
    <main><Header /><div className="container dashboard">
      <Link href="/dashboard/provider" className="text-link">← Back to provider dashboard</Link>
      <div className="lead-layout">
        <section>
          <div className="detail-heading"><span className={request.is_urgent ? "urgent-badge" : "status-badge"}>{request.is_urgent ? "URGENT OPPORTUNITY" : "MATCHED OPPORTUNITY"}</span><h1>{service?.name || "Security Opportunity"}</h1><p>{request.city ? `${request.city}, ` : ""}{request.state} {request.zip_code}</p></div>
          <div className="match-score-box"><div><span>Organic match</span><b>{Number(match.match_score).toFixed(0)}%</b></div><div><span>Location</span><b>{Number(match.location_score).toFixed(0)}</b></div><div><span>Service</span><b>{Number(match.service_score).toFixed(0)}</b></div><div><span>Availability</span><b>{Number(match.availability_score).toFixed(0)}</b></div></div>
          <div className="lead-detail-card"><h3>Coverage requested</h3><dl><div><dt>Officers</dt><dd>{request.officer_count}</dd></div><div><dt>Officer type</dt><dd>{request.officer_type}</dd></div><div><dt>Frequency</dt><dd>{request.frequency.replace("_", " ")}</dd></div><div><dt>Status</dt><dd>{request.status}</dd></div>{request.start_at && <div><dt>Starts</dt><dd>{new Date(request.start_at).toLocaleString()}</dd></div>}{request.end_at && <div><dt>Ends</dt><dd>{new Date(request.end_at).toLocaleString()}</dd></div>}</dl></div>
          {reqs.length > 0 && <div className="lead-detail-card"><h3>Requirements</h3><div className="tag-row">{reqs.map((item) => <span key={item}>{item}</span>)}</div></div>}
          {request.description && <div className="lead-detail-card"><h3>Customer description</h3><p>{request.description}</p></div>}
        </section>
        <QuoteForm requestId={request.id} providerId={provider.id} defaultOfficerCount={request.officer_count} existing={existing} />
      </div>
    </div></main>
  );
}
