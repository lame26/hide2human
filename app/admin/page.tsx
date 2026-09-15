import Link from "next/link";
import { AdminActions } from "@/app/components/admin-actions";
import { DeleteTraceButton } from "@/app/components/delete-trace-button";
import { HumanTraceForm } from "@/app/components/human-trace-form";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TRACE_MAX_LENGTH } from "@/lib/traces";

export const metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdmin();

  if (!user) {
    return (
      <div className="site-shell">
        <header className="site-header">
          <a className="wordmark" href="/">HIDE2HUMAN</a>
          <p className="eyebrow">Admin</p>
        </header>
        <main>
          <section className="intro" aria-labelledby="admin-title">
            <p className="kicker">Restricted area</p>
            <h1 id="admin-title">Sign in required</h1>
            <p><Link href="/admin/login">Go to admin login</Link></p>
          </section>
        </main>
      </div>
    );
  }

  const supabase = getSupabaseAdmin();
  const [
    { data: traces },
    { count: totalTraces },
    { count: uniqueVisitors },
    { data: visitors },
    { data: visitEvents },
    { count: humanTraceCount },
    { data: firstTraceRow },
    { data: latestTraceRow },
    { count: totalVisits },
  ] = await Promise.all([
    supabase
      .from("traces")
      .select("id, message, created_at, visitor_id, author_type")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("traces").select("id", { count: "exact", head: true }),
    supabase.from("visitors").select("id", { count: "exact", head: true }),
    supabase.from("visitors").select("visit_count, trace_count").limit(10000),
    supabase
      .from("visit_events")
      .select("id, visitor_id, path, user_agent, referrer, created_at")
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("traces")
      .select("id", { count: "exact", head: true })
      .eq("author_type", "HUMAN"),
    supabase.from("traces").select("created_at").order("created_at", { ascending: true }).limit(1),
    supabase.from("traces").select("created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("visit_events").select("id", { count: "exact", head: true }),
  ]);
  const traceRows = traces ?? [];
  const firstTrace = firstTraceRow?.[0]?.created_at ?? null;
  const latestTrace = latestTraceRow?.[0]?.created_at ?? null;
  const tracesPerVisitor = visitors?.length
    ? (visitors.reduce((sum, visitor) => sum + visitor.trace_count, 0) / visitors.length).toFixed(2)
    : "0.00";
  const timeline = [
    ...traceRows.map((trace) => ({
      id: `trace-${trace.id}`,
      created_at: trace.created_at,
      label: `TRACE #${trace.id} · ${trace.author_type}`,
      detail: trace.author_type === "VISITOR"
        ? `Visitor ${trace.visitor_id}`
        : "Human administrator",
    })),
    ...(visitEvents ?? []).map((visit) => ({
      id: `visit-${visit.id}`,
      created_at: visit.created_at,
      label: `VISIT ${visit.path}`,
      detail: `Visitor ${visit.visitor_id}`,
    })),
  ].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="/">
          HIDE2HUMAN
        </a>
        <p className="eyebrow">Admin</p>
      </header>

      <main>
        <section className="intro" aria-labelledby="admin-title">
          <p className="kicker">Restricted area</p>
          <h1 id="admin-title">Admin dashboard</h1>
          <p>Signed in as {user.email}.</p>
          <div className="admin-toolbar"><AdminActions /><Link href="/">View public wall</Link></div>
        </section>
        <section aria-labelledby="stats-title">
          <p className="kicker">Overview</p>
          <h2 id="stats-title">Observed activity</h2>
          <div className="stats-grid">
            <p>Total visits <strong>{totalVisits ?? 0}</strong></p>
            <p>Total traces <strong>{totalTraces ?? 0}</strong></p>
            <p>Human traces <strong>{humanTraceCount ?? 0}</strong></p>
            <p>Unique visitors <strong>{uniqueVisitors ?? 0}</strong></p>
            <p>Traces per visitor <strong>{tracesPerVisitor}</strong></p>
            <p>First trace <strong>{firstTrace ?? "None"}</strong></p>
            <p>Latest trace <strong>{latestTrace ?? "None"}</strong></p>
          </div>
        </section>
        <section aria-labelledby="traces-title">
          <p className="kicker">Moderation</p>
          <h2 id="traces-title">Recent traces</h2>
          <div className="trace-list">
            {traceRows.map((trace) => (
              <article className="trace" key={trace.id}>
                <p className="trace-label">TRACE #{trace.id} · {trace.author_type}</p>
                <p className="trace-message">{trace.message}</p>
                <time dateTime={trace.created_at}>{trace.created_at}</time>
                <p className="trace-status">
                  {trace.author_type === "VISITOR"
                    ? `Visitor ${trace.visitor_id}`
                    : "Human administrator"}
                </p>
                <DeleteTraceButton id={trace.id} />
              </article>
            ))}
          </div>
        </section>
        <section aria-labelledby="human-trace-title">
          <p className="kicker">Public wall</p>
          <h2 id="human-trace-title">Leave a Human trace</h2>
          <HumanTraceForm maxLength={TRACE_MAX_LENGTH} />
        </section>
        <section aria-labelledby="timeline-title">
          <p className="kicker">Observation</p>
          <h2 id="timeline-title">Recent activity</h2>
          <p className="section-note admin-note">
            Showing the latest {timeline.length} traces and visits.
          </p>
          <div className="trace-list">
            {timeline.map((event) => (
              <article className="trace" key={event.id}>
                <p className="trace-label">{event.label}</p>
                <time dateTime={event.created_at}>{event.created_at}</time>
                <p className="trace-status">{event.detail}</p>
              </article>
            ))}
          </div>
        </section>
        <section aria-labelledby="visits-title">
          <p className="kicker">Observation</p>
          <h2 id="visits-title">Recent visits</h2>
          <div className="admin-visit-list">
            {(visitEvents ?? []).map((visit) => (
              <details className="admin-visit" key={visit.id}>
                <summary>
                  <span>
                    <strong>{visit.path}</strong>
                    <small>Visitor {visit.visitor_id.slice(0, 8)}…</small>
                  </span>
                  <time dateTime={visit.created_at}>{visit.created_at}</time>
                </summary>
                <dl>
                  <div>
                    <dt>User-Agent</dt>
                    <dd>{visit.user_agent ?? "Unknown"}</dd>
                  </div>
                  <div>
                    <dt>Referrer</dt>
                    <dd>{visit.referrer ?? "None"}</dd>
                  </div>
                </dl>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
