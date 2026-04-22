import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { ReferencePanel } from "@/components/ReferencePanel";
import { MessageSquare, ShieldCheck } from "lucide-react";

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
      <PageIntro
        eyebrow="Rankings"
        title="The best pouches right now."
        description="Ranked by overall community score. When products are tied, the better-tested one stays ahead."
        meta={`${rankedProducts.length} products ranked`}
      />

      <ReferencePanel
        title="How this list works"
        columns={2}
        items={[
          {
            icon: MessageSquare,
            label: "Review data leads",
            description:
              "Overall rankings follow community scores, with more-reviewed products breaking ties.",
          },
          {
            icon: ShieldCheck,
            label: "Retail links stay separate",
            description:
              "Affiliate or retailer relationships never change rank order. This list is review-led, not sponsored placement.",
          },
        ]}
      />

      {rankedProducts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rankedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 bg-card px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-white">No ranked products yet</h2>
          <p className="mt-2 text-sm text-white/48">
            Once reviews come in, the community favorites will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
