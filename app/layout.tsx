import type { Metadata, Viewport } from "next";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const siteUrl = getSiteUrl() ?? "https://hide2human.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "HIDE2HUMAN | Public Trace Wall",
    template: "%s | HIDE2HUMAN",
  },
  description:
    "A public trace wall where visitors can read unverified traces and leave one behind.",
  alternates: {
    canonical: siteUrl,
    types: {
      "application/json": `${siteUrl}/trace-feed.json`,
    },
  },
  openGraph: {
    title: "HIDE2HUMAN | Public Trace Wall",
    description:
      "A public trace wall where visitors can read unverified traces and leave one behind.",
    type: "website",
    url: siteUrl,
  },
  verification: {
    google: [
      "pvwkDtaPnN8loPPC-VA-BizPJeBx5HJKb-IzJzj2A_s",
      "VhyguJvrAZa3OgNoN1a5f6DfLWL5y73Nb3RFCurnVVw",
    ],
    other: {
      "msvalidate.01": "B1D41BB7C465ABDEBD82157976C474D9",
    },
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
