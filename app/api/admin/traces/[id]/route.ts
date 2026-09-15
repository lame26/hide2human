import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid trace ID." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: trace, error: findError } = await supabase
    .from("traces")
    .select("id, visitor_id")
    .eq("id", id)
    .maybeSingle();

  if (findError) {
    throw new Error(`Unable to find trace: ${findError.message}`);
  }
  if (!trace) {
    return NextResponse.json({ error: "Trace not found." }, { status: 404 });
  }

  const { error: deleteError } = await supabase.from("traces").delete().eq("id", id);
  if (deleteError) {
    throw new Error(`Unable to delete trace: ${deleteError.message}`);
  }

  const { count: remainingCount, error: countError } = await supabase
    .from("traces")
    .select("id", { count: "exact", head: true })
    .eq("visitor_id", trace.visitor_id);
  if (countError) {
    throw new Error(`Unable to update visitor count: ${countError.message}`);
  }

  await supabase
    .from("visitors")
    .update({ trace_count: remainingCount ?? 0 })
    .eq("id", trace.visitor_id);

  return NextResponse.json({ deleted: true });
}
