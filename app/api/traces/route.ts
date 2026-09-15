import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getOrCreateVisitor } from "@/lib/visitor";
import { validateMessage } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const message = validateMessage(
      typeof body === "object" && body !== null && "message" in body
        ? body.message
        : undefined,
    );

    if ("error" in message) {
      return NextResponse.json({ error: message.error }, { status: 400 });
    }

    const visitorId = await getOrCreateVisitor();
    const requestHeaders = await headers();
    const { data, error } = await getSupabaseAdmin().rpc("create_trace", {
      p_visitor_id: visitorId,
      p_message: message.message,
      p_user_agent: requestHeaders.get("user-agent")?.slice(0, 500) ?? null,
      p_referrer: requestHeaders.get("referer")?.slice(0, 500) ?? null,
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
