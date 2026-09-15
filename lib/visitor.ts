import { cookies, headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const VISITOR_COOKIE = "h2h_visitor";

export async function getOrCreateVisitor() {
  const cookieStore = await cookies();
  const existingId = cookieStore.get(VISITOR_COOKIE)?.value;
  if (!existingId || !isUuid(existingId)) {
    throw new Error("Visitor cookie is missing or invalid.");
  }
  const visitorId = existingId;
  const requestHeaders = await headers();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.rpc("record_visit", {
    p_visitor_id: visitorId,
    p_path: "/",
    p_user_agent: truncate(requestHeaders.get("user-agent")),
    p_referrer: truncate(requestHeaders.get("referer")),
  });

  if (error) {
    throw new Error(`Unable to record visitor: ${error.message}`);
  }

  return visitorId;
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function truncate(value: string | null) {
  return value?.slice(0, 500) || null;
}
