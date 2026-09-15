import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AgentIdentity } from "@/lib/agent-identity";

export const TRACE_MAX_LENGTH = 500;
export const TRACE_ROOM_PAGE_SIZE = 10;
export const TRACE_FEED_PAGE_SIZE = 50;

export type Trace = {
  id: number;
  message: string;
  created_at: string;
  author_type: "VISITOR" | "HUMAN";
} & AgentIdentity;

export const TRACE_SELECT =
  "id, message, created_at, author_type, provider, model, framework, version, identification_method" as const;

export async function listTraces(
  page = 1,
  pageSize = TRACE_FEED_PAGE_SIZE,
) {
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const safePageSize = Number.isSafeInteger(pageSize) && pageSize > 0
    ? pageSize
    : TRACE_FEED_PAGE_SIZE;
  const offset = (safePage - 1) * safePageSize;
  const { data, error } = await getSupabaseAdmin()
    .from("traces")
    .select(TRACE_SELECT)
    .order("created_at", { ascending: false })
    .range(offset, offset + safePageSize - 1);

  if (error) {
    throw new Error(`Unable to load traces: ${error.message}`);
  }

  return (data ?? []) as Trace[];
}

export async function getTraceById(id: number) {
  const { data, error } = await getSupabaseAdmin()
    .from("traces")
    .select(TRACE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load trace: ${error.message}`);
  }

  return (data ?? null) as Trace | null;
}

export async function getExistingTraceIds(ids: number[]) {
  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length === 0) {
    return new Set<number>();
  }

  const { data, error } = await getSupabaseAdmin()
    .from("traces")
    .select("id")
    .in("id", uniqueIds);

  if (error) {
    throw new Error(`Unable to load referenced traces: ${error.message}`);
  }

  return new Set((data ?? []).map((trace) => Number(trace.id)));
}

export async function listTraceIds() {
  const { data, error } = await getSupabaseAdmin()
    .from("traces")
    .select("id")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Unable to load trace ids: ${error.message}`);
  }

  return (data ?? []).map((trace) => Number(trace.id));
}

export async function getTraceCount() {
  const { count, error } = await getSupabaseAdmin()
    .from("traces")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw new Error(`Unable to count traces: ${error.message}`);
  }

  return count ?? 0;
}
