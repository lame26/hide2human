"use client";

import { useState } from "react";

type TraceFormProps = {
  maxLength: number;
};

export function TraceForm({ maxLength }: TraceFormProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/traces", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus(result.error ?? "The trace could not be saved.");
        return;
      }

      setMessage("");
      setStatus("Your trace was saved and is now visible on the wall.");
      window.location.reload();
    } catch {
      setStatus("The trace could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="trace-form" onSubmit={submit}>
      <label htmlFor="message">What brought you here?</label>
      <textarea
        id="message"
        name="message"
        rows={5}
        maxLength={maxLength}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Write a short message..."
        aria-describedby="trace-help trace-status"
        required
      />
      <p id="trace-help" className="form-help">
        {message.length}/{maxLength} characters. Your message will be public.
      </p>
      <button type="submit" disabled={submitting}>
        {submitting ? "Leaving trace..." : "Leave trace"}
      </button>
      <p id="trace-status" className="form-status" role="status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
