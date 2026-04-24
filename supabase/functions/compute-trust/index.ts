// ============================================================
// COMPUTE-TRUST — Supabase Edge Function
// Recomputes a vendor's trust_score from trust_events + certs
// Called via: supabase.functions.invoke('compute-trust', { body: { alias } })
// ============================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Cert score lookup (mirrors lib/types.ts CERT_SCORES)
const CERT_SCORES: Record<string, number> = {
  OSCP: 20,
  CISSP: 20,
  CISM: 18,
  CEH: 15,
  GPEN: 15,
  GWAPT: 14,
  ISO27001: 12,
  CompTIA_Security: 10,
  eJPT: 8,
  other: 5,
};

Deno.serve(async (req: Request) => {
  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { alias } = await req.json();
    if (!alias || typeof alias !== "string") {
      return new Response(JSON.stringify({ error: "alias is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Sum all trust_events score_delta for this alias
    const { data: events, error: eventsError } = await supabase
      .from("trust_events")
      .select("score_delta")
      .eq("alias", alias);

    if (eventsError) {
      return new Response(JSON.stringify({ error: eventsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const eventScore = (events || []).reduce(
      (sum: number, e: { score_delta: number }) => sum + (e.score_delta || 0),
      0
    );

    // 2. Sum verified certification scores
    const { data: certs, error: certsError } = await supabase
      .from("certifications")
      .select("cert_type, verified")
      .eq("vendor_alias", alias);

    if (certsError) {
      return new Response(JSON.stringify({ error: certsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const certScore = (certs || [])
      .filter((c: { verified: boolean }) => c.verified)
      .reduce(
        (sum: number, c: { cert_type: string }) =>
          sum + (CERT_SCORES[c.cert_type] || CERT_SCORES.other),
        0
      );

    // 3. Base score (50) + events + certs, clamped to 0-100
    const rawScore = 50 + eventScore + certScore;
    const finalScore = Math.max(0, Math.min(100, rawScore));

    // 4. Update the profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ trust_score: finalScore, updated_at: new Date().toISOString() })
      .eq("alias", alias);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Also update alias_directory if it exists
    await supabase
      .from("alias_directory")
      .update({ trust_score: finalScore })
      .eq("alias", alias);

    return new Response(
      JSON.stringify({
        alias,
        trust_score: finalScore,
        breakdown: {
          base: 50,
          events: eventScore,
          certifications: certScore,
          raw: rawScore,
          clamped: finalScore,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", Connection: "keep-alive" },
      }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
