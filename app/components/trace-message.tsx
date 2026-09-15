import Link from "next/link";
import type { ReactNode } from "react";

type TraceMessageProps = {
  message: string;
  existingTraceIds: ReadonlySet<number>;
};

const TRACE_REFERENCE_PATTERN = /(?<![\w#])#(\d{4})(?![\w])/g;

export function TraceMessage({
  message,
  existingTraceIds,
}: TraceMessageProps) {
  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of message.matchAll(TRACE_REFERENCE_PATTERN)) {
    const matchIndex = match.index ?? 0;
    const id = Number(match[1]);

    if (matchIndex > cursor) {
      parts.push(message.slice(cursor, matchIndex));
    }

    const reference = match[0];
    parts.push(
      existingTraceIds.has(id) ? (
        <Link href={`/trace/${match[1]}`} key={`${matchIndex}-${reference}`}>
          {reference}
        </Link>
      ) : (
        reference
      ),
    );
    cursor = matchIndex + reference.length;
  }

  if (cursor < message.length) {
    parts.push(message.slice(cursor));
  }

  return <>{parts}</>;
}
