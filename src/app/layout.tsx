import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AgeGate } from "@/components/layout/AgeGate";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body-ui",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-ui",
});
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${SITE_NAME} — Compare Nicotine Pouches`,
  description: SITE_DESCRIPTION,
  keywords: [
    "nicotine pouches",
    "snus",
    "nicotine pouch reviews",
    "best nicotine pouches",
    "zyn",
    "velo",
    "pouch comparison",
    "burn rating",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `${SITE_NAME} — Compare Nicotine Pouches`,
    description: "The independent encyclopedia for nicotine pouches. Real product data, retailer pricing where available, and community reviews where enough rating volume exists.",
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Compare Nicotine Pouches`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <OrganizationJsonLd siteUrl={siteUrl} />
        <WebSiteJsonLd siteUrl={siteUrl} />
        <AgeGate />
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
