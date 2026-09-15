import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function requireAdmin() {
  const authClient = await getSupabaseServer();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to check administrator access: ${error.message}`);
  }

  return data ? user : null;
}
