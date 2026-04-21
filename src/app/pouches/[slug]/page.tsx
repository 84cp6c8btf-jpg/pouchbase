import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { BurnMeter } from "@/components/BurnMeter";
import { RatingBadge } from "@/components/RatingBadge";
import { ReviewSection } from "@/components/ReviewSection";
import { PriceComparison } from "@/components/PriceComparison";
import { Zap, Droplets, Ruler, Package } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await supabase
    .from("products")
    .select("name, flavor, strength_mg, avg_overall, brands(name)")
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Product Not Found" };

  const brandName = (product.brands as { name: string } | null)?.name || "";
  return {
    title: `${brandName} ${product.name} Review — PouchBase`,
    description: `Read real reviews of ${brandName} ${product.name} (${product.flavor}, ${product.strength_mg}mg). Burn rating, flavor score, and price comparison. Rated ${product.avg_overall}/10 by the community.`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("*, brands(name, slug, country)")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  const brand = product.brands as { name: string; slug: string; country: string | null } | null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm text-muted mb-6">
        <a href="/pouches" className="hover:text-foreground">Pouches</a>
        <span className="mx-2">/</span>
        <a href={`/brands/${brand?.slug}`} className="hover:text-foreground">{brand?.name}</a>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      {/* Product Header */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Product Image Placeholder */}
          <div className="w-full sm:w-48 h-48 bg-zinc-800 rounded-xl flex items-center justify-center text-4xl shrink-0">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              "🫧"
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm text-muted uppercase tracking-wide">{brand?.name}</p>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm bg-zinc-800 text-muted px-3 py-1 rounded-full flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-accent" />
                {product.strength_mg}mg — {product.strength_label || "Unknown"}
              </span>
              <span className="text-sm bg-zinc-800 text-muted px-3 py-1 rounded-full">
                {product.flavor}
              </span>
              <span className="text-sm bg-zinc-800 text-muted px-3 py-1 rounded-full flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                {product.format}
              </span>
              <span className="text-sm bg-zinc-800 text-muted px-3 py-1 rounded-full flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" />
                {product.moisture}
              </span>
              <span className="text-sm bg-zinc-800 text-muted px-3 py-1 rounded-full flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                {product.pouches_per_can} pouches/can
              </span>
            </div>

            {/* Ratings */}
            {product.review_count > 0 ? (
              <div className="space-y-3">
                <BurnMeter rating={product.avg_burn} size="lg" />
                <div className="flex gap-6">
                  <RatingBadge label="Flavor" value={product.avg_flavor} />
                  <RatingBadge label="Longevity" value={product.avg_longevity} />
                  <RatingBadge label="Overall" value={product.avg_overall} />
                </div>
                <p className="text-sm text-muted">{product.review_count} review{product.review_count !== 1 ? "s" : ""}</p>
              </div>
            ) : (
              <p className="text-muted">No reviews yet. Be the first to rate this pouch.</p>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-muted mt-6 border-t border-border pt-6">{product.description}</p>
        )}
      </div>

      {/* Price Comparison */}
      <PriceComparison productId={product.id} pouchesPerCan={product.pouches_per_can} />

      {/* Reviews */}
      <ReviewSection productId={product.id} />
    </div>
  );
}
