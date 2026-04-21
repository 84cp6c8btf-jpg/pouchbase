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
      <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-7 h-7 text-accent" />
          <h1 className="text-3xl sm:text-4xl font-bold">Top Rated Pouches</h1>
        </div>
        <p className="text-muted max-w-3xl">
          The best-reviewed nicotine pouches on PouchBase, ranked by overall score and backed by real review data.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rankedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
