import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { BurnLadder } from "@/components/burn/BurnLadder";
import { BurnMethodology } from "@/components/burn/BurnMethodology";
import { PageIntro } from "@/components/common/PageIntro";
import { TrustDisclosure } from "@/components/common/TrustDisclosure";
import { MIN_PUBLIC_SCORE_REVIEWS } from "@/lib/catalog/burn";
import type { ProductWithBrand } from "@/lib/catalog/discovery";
import { PRODUCT_CATALOG_SELECT } from "@/lib/catalog/selects";
import { applyProductsDerivedDefaults } from "@/lib/types";
import { withReviewStats } from "@/lib/catalog/review-stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Burn Ladder — PouchCompare",
  description: "Explore nicotine pouches by felt intensity once enough real public burn data exists to support step-up and step-down discovery.",
  alternates: {
    canonical: "/burn-ladder",
  },
};

export default async function BurnLadderPage() {
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_CATALOG_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const products = (await withReviewStats(applyProductsDerivedDefaults(data as ProductWithBrand[]))).filter(
    (product) => product.review_count >= MIN_PUBLIC_SCORE_REVIEWS
  );

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Burn Discovery"
        title="Move through the catalog by felt intensity."
        description="The burn ladder shows what reads milder, similar, or stronger across the public-score catalog, independent of brand."
        meta={`${products.length} products with public burn scores`}
        actions={
          <Link
            href="/highest-burn"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/56 transition hover:text-white"
          >
            View highest burn list
          </Link>
        }
      />

      <BurnMethodology compact />
      <TrustDisclosure context="ranking" />
      <BurnLadder products={products} />
    </div>
  );
}
