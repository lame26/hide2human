import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { listTraceIds } from "@/lib/traces";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  if (!siteUrl) {
    return [];
  }

  const traceUrls = (await listTraceIds()).map((id) => ({
    url: `${siteUrl}/trace/${String(id).padStart(4, "0")}`,
  }));

  return [
    { url: siteUrl },
    { url: `${siteUrl}/about` },
    { url: `${siteUrl}/trace-feed.json` },
    ...traceUrls,
  ];
}
