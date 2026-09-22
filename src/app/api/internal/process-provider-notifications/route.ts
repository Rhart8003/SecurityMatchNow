import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type OutboxRow = {
  id: string;
  to_email: string;
  subject: string;
  html_body: string;
  text_body: string;
  attempts: number;
};

function authorized(request: NextRequest) {
  const expected = process.env.NOTIFY_CRON_SECRET?.trim();
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return Boolean(expected && supplied && expected === supplied);
}

function workerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const dbKey = process.env.SECURITYMATCH_WEBHOOK_DB_KEY;

  if (!url || !publishable || !dbKey) {
    throw new Error("Notification database worker is not configured.");
  }

  return createClient(url, publishable, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-securitymatch-webhook-key": dbKey } },
  });
}

async function markFailed(db: ReturnType<typeof workerClient>, row: OutboxRow, message: string) {
  const attempts = Number(row.attempts || 0) + 1;
  const retryMinutes = Math.min(240, Math.max(5, Math.pow(2, Math.min(attempts, 5)) * 5));
  await db.from("provider_email_outbox").update({
    status: attempts >= 8 ? "failed" : "pending",
    attempts,
    last_error: message.slice(0, 1000),
    next_attempt_at: new Date(Date.now() + retryMinutes * 60_000).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", row.id);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!resendKey || !from) {
    return NextResponse.json({
      ok: true,
      configured: false,
      message: "Email delivery is queued and waiting for Resend configuration.",
    });
  }

  const db = workerClient();
  const now = new Date().toISOString();

  const { data, error } = await db
    .from("provider_email_outbox")
    .select("id,to_email,subject,html_body,text_body,attempts")
    .in("status", ["pending", "failed"])
    .lte("next_attempt_at", now)
    .order("created_at", { ascending: true })
    .limit(25);

  if (error) {
    console.error("Notification worker query failed", error);
    return NextResponse.json({ error: "Unable to read notification queue." }, { status: 500 });
  }

  const rows = (data || []) as OutboxRow[];
  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const { error: claimError } = await db.from("provider_email_outbox").update({
      status: "processing",
      updated_at: new Date().toISOString(),
    }).eq("id", row.id).in("status", ["pending", "failed"]);

    if (claimError) {
      failed += 1;
      continue;
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [row.to_email],
          subject: row.subject,
          html: row.html_body,
          text: row.text_body,
          tags: [{ name: "category", value: "provider_lead" }],
        }),
      });

      const body = await response.json().catch(() => ({})) as { id?: string; message?: string; error?: string };

      if (!response.ok) {
        throw new Error(body.message || body.error || `Resend returned HTTP ${response.status}`);
      }

      await db.from("provider_email_outbox").update({
        status: "sent",
        attempts: Number(row.attempts || 0) + 1,
        last_error: null,
        provider_message_id: body.id || null,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", row.id);

      sent += 1;
    } catch (error) {
      await markFailed(db, row, error instanceof Error ? error.message : "Unknown email delivery error");
      failed += 1;
    }
  }

  return NextResponse.json({ ok: true, configured: true, processed: rows.length, sent, failed });
}
