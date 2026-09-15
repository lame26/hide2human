import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { validateMessage } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    const body: unknown = contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
    const message = validateMessage(
      typeof body === "object" && body !== null && "message" in body
        ? body.message
        : undefined,
    );

    if ("error" in message) {
      return NextResponse.json({ error: message.error }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin().rpc("create_human_trace", {
      p_author_user_id: user.id,
      p_message: message.message,
    });

    if (error) {
      if (error.message.includes("human_rate_limited")) {
        return NextResponse.json(
          { error: "Please wait before leaving another Human trace." },
          { status: 429 },
        );
      }
      throw new Error(`Unable to save Human trace: ${error.message}`);
    }

    const requestHeaders = await headers();
    console.info("Human trace created", {
      traceId: data?.id,
      userAgent: requestHeaders.get("user-agent")?.slice(0, 120) ?? null,
    });

    return NextResponse.json({ trace: data }, { status: 201 });
  } catch (error) {
    console.error("Human trace submission failed", error);
    return NextResponse.json(
      { error: "The Human trace could not be saved right now." },
      { status: 500 },
    );
  }
}
