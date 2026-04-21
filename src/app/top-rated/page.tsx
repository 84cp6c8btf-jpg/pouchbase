import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import { Star } from "lucide-react";
import type { Metadata } from "next";

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
    .gt("review_count", 0)
    .order("avg_overall", { ascending: false })
    .order("review_count", { ascending: false })
    .limit(30);

  const rankedProducts = products || [];

  return (
    <div className="space-y-8">
      <section className="pb-editorial-panel px-6 py-7 sm:px-8 sm:py-8">
        <div className="relative z-10">
          <div className="pb-kicker mb-5">
            <Star className="h-3.5 w-3.5" />
            Ranked by Signal
          </div>
          <h1 className="font-display text-[clamp(2.8rem,6vw,5.5rem)] font-bold leading-[0.92] text-white">
            Top rated pouches.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/60">
            Ranked by overall score with review count acting as confidence, so the best performers
            rise without the page reading like a shop landing page.
          </p>
          <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/64">
            {rankedProducts.length} products currently ranked
          </div>
        </div>
      </section>

      {rankedProducts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rankedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <section className="pb-editorial-panel px-6 py-10 text-center">
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold text-white">No ranked products yet</h2>
            <p className="mt-4 text-white/58">
              Once reviews arrive, the strongest community favorites will appear here.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
