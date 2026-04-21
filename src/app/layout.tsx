import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { AgeGate } from "@/components/AgeGate";

const inter = Inter({ subsets: ["latin"] });
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${SITE_NAME} — Rate, Review & Compare Nicotine Pouches`,
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
    title: `${SITE_NAME} — Rate, Review & Compare Nicotine Pouches`,
    description: "The independent encyclopedia for nicotine pouches. Real reviews. Real burn ratings. Best prices.",
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Rate, Review & Compare Nicotine Pouches`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
      return (
    <html lang="en" className={`${inter.className} antialiased`}>
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <AgeGate />
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
