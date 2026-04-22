import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { BurnLadder } from "@/components/BurnLadder";
import { BurnMethodology } from "@/components/BurnMethodology";
import { PageIntro } from "@/components/PageIntro";
import { TrustDisclosure } from "@/components/TrustDisclosure";
import { MIN_PUBLIC_SCORE_REVIEWS } from "@/lib/burn";
import type { ProductWithBrand } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "Burn Ladder — PouchBase",
  description: "Explore nicotine pouches by felt intensity once enough real public burn data exists to support step-up and step-down discovery.",
  alternates: {
    canonical: "/burn-ladder",
  },
};

export const revalidate = 60;

export default async function BurnLadderPage() {
  const { data } = await supabase
    .from("products")
    .select("id, brand_id, name, slug, flavor, flavor_category, strength_mg, strength_label, format, pouches_per_can, moisture, weight_per_pouch, description, image_url, avg_burn, avg_flavor, avg_longevity, avg_overall, review_count, created_at, brands(name, slug)")
    .gte("review_count", MIN_PUBLIC_SCORE_REVIEWS)
    .order("avg_burn", { ascending: true })
    .order("avg_overall", { ascending: false });

  const products = (data || []) as ProductWithBrand[];

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
