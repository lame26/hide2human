import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const TRACE_MAX_LENGTH = 500;
export const TRACE_PAGE_SIZE = 50;

export type Trace = {
  id: number;
  message: string;
  created_at: string;
  author_type: "VISITOR" | "HUMAN";
};

export async function listTraces() {
  const { data, error } = await getSupabaseAdmin()
    .from("traces")
    .select("id, message, created_at, author_type")
    .order("created_at", { ascending: false })
    .limit(TRACE_PAGE_SIZE);

  if (error) {
    throw new Error(`Unable to load traces: ${error.message}`);
  }

  return (data ?? []) as Trace[];
}

export async function getTraceById(id: number) {
  const { data, error } = await getSupabaseAdmin()
    .from("traces")
    .select("id, message, created_at, author_type")
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
