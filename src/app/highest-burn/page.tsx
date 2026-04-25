import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import { BurnLadder } from "@/components/burn/BurnLadder";
import { BurnMethodology } from "@/components/burn/BurnMethodology";
import { BurnRankSection } from "@/components/burn/BurnRankSection";
import { BurnVsStrengthMap } from "@/components/burn/BurnVsStrengthMap";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ReviewSignalSection } from "@/components/catalog/ReviewSignalSection";
import { PageIntro } from "@/components/common/PageIntro";
import { TrustDisclosure } from "@/components/common/TrustDisclosure";
import Link from "next/link";
import { MIN_PUBLIC_SCORE_REVIEWS } from "@/lib/catalog/burn";
import type { ProductWithBrand } from "@/lib/catalog/discovery";
import { PRODUCT_WITH_BRAND_SELECT } from "@/lib/catalog/selects";
import {
  getBurnIntelligenceModules,
  getProductsWithAnyReviews,
  sortProductsByAdjustedMetric,
} from "@/lib/catalog/intelligence";
import { applyProductsDerivedDefaults } from "@/lib/types";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Highest Burn Nicotine Pouches — PouchBase",
  description: "Discover the nicotine pouches with the highest public burn scores once enough real review data exists.",
  alternates: {
    canonical: "/highest-burn",
  },
};

export default async function HighestBurnPage() {
  const [{ data: products }, { data: reviewedProductsData }] = await Promise.all([
    supabase
      .from("products")
      .select(PRODUCT_WITH_BRAND_SELECT)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(160),
    supabase
      .from("products")
      .select(PRODUCT_WITH_BRAND_SELECT)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(24),
  ]);

  const burnPool = applyProductsDerivedDefaults(products as ProductWithBrand[]).filter(
    (product) => product.review_count >= MIN_PUBLIC_SCORE_REVIEWS
  );
  const hottestProducts = sortProductsByAdjustedMetric(burnPool, "avg_burn", "higher").slice(0, 30);
  const mostReviewed = getProductsWithAnyReviews(applyProductsDerivedDefaults(reviewedProductsData as ProductWithBrand[])).slice(0, 6);
  const { modules } = getBurnIntelligenceModules(burnPool);
  const burnAboveStrength = modules.find((module) => module.key === "burn-above-strength");
  const hardButLoved = modules.find((module) => module.key === "hard-but-loved");

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Burn Rankings"
        title="The ones that bite."
        description="Ranked by felt intensity under the lip, not just nicotine milligrams. If you want heat, start here."
        meta={`${hottestProducts.length} public-score products ranked by burn`}
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

      {!hottestProducts.length && (
        <ReviewSignalSection
          title="Most reviewed while burn rankings build"
          description="Useful when there is still real review activity in the catalog, but not enough public burn depth to claim a proper leaderboard yet."
          products={mostReviewed}
          href="/pouches"
          hrefLabel="Browse all pouches"
        />
      )}
    </div>
  );
}
