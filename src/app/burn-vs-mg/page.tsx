import type { Metadata } from "next";
import Link from "next/link";
import { BurnBandLeaders } from "@/components/BurnBandLeaders";
import { BurnMethodology } from "@/components/BurnMethodology";
import { BurnRankSection } from "@/components/BurnRankSection";
import { BurnVsStrengthMap } from "@/components/BurnVsStrengthMap";
import { PageIntro } from "@/components/PageIntro";
import { TrustDisclosure } from "@/components/TrustDisclosure";
import { supabase } from "@/lib/supabase";
import type { ProductWithBrand } from "@/lib/discovery";
import { getBurnIntelligenceModules, getPublicProducts } from "@/lib/intelligence";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Burn vs Nicotine — PouchBase",
  description:
    "See how felt burn compares with nicotine strength across the pouch catalog once enough real review data exists to support honest burn analysis.",
  alternates: {
    canonical: "/burn-vs-mg",
  },
};

export default async function BurnVsMgPage() {
  const { data } = await supabase
    .from("products")
    .select("*, brands(name, slug)")
    .order("review_count", { ascending: false })
    .limit(160);

  const products = (data || []) as ProductWithBrand[];
  const { modules, bandLeaders } = getBurnIntelligenceModules(products);
  const publicProducts = getPublicProducts(products);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Burn Intelligence"
        title="Where nicotine strength stops explaining the story."
        description="This view maps nicotine milligrams against felt burn so users can spot unusually harsh products, smoother alternatives, and the best-rated pouches inside each burn lane."
        meta={`${publicProducts.length} products with public burn signals`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/highest-burn"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/56 transition hover:text-white"
            >
              Highest burn
            </Link>
            <Link
              href="/burn-ladder"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/56 transition hover:text-white"
            >
              Burn ladder
            </Link>
          </div>
        }
      />

      <BurnVsStrengthMap products={products} />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <BurnMethodology compact />
        <TrustDisclosure context="ranking" />
      </div>

      <BurnBandLeaders bands={bandLeaders} />

      <div className="grid gap-4 xl:grid-cols-2">
        {modules.slice(0, 2).map((module) => (
          <BurnRankSection
            key={module.key}
            title={module.title}
            description={module.description}
            products={module.products}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {modules.slice(2).map((module) => (
          <BurnRankSection
            key={module.key}
            title={module.title}
            description={module.description}
            products={module.products}
          />
        ))}
      </div>
    </div>
  );
}
