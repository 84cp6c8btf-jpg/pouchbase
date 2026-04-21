import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PouchBase — Rate, Review & Compare Nicotine Pouches",
  description:
    "The independent encyclopedia for nicotine pouches. Compare prices, read real reviews, and find the perfect pouch with our burn rating system.",
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
  openGraph: {
    title: "PouchBase — Rate, Review & Compare Nicotine Pouches",
    description:
      "The independent encyclopedia for nicotine pouches. Real reviews. Real burn ratings. Best prices.",
    type: "website",
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
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
