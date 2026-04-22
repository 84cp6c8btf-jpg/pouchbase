import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
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
    <div className="space-y-6">
      <section className="pt-2 sm:pt-6">
        <h1 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.92] text-white">
          The best pouches right now.
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-white/45">
          Ranked by overall community score. Products with more reviews rank higher when
          scores are tied, so well-tested favorites rise to the top.
        </p>
        <p className="mt-4 text-sm text-white/30">
          {rankedProducts.length} products ranked
        </p>
      </section>

      {rankedProducts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rankedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 bg-[#111114] px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-white">No ranked products yet</h2>
          <p className="mt-2 text-sm text-white/40">
            Once reviews come in, the community favorites will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
