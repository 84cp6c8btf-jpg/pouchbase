import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { ComparePicker } from "@/components/ComparePicker";
import { PageIntro } from "@/components/PageIntro";
import { ProductComparisonTable } from "@/components/ProductComparisonTable";
import {
  buildPriceSummaryMap,
  type ProductWithBrand,
} from "@/lib/discovery";

export const metadata: Metadata = {
  title: "Compare Nicotine Pouches — PouchBase",
  description: "Compare two nicotine pouches side by side across burn, ratings, nicotine, and live price context.",
  robots: {
    index: false,
    follow: false,
  },
};

interface Props {
  searchParams: Promise<{ left?: string; right?: string }>;
}

export default async function ComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const [allProductsResult, selectedProductsResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, brand_id, name, slug, flavor, flavor_category, strength_mg, strength_label, format, pouches_per_can, moisture, weight_per_pouch, description, image_url, avg_burn, avg_flavor, avg_longevity, avg_overall, review_count, created_at, brands(name, slug)")
      .order("name"),
    params.left && params.right && params.left !== params.right
      ? supabase
          .from("products")
          .select("id, brand_id, name, slug, flavor, flavor_category, strength_mg, strength_label, format, pouches_per_can, moisture, weight_per_pouch, description, image_url, avg_burn, avg_flavor, avg_longevity, avg_overall, review_count, created_at, brands(name, slug)")
          .in("slug", [params.left, params.right])
      : Promise.resolve({ data: [] as ProductWithBrand[] }),
  ]);

  const allProducts = (allProductsResult.data || []) as ProductWithBrand[];
  const selectedProducts = (selectedProductsResult.data || []) as ProductWithBrand[];

  const left = selectedProducts.find((product) => product.slug === params.left);
  const right = selectedProducts.find((product) => product.slug === params.right);

  const pricesResult =
    left && right
      ? await supabase
          .from("prices")
          .select("product_id, price, currency")
          .in("product_id", [left.id, right.id])
          .eq("in_stock", true)
      : { data: [] };

  const priceMap = buildPriceSummaryMap(pricesResult.data || []);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Comparison"
        title="Head-to-head pouch comparison."
        description="Compare two products side by side across burn, nicotine, structured ratings, review depth, and live price context."
        meta="Shareable URL state via query params"
      />

      <ComparePicker products={allProducts} leftSlug={params.left} rightSlug={params.right} />

      {params.left && params.right && params.left === params.right ? (
        <div className="rounded-xl border border-white/8 bg-card px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-white">Choose two different pouches.</h2>
          <p className="mt-2 text-sm text-white/48">
            Comparison works best when each slot has a different product.
          </p>
        </div>
      ) : left && right ? (
        <ProductComparisonTable
          left={left}
          right={right}
          leftPrice={priceMap.get(left.id)}
          rightPrice={priceMap.get(right.id)}
        />
      ) : (
        <div className="rounded-xl border border-white/8 bg-card px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-white">Pick two pouches to compare.</h2>
          <p className="mt-2 text-sm text-white/48">
            Use the comparison controls above to line up burn, ratings, nicotine, and price side by side.
          </p>
        </div>
      )}
    </div>
  );
}
