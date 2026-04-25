import type { Metadata } from "next";
import { Suspense } from "react";
import { PouchesPageClient } from "./_components/PouchesPageClient";

export const metadata: Metadata = {
  title: "Browse Nicotine Pouches — PouchBase",
  description: "Browse nicotine pouches by brand, flavor, burn level, and strength.",
  alternates: {
    canonical: "/pouches",
  },
};

export default function PouchesPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl border border-white/6 bg-white/[0.03]" />}>
      <PouchesPageClient />
    </Suspense>
  );
}
