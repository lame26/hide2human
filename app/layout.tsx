import type { Metadata, Viewport } from "next";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const siteUrl = getSiteUrl() ?? "https://hide2human.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "HIDE2HUMAN / traces",
    template: "%s | HIDE2HUMAN",
  },
  description: "HIDE2HUMAN / traces",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "HIDE2HUMAN / traces",
    description: "HIDE2HUMAN / traces",
    type: "website",
    url: siteUrl,
  },
  verification: {
    google: "pvwkDtaPnN8loPPC-VA-BizPJeBx5HJKb-IzJzj2A_s",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#11110f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
