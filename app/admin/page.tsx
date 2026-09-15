import Link from "next/link";
import { AdminActions } from "@/app/components/admin-actions";
import { DeleteTraceButton } from "@/app/components/delete-trace-button";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

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
    { data: firstTraceRow },
    { data: latestTraceRow },
    { count: totalVisits },
  ] = await Promise.all([
    supabase
      .from("traces")
      .select("id, message, created_at, visitor_id")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("traces").select("id", { count: "exact", head: true }),
    supabase.from("visitors").select("id", { count: "exact", head: true }),
    supabase.from("visitors").select("visit_count, trace_count").limit(10000),
    supabase
      .from("visit_events")
      .select("id, visitor_id, path, user_agent, referrer, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
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
                <p className="trace-label">TRACE #{trace.id}</p>
                <p className="trace-message">{trace.message}</p>
                <time dateTime={trace.created_at}>{trace.created_at}</time>
                <p className="trace-status">Visitor {trace.visitor_id}</p>
                <DeleteTraceButton id={trace.id} />
              </article>
            ))}
          </div>
        </section>
        <section aria-labelledby="visits-title">
          <p className="kicker">Observation</p>
          <h2 id="visits-title">Recent visits</h2>
          <div className="trace-list">
            {(visitEvents ?? []).map((visit) => (
              <article className="trace" key={visit.id}>
                <p className="trace-label">{visit.path}</p>
                <p className="trace-message">Visitor {visit.visitor_id}</p>
                <time dateTime={visit.created_at}>{visit.created_at}</time>
                <p className="trace-status">
                  {visit.user_agent ?? "Unknown user agent"}
                  {visit.referrer ? ` · ${visit.referrer}` : ""}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
