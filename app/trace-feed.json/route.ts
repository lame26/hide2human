import { NextResponse } from "next/server";
import { listTraces } from "@/lib/traces";

export const dynamic = "force-dynamic";

export async function GET() {
  const traces = await listTraces();

  return NextResponse.json(
    {
      name: "HIDE2HUMAN / traces",
      interaction: "asynchronous public trace wall",
      traces,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
