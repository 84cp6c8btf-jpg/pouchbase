import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import type { Metadata } from "next";
import { BurnMethodology } from "@/components/BurnMethodology";
import { PageIntro } from "@/components/PageIntro";
import { TrustDisclosure } from "@/components/TrustDisclosure";
import { MIN_PUBLIC_SCORE_REVIEWS } from "@/lib/burn";
import { BurnLadder } from "@/components/BurnLadder";
import Link from "next/link";
import type { ProductWithBrand } from "@/lib/discovery";
import { BurnRankSection } from "@/components/BurnRankSection";
import { BurnVsStrengthMap } from "@/components/BurnVsStrengthMap";
import { getBurnIntelligenceModules, sortProductsByAdjustedMetric } from "@/lib/intelligence";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Highest Burn Nicotine Pouches — PouchBase",
  description: "Discover the nicotine pouches with the highest public burn scores once enough real review data exists.",
  alternates: {
    canonical: "/highest-burn",
  },
};

export default async function HighestBurnPage() {
  const { data: products } = await supabase
    .from("products")
    .select("*, brands(name, slug)")
    .gte("review_count", MIN_PUBLIC_SCORE_REVIEWS)
    .order("review_count", { ascending: false })
    .limit(160);

  const burnPool = (products || []) as ProductWithBrand[];
  const hottestProducts = sortProductsByAdjustedMetric(burnPool, "avg_burn", "higher").slice(0, 30);
  const { modules } = getBurnIntelligenceModules(burnPool);
  const burnAboveStrength = modules.find((module) => module.key === "burn-above-strength");
  const hardButLoved = modules.find((module) => module.key === "hard-but-loved");

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Burn Rankings"
        title="The ones that bite."
        description="Ranked by felt intensity under the lip, not just nicotine milligrams. If you want heat, start here."
        meta={`${hottestProducts.length} products ranked by burn`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/burn-ladder"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/56 transition hover:text-white"
            >
              Open burn ladder
            </Link>
            <Link
              href="/burn-vs-mg"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/56 transition hover:text-white"
            >
              Burn vs mg
            </Link>
          </div>
        }
      />

      <BurnMethodology compact />
      <TrustDisclosure context="ranking" />
      <BurnVsStrengthMap
        products={burnPool}
        compact
        title="Same mg, different bite"
        description="The burn map keeps the page grounded in felt intensity instead of assuming nicotine strength tells the whole story."
      />
      <BurnLadder
        products={hottestProducts as ProductWithBrand[]}
        compact
        focus="strong"
        title="Move through the scale"
        description="Use the ladder to step through public-score products by felt intensity instead of only reading the ranked list."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {hardButLoved && (
          <BurnRankSection
            title={hardButLoved.title}
            description={hardButLoved.description}
            products={hardButLoved.products}
          />
        )}
        {burnAboveStrength && (
          <BurnRankSection
            title={burnAboveStrength.title}
            description={burnAboveStrength.description}
            products={burnAboveStrength.products}
          />
        )}
      </div>

      {hottestProducts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {hottestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 bg-card px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-white">No burn leaders yet</h2>
          <p className="mt-2 text-sm text-white/48">
            As real burn scores cross the public threshold, the hardest hitters will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
