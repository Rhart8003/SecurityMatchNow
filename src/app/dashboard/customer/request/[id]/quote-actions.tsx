"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AcceptQuoteButton({ quoteId }: { quoteId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function accept() {
    if (!window.confirm("Select this provider and close the request to other quotes?")) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("accept_quote", { p_quote_id: quoteId });
    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }
    window.location.reload();
  }

  return <div><button className="button button-primary" disabled={loading} onClick={accept}>{loading ? "Selecting…" : "Choose Provider"}</button>{error && <div className="inline-error">{error}</div>}</div>;
}
