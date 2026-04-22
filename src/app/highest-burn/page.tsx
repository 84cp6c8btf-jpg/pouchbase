import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import type { Metadata } from "next";

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
      <section className="pt-2 sm:pt-6">
        <h1 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.92] text-white">
          The ones that bite.
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-white/45">
          Ranked by burn score — the felt intensity under your lip, not just nicotine milligrams.
          If you want heat, start here.
        </p>
        <p className="mt-4 text-sm text-white/30">
          {hottestProducts.length} products ranked
        </p>
      </section>

      {hottestProducts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {hottestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 bg-[#111114] px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-white">No burn leaders yet</h2>
          <p className="mt-2 text-sm text-white/40">
            As burn scores come in, the hottest pouches will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
