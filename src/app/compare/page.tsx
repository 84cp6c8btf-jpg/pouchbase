import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { PageIntro } from "@/components/common/PageIntro";
import {
  buildPriceSummaryMap,
  type ProductWithBrand,
} from "@/lib/catalog/discovery";
import { PRODUCT_CATALOG_SELECT } from "@/lib/catalog/selects";
import { ComparePicker } from "./_components/ComparePicker";
import { ProductComparisonTable } from "./_components/ProductComparisonTable";
import { applyProductsDerivedDefaults } from "@/lib/types";

export const metadata: Metadata = {
  title: "Compare Nicotine Pouches — PouchBase",
  description: "Compare two nicotine pouches side by side across burn, ratings, nicotine, and retailer price context where available.",
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
      .select(PRODUCT_CATALOG_SELECT)
      .eq("is_active", true)
      .order("name"),
    params.left && params.right && params.left !== params.right
      ? supabase
          .from("products")
          .select(PRODUCT_CATALOG_SELECT)
          .eq("is_active", true)
          .in("slug", [params.left, params.right])
      : Promise.resolve({ data: [] as ProductWithBrand[] }),
  ]);

  const allProducts = applyProductsDerivedDefaults(allProductsResult.data as ProductWithBrand[]);
  const selectedProducts = applyProductsDerivedDefaults(selectedProductsResult.data as ProductWithBrand[]);

  const left = selectedProducts.find((product) => product.slug === params.left);
  const right = selectedProducts.find((product) => product.slug === params.right);

  const pricesResult =
    left && right
      ? await supabase
          .from("prices")
          .select("product_id, price:price_per_can, currency")
          .in("product_id", [left.id, right.id])
          .eq("in_stock", true)
      : { data: [] };

  const priceMap = buildPriceSummaryMap(pricesResult.data || []);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Comparison"
        title="Head-to-head pouch comparison."
        description="Compare two products side by side across burn, nicotine, structured ratings, review depth, and retailer price context where available."
        meta="Share this comparison from your browser URL."
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
