import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { LazyToaster } from "@/components/shared/lazy-toaster";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, organizationJsonLd } from "@/lib/seo";
import "./globals.css";

// Self-hosted via next/font: no render-blocking CSS @import, no external font request, and only
// the weights we actually use (2 body weights, 3 display weights + one italic).
const serif = localFont({
  src: [
    { path: "../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = localFont({
  src: [
    { path: "../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: SITE_TAGLINE,
};

export const viewport: Viewport = {
  themeColor: "#5A1725",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ivory text-soft-black">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        {children}
        <LazyToaster />
      </body>
    </html>
  );
}
