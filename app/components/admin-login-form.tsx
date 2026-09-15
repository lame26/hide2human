"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await getSupabaseBrowser().auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("The email or password was not accepted.");
        return;
      }

      window.location.href = "/admin";
    } catch (loginError) {
      console.error("Admin login failed", loginError);
      setError("Admin login is not configured yet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="trace-form" onSubmit={submit}>
      <label htmlFor="admin-email">Email</label>
      <input
        id="admin-email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <label htmlFor="admin-password">Password</label>
      <input
        id="admin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="form-status" role="alert" aria-live="polite">
        {error}
      </p>
    </form>
  );
}
