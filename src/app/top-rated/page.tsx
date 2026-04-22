import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ReviewSignalSection } from "@/components/catalog/ReviewSignalSection";
import { PageIntro } from "@/components/common/PageIntro";
import { TrustDisclosure } from "@/components/common/TrustDisclosure";
import { MIN_PUBLIC_SCORE_REVIEWS } from "@/lib/catalog/burn";
import type { ProductWithBrand } from "@/lib/catalog/discovery";
import { PRODUCT_WITH_BRAND_SELECT } from "@/lib/catalog/selects";
import {
  getProductsWithAnyReviews,
  sortProductsByAdjustedMetric,
} from "@/lib/catalog/intelligence";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Top Rated Nicotine Pouches — PouchBase",
  description: "See the best-rated nicotine pouches once enough real structured reviews exist to rank them credibly.",
  alternates: {
    canonical: "/top-rated",
  },
};

export default async function TopRatedPage() {
  const [{ data: products }, { data: reviewedProductsData }] = await Promise.all([
    supabase
      .from("products")
      .select(PRODUCT_WITH_BRAND_SELECT)
      .gte("review_count", MIN_PUBLIC_SCORE_REVIEWS)
      .order("review_count", { ascending: false })
      .limit(160),
    supabase
      .from("products")
      .select(PRODUCT_WITH_BRAND_SELECT)
      .gt("review_count", 0)
      .order("review_count", { ascending: false })
      .limit(24),
  ]);

  const rankedProducts = sortProductsByAdjustedMetric(
    (products || []) as ProductWithBrand[],
    "avg_overall",
    "higher"
  ).slice(0, 30);
  const mostReviewed = getProductsWithAnyReviews((reviewedProductsData || []) as ProductWithBrand[]).slice(0, 6);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Rankings"
        title="The best pouches right now."
        description="Ranked by overall community score with a light review-depth weighting, so better-tested products hold more authority when scores are close."
        meta={`${rankedProducts.length} public-score products ranked`}
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
            This page turns on once products reach the real-review threshold for public scoring.
          </p>
        </div>
      )}

      {!rankedProducts.length && (
        <ReviewSignalSection
          title="Most reviewed while rankings build"
          description="These are the products with the strongest real review activity so far. They are not the same thing as top rated."
          products={mostReviewed}
          href="/pouches"
          hrefLabel="Browse all pouches"
        />
      )}
    </div>
  );
}
