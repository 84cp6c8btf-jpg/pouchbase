import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { BurnMeter } from "@/components/BurnMeter";
import { RatingBadge } from "@/components/RatingBadge";
import { ReviewSection } from "@/components/ReviewSection";
import { PriceComparison } from "@/components/PriceComparison";
import { Zap, Droplets, Ruler, Package } from "lucide-react";
import type { Metadata } from "next";
import type { RelationResult } from "@/lib/types";
import Link from "next/link";
import { ProductArtwork } from "@/components/ProductArtwork";

interface Props {
  params: Promise<{ slug: string }>;
}

type BrandSummary = { name: string; slug?: string; country?: string | null };

function getSingleBrand<T extends BrandSummary>(brand: RelationResult<T>): T | null {
  if (Array.isArray(brand)) return brand[0] ?? null;
  return brand ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await supabase
    .from("products")
    .select("name, flavor, strength_mg, avg_overall, brands(name)")
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Product Not Found" };

  const brandName = getSingleBrand(product.brands as RelationResult<{ name: string }>)?.name || "";
  return {
    title: `${brandName} ${product.name} Review — PouchBase`,
    description: `Read real reviews of ${brandName} ${product.name} (${product.flavor}, ${product.strength_mg}mg). Burn rating, flavor score, and price comparison. Rated ${product.avg_overall}/10 by the community.`,
    alternates: {
      canonical: `/pouches/${slug}`,
    },
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

  const brand = getSingleBrand(
    product.brands as RelationResult<{ name: string; slug: string; country: string | null }>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm text-muted mb-6 flex flex-wrap items-center gap-y-1">
        <Link href="/pouches" className="hover:text-foreground transition-colors">Pouches</Link>
        <span className="mx-2">/</span>
        <Link href={`/brands/${brand?.slug}`} className="hover:text-foreground transition-colors">{brand?.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      {/* Product Header */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <ProductArtwork
            brand={brand?.name}
            brandSlug={brand?.slug}
            name={product.name}
            flavor={product.flavor}
            flavorCategory={product.flavor_category}
            strengthMg={product.strength_mg}
            format={product.format}
            imageUrl={product.image_url}
            size="hero"
          />

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
                <div className="grid grid-cols-3 gap-4 max-w-sm">
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
