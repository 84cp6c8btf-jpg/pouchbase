import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { TrustDisclosure } from "@/components/TrustDisclosure";
import { MIN_PUBLIC_SCORE_REVIEWS } from "@/lib/burn";
import { sortProductsByAdjustedMetric } from "@/lib/intelligence";
import type { ProductWithBrand } from "@/lib/discovery";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Top Rated Nicotine Pouches — PouchBase",
  description: "See the best-reviewed nicotine pouches ranked by overall score.",
  alternates: {
    canonical: "/top-rated",
  },
};

export default async function TopRatedPage() {
  const { data: products } = await supabase
    .from("products")
    .select("*, brands(name, slug)")
    .gte("review_count", MIN_PUBLIC_SCORE_REVIEWS)
    .order("review_count", { ascending: false })
    .limit(160);

  const rankedProducts = sortProductsByAdjustedMetric(
    (products || []) as ProductWithBrand[],
    "avg_overall",
    "higher"
  ).slice(0, 30);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Rankings"
        title="The best pouches right now."
        description="Ranked by overall community score with a light review-depth weighting, so better-tested products hold more authority when scores are close."
        meta={`${rankedProducts.length} products ranked`}
      />

      <TrustDisclosure context="ranking" />

      {rankedProducts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rankedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 bg-card px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-white">No ranked products yet</h2>
          <p className="mt-2 text-sm text-white/48">
            Once reviews come in, the community favorites will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
