"use client";

import { useState } from "react";

export function DeleteTraceButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!window.confirm("Delete this trace?")) return;
    setLoading(true);
    const response = await fetch(`/api/admin/traces/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setLoading(false);
      return;
    }
    window.location.reload();
  }

  return (
    <button type="button" onClick={remove} disabled={loading}>
      {loading ? "Deleting..." : "Delete trace"}
    </button>
  );
}
