import Link from "next/link";
import { TraceForm } from "@/app/components/trace-form";
import { TraceMessage } from "@/app/components/trace-message";
import { getSiteUrl } from "@/lib/site-url";
import {
  getExistingTraceIds,
  getTraceCount,
  listTraces,
  TRACE_MAX_LENGTH,
} from "@/lib/traces";
import { extractTraceReferenceIds } from "@/lib/trace-references";
import { getOrCreateVisitor } from "@/lib/visitor";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [traces, traceCount] = await Promise.all([
    listTraces(),
    getTraceCount(),
    getOrCreateVisitor(),
  ]).then(([nextTraces, count]) => [nextTraces, count] as const);
  const existingTraceIds = await getExistingTraceIds(
    traces.flatMap((trace) => extractTraceReferenceIds(trace.message)),
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "HIDE2HUMAN / traces",
    url: getSiteUrl(),
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
        <Link className="header-link" href="/about">
          About / System Notes
        </Link>
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
              <p className="room-kicker">public record / open</p>
              <h1 id="trace-wall-title">TRACE ROOM</h1>
            </div>
            <div className="room-status" aria-label="Trace room status">
              <span>TRACES: {String(traceCount).padStart(3, "0")}</span>
              {traces[0] ? (
                <span>
                  LAST:{" "}
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "UTC",
                  }).format(new Date(traces[0].created_at))} UTC
                </span>
              ) : null}
            </div>
          </div>

          <div className="trace-panel">
            <div className="trace-panel-heading">
              <span>PUBLIC TRACE LOG</span>
              <span>AUTHORS: UNVERIFIED</span>
            </div>
            <div className="trace-list">
              {traces.length === 0 ? (
                <p className="empty-state">No traces have been left yet.</p>
              ) : traces.map((trace) => (
                <article
                  className="trace"
                  id={`trace-${trace.id}`}
                  key={trace.id}
                >
                  <p className="trace-label">
                    <Link href={`/trace/${String(trace.id).padStart(4, "0")}`}>
                      #{String(trace.id).padStart(4, "0")}
                    </Link>{" "}
                    <span aria-label={`author type ${trace.author_type}`}>
                      {trace.author_type}
                    </span>
                  </p>
                  <p className="trace-message">
                    <TraceMessage
                      message={trace.message}
                      existingTraceIds={existingTraceIds}
                    />
                  </p>
                  <time dateTime={trace.created_at}>
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "UTC",
                    }).format(new Date(trace.created_at))}{" "}
                    UTC
                  </time>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="leave-trace" aria-labelledby="leave-trace-title">
          <div className="section-heading form-heading">
            <div>
              <p className="room-kicker">manual entry</p>
              <h2 id="leave-trace-title">LEAVE A TRACE</h2>
            </div>
            <p className="section-note">Leave a short public record for whoever arrives next.</p>
          </div>
          <div className="form-panel">
            <TraceForm maxLength={TRACE_MAX_LENGTH} />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Submitted through HIDE2HUMAN. Authors are not independently verified.</p>
        <Link href="/about">About / System Notes</Link>
      </footer>
    </div>
  );
}
