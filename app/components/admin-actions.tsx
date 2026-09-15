"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function AdminActions() {
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const { error } = await getSupabaseBrowser().auth.signOut();
    if (error) {
      console.error("Admin logout failed", error);
      setLoading(false);
      return;
    }
    window.location.href = "/admin/login";
  }

  return (
    <button type="button" onClick={signOut} disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
