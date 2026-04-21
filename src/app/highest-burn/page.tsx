import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import { Flame } from "lucide-react";
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
    <div className="space-y-8">
      <section className="pb-editorial-panel px-6 py-7 sm:px-8 sm:py-8">
        <div className="relative z-10">
          <div className="pb-kicker mb-5">
            <Flame className="h-3.5 w-3.5" />
            Signature Metric
          </div>
          <h1 className="font-display text-[clamp(2.8rem,6vw,5.5rem)] font-bold leading-[0.92] text-white">
            Highest burn.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/60">
            This ranking is about felt intensity, not just nicotine strength. It surfaces the
            products users describe as sharp, hot, and impossible to ignore.
          </p>
          <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/64">
            {hottestProducts.length} products currently ranked
          </div>
        </div>
      </section>

      {hottestProducts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hottestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <section className="pb-editorial-panel px-6 py-10 text-center">
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold text-white">No burn leaders yet</h2>
            <p className="mt-4 text-white/58">
              As burn scores come in, the fiercest entries will appear here.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
