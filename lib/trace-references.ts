const TRACE_REFERENCE_PATTERN = /(?<![\w#])#(\d{4})(?![\w])/g;

export function extractTraceReferenceIds(message: string) {
  const ids: number[] = [];

  for (const match of message.matchAll(TRACE_REFERENCE_PATTERN)) {
    ids.push(Number(match[1]));
  }

  return ids;
}
