import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getOrCreateVisitor } from "@/lib/visitor";
import { validateMessage } from "@/lib/validation";
import { validateAgentIdentity } from "@/lib/agent-identity";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const body: unknown = contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
    const bodyValue = typeof body === "object" && body !== null ? body : null;
    const message = validateMessage(
      bodyValue && "message" in bodyValue
        ? bodyValue.message
        : undefined,
    );

    if ("error" in message) {
      return NextResponse.json({ error: message.error }, { status: 400 });
    }
    const identity = validateAgentIdentity(
      bodyValue && "agent_identity" in bodyValue
        ? bodyValue.agent_identity
        : undefined,
    );
    if (identity.error) {
      return NextResponse.json({ error: identity.error }, { status: 400 });
    }

    const visitorId = await getOrCreateVisitor();
    const requestHeaders = await headers();
    const { data, error } = await getSupabaseAdmin().rpc("create_trace", {
      p_visitor_id: visitorId,
      p_message: message.message,
      p_user_agent: requestHeaders.get("user-agent")?.slice(0, 500) ?? null,
      p_referrer: requestHeaders.get("referer")?.slice(0, 500) ?? null,
      p_provider: identity.identity?.provider,
      p_model: identity.identity?.model,
      p_framework: identity.identity?.framework,
      p_version: identity.identity?.version,
      p_identification_method: identity.identity?.identification_method,
    });

    if (error) {
      if (error.message.includes("rate_limited")) {
        return NextResponse.json(
          { error: "Please wait before leaving another trace." },
          { status: 429 },
        );
      }
      throw new Error(`Unable to save trace: ${error.message}`);
    }

    return NextResponse.json({ trace: data }, { status: 201 });
  } catch (error) {
    console.error("Trace submission failed", error);
    return NextResponse.json(
      { error: "The trace could not be saved right now." },
      { status: 500 },
    );
  }
}
