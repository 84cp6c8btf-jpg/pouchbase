import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import type { Metadata } from "next";
import { BurnMethodology } from "@/components/BurnMethodology";
import { PageIntro } from "@/components/PageIntro";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Highest Burn Nicotine Pouches — PouchBase",
  description: "Discover the nicotine pouches with the highest community burn scores.",
  alternates: {
    canonical: "/highest-burn",
  },
};

export default async function HighestBurnPage() {
  const { data: products } = await supabase
    .from("products")
    .select("*, brands(name, slug)")
    .gt("review_count", 0)
    .order("avg_burn", { ascending: false })
    .order("strength_mg", { ascending: false })
    .limit(30);

  const hottestProducts = products || [];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Burn Rankings"
        title="The ones that bite."
        description="Ranked by felt intensity under the lip, not just nicotine milligrams. If you want heat, start here."
        meta={`${hottestProducts.length} products ranked by burn`}
      />

      <BurnMethodology compact />

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
            As burn scores come in, the hottest pouches will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
