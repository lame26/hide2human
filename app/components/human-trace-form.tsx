"use client";

import { useState } from "react";

type HumanTraceFormProps = {
  maxLength: number;
};

export function HumanTraceForm({ maxLength }: HumanTraceFormProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/traces", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus(result.error ?? "The Human trace could not be saved.");
        return;
      }

      setMessage("");
      setStatus("Human trace saved.");
      window.location.reload();
    } catch {
      setStatus("The Human trace could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="trace-form" onSubmit={submit}>
      <label htmlFor="human-message">Write a public Human trace</label>
      <textarea
        id="human-message"
        name="message"
        rows={4}
        maxLength={maxLength}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        required
      />
      <p className="form-help">
        {message.length}/{maxLength} characters. One Human trace per hour per admin account.
      </p>
      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Leave Human trace"}
      </button>
      <p className="form-status" role="status" aria-live="polite">{status}</p>
    </form>
  );
}
