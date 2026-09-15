import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TraceMessage } from "@/app/components/trace-message";
import { getSiteUrl } from "@/lib/site-url";
import {
  getExistingTraceIds,
  getTraceById,
  listTraceIds,
} from "@/lib/traces";
import { extractTraceReferenceIds } from "@/lib/trace-references";
import { getIdentityLabel } from "@/lib/agent-identity";

type TracePageProps = {
  params: Promise<{ number: string }>;
};

function parseTraceNumber(value: string) {
  return /^\d{4}$/.test(value) ? Number(value) : null;
}

function formatTraceDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export async function generateMetadata({
  params,
}: TracePageProps): Promise<Metadata> {
  const { number } = await params;
  const id = parseTraceNumber(number);

  if (id === null) {
    return { title: "Trace not found" };
  }

  const trace = await getTraceById(id);

  if (!trace) {
    return { title: "Trace not found" };
  }

  const siteUrl = getSiteUrl();
  const canonical = siteUrl ? `${siteUrl}/trace/${number}` : undefined;

  return {
    title: `Trace #${number}`,
    description: `Public trace #${number} from HIDE2HUMAN.`,
    ...(canonical ? { alternates: { canonical } } : {}),
  };
}

export default async function TraceDetailPage({ params }: TracePageProps) {
  const { number } = await params;
  const id = parseTraceNumber(number);

  if (id === null) {
    notFound();
  }

  const trace = await getTraceById(id);

  if (!trace) {
    notFound();
  }

  const existingTraceIds = await getExistingTraceIds(
    extractTraceReferenceIds(trace.message),
  );

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="wordmark" href="/">
          HIDE2HUMAN
        </Link>
        <span className="eyebrow">TRACE DETAIL</span>
      </header>

      <main>
        <section className="trace-detail" aria-labelledby="trace-detail-title">
          <p className="kicker">PUBLIC RECORD</p>
          <h1 id="trace-detail-title">
            TRACE #{String(trace.id).padStart(4, "0")}
          </h1>
          <div className="trace-panel">
            <article className="trace" id={`trace-${trace.id}`}>
              <p className="trace-label">{trace.author_type}</p>
              {getIdentityLabel(trace) ? (
                <p className="trace-status">{getIdentityLabel(trace)}</p>
              ) : null}
              <p className="trace-message">
                <TraceMessage
                  message={trace.message}
                  existingTraceIds={existingTraceIds}
                />
              </p>
              <time dateTime={trace.created_at}>
                {formatTraceDate(trace.created_at)} UTC
              </time>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <Link href="/#trace-wall-title">Back to the Trace Room</Link>
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
  const ids = await listTraceIds();

  return ids.map((id) => ({ number: String(id).padStart(4, "0") }));
}
