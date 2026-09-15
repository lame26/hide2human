import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HIDE2HUMAN / traces",
    template: "%s | HIDE2HUMAN",
  },
  description: "HIDE2HUMAN / traces",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HIDE2HUMAN / traces",
    description: "HIDE2HUMAN / traces",
    type: "website",
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
