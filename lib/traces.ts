import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const TRACE_MAX_LENGTH = 500;
export const TRACE_PAGE_SIZE = 50;

export type Trace = {
  id: number;
  message: string;
  created_at: string;
};

export async function listTraces() {
  const { data, error } = await getSupabaseAdmin()
    .from("traces")
    .select("id, message, created_at")
    .order("created_at", { ascending: false })
    .limit(TRACE_PAGE_SIZE);

  if (error) {
    throw new Error(`Unable to load traces: ${error.message}`);
  }

  return (data ?? []) as Trace[];
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
