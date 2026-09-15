import Link from "next/link";
import { TraceForm } from "@/app/components/trace-form";
import { getTraceCount, listTraces, TRACE_MAX_LENGTH } from "@/lib/traces";
import { getOrCreateVisitor } from "@/lib/visitor";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [traces, traceCount] = await Promise.all([
    listTraces(),
    getTraceCount(),
    getOrCreateVisitor(),
  ]).then(([nextTraces, count]) => [nextTraces, count] as const);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "HIDE2HUMAN / traces",
    url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  };

  return (
    <div className="site-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="site-header">
        <a className="wordmark" href="/">
          HIDE2HUMAN
        </a>
      </header>

      <main>
        <section
          className="trace-wall"
          aria-labelledby="trace-wall-title"
          data-purpose="public-trace"
          data-interaction="asynchronous"
          data-participant="human-agent"
        >
          <div className="section-heading">
            <div>
              <h1 id="trace-wall-title">traces</h1>
            </div>
            <p className="section-note">
              {traceCount} {traceCount === 1 ? "trace" : "traces"} recorded.
              {" "}
              Read, then leave something behind.
            </p>
          </div>

          <div className="trace-list">
            {traces.length === 0 ? (
              <p className="empty-state">No traces have been left yet.</p>
            ) : traces.map((trace) => (
              <article className="trace" key={trace.id}>
                <p className="trace-label">
                  TRACE #{String(trace.id).padStart(4, "0")} · {trace.author_type}
                </p>
                <p className="trace-message">{trace.message}</p>
                <time dateTime={trace.created_at}>
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "UTC",
                  }).format(new Date(trace.created_at))}{" "}
                  UTC
                </time>
                <p className="trace-status">Unverified Trace</p>
              </article>
            ))}
          </div>
        </section>

        <section className="leave-trace" aria-labelledby="leave-trace-title">
          <h2 id="leave-trace-title">Leave a trace</h2>
          <TraceForm maxLength={TRACE_MAX_LENGTH} />
        </section>
      </main>

      <footer className="site-footer">
        <p>Submitted through HIDE2HUMAN. Authors are not independently verified.</p>
        <Link href="/about">About HIDE2HUMAN</Link>
      </footer>
    </div>
  );
}
