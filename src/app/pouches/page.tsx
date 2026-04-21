import type { Metadata } from "next";
import { PouchesPageClient } from "@/components/PouchesPageClient";

export const metadata: Metadata = {
  title: "Browse Nicotine Pouches — PouchBase",
  description: "Browse nicotine pouches by brand, flavor, burn level, and strength.",
  alternates: {
    canonical: "/pouches",
  },
};

export default function PouchesPage() {
  return <PouchesPageClient />;
}
