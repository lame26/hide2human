export function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return siteUrl?.replace(/\/+$/, "");
}
