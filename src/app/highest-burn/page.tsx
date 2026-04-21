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
      <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="w-7 h-7 text-accent" />
          <h1 className="text-3xl sm:text-4xl font-bold">Highest Burn</h1>
        </div>
        <p className="text-muted max-w-3xl">
          The pouches with the fiercest lip sting and most intense burn, ranked by community burn score.
        </p>
        <p className="text-sm text-muted mt-4">{hottestProducts.length} products currently ranked.</p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {hottestProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
