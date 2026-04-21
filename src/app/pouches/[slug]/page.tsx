import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { BurnMeter } from "@/components/BurnMeter";
import { RatingBadge } from "@/components/RatingBadge";
import { ReviewSection } from "@/components/ReviewSection";
import { PriceComparison } from "@/components/PriceComparison";
import { Droplets, Package, Ruler, Sparkles, Zap } from "lucide-react";
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
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-white/42">
        <Link href="/pouches" className="transition hover:text-white">Pouches</Link>
        <span>/</span>
        <Link href={`/brands/${brand?.slug}`} className="transition hover:text-white">{brand?.name}</Link>
        <span>/</span>
        <span className="text-white/68">{product.name}</span>
      </div>

      <section className="pb-editorial-panel p-5 sm:p-7 lg:p-8">
        <div className="pb-grid-backdrop absolute inset-0 opacity-70" />
        <div className="relative grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="pb-kicker">
              <Sparkles className="h-3.5 w-3.5" />
              Product Entry
            </div>
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
          </div>

          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-white/44">
                {brand?.name}{brand?.country ? ` · ${brand.country}` : ""}
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.7rem,5vw,5rem)] font-bold leading-[0.92] text-white">
                {product.name}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/62">
                {product.description || `Structured review entry for ${product.name}.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <span className="pb-chip">
                <Zap className="h-3.5 w-3.5 text-accent" />
                {product.strength_mg}mg · {product.strength_label || "profile"}
              </span>
              <span className="pb-chip">{product.flavor}</span>
              <span className="pb-chip">
                <Ruler className="h-3.5 w-3.5 text-white/56" />
                {product.format}
              </span>
              <span className="pb-chip">
                <Droplets className="h-3.5 w-3.5 text-white/56" />
                {product.moisture}
              </span>
              <span className="pb-chip">
                <Package className="h-3.5 w-3.5 text-white/56" />
                {product.pouches_per_can} pouches/can
              </span>
            </div>

            {product.review_count > 0 ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <BurnMeter rating={product.avg_burn} size="lg" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 lg:grid-cols-1">
                  <div className="pb-stat-tile min-w-[9rem]">
                    <div className="text-[0.66rem] uppercase tracking-[0.22em] text-white/38">Reviews</div>
                    <div className="mt-1 font-display text-4xl font-bold text-white">
                      {product.review_count}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/12 px-5 py-5 text-white/58">
                No community reviews yet. This entry is ready for the first structured rating.
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <RatingBadge label="Flavor" value={product.avg_flavor} />
              <RatingBadge label="Longevity" value={product.avg_longevity} />
              <RatingBadge label="Overall" value={product.avg_overall} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
        <PriceComparison productId={product.id} pouchesPerCan={product.pouches_per_can} />
        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
}
