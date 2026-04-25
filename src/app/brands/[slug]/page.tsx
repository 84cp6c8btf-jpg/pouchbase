import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Flame, Globe, Layers, Star, Zap } from "lucide-react";
import type { Metadata } from "next";
import { BrandArtwork } from "@/components/catalog/BrandArtwork";
import { hasPublicScore, MIN_PUBLIC_SCORE_REVIEWS } from "@/lib/catalog/burn";
import type { ProductWithBrand } from "@/lib/catalog/discovery";
import { PRODUCT_WITH_BRAND_SELECT } from "@/lib/catalog/selects";
import { sortProductsByReviewSignal } from "@/lib/catalog/intelligence";
import { getPublicWebsiteUrl } from "@/lib/site";
import { applyProductsDerivedDefaults } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: brand } = await supabase
    .from("brands")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!brand) return { title: "Brand Not Found" };

  return {
    title: `${brand.name} Nicotine Pouches — PouchBase`,
    description:
      brand.description ||
      `Browse ${brand.name} nicotine pouches, product facts, public scores where available, and retailer pricing where available.`,
    alternates: {
      canonical: `/brands/${slug}`,
    },
  };
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params;

  const { data: brand } = await supabase
    .from("brands")
    .select("id, name, slug, country_origin, description, logo_url, website_url")
    .eq("slug", slug)
    .single();

  if (!brand) notFound();

  const officialWebsiteUrl = getPublicWebsiteUrl(brand.website_url);

  const { data: products } = await supabase
    .from("products")
    .select(PRODUCT_WITH_BRAND_SELECT)
    .eq("brand_id", brand.id)
    .eq("is_active", true)
    .order("nicotine_mg", { ascending: false });

  const brandProducts = sortProductsByReviewSignal(applyProductsDerivedDefaults(products as ProductWithBrand[]));
  const reviewedProducts = brandProducts.filter((product) => hasPublicScore(product.review_count));
  const totalReviews = reviewedProducts.reduce((sum, product) => sum + product.review_count, 0);
  const loggedReviews = brandProducts.reduce((sum, product) => sum + product.review_count, 0);
  const avgOverall =
    totalReviews > 0
      ? reviewedProducts.reduce((sum, product) => sum + Number(product.avg_overall || 0) * product.review_count, 0) / totalReviews
      : null;
  const avgBurn =
    totalReviews > 0
      ? reviewedProducts.reduce((sum, product) => sum + Number(product.avg_burn || 0) * product.review_count, 0) / totalReviews
      : null;
  const strongestProduct = [...brandProducts].sort(
    (a, b) => b.strength_mg - a.strength_mg || b.review_count - a.review_count
  )[0];
  const mostReviewedProduct = [...brandProducts]
    .filter((product) => product.review_count > 0)
    .sort((a, b) => b.review_count - a.review_count || b.strength_mg - a.strength_mg)[0];
  const bestRatedProduct = [...reviewedProducts].sort(
    (a, b) => b.avg_overall - a.avg_overall || b.review_count - a.review_count
  )[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-white/42">
        <Link href="/brands" className="transition hover:text-white">
          Brands
        </Link>
        <span>/</span>
        <span className="text-white/68">{brand.name}</span>
      </div>

      <section className="grid gap-6 rounded-xl border border-white/8 bg-card p-6 sm:p-8 lg:grid-cols-[1fr_18rem] lg:items-end">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <BrandArtwork name={brand.name} slug={brand.slug} country={brand.country_origin} logoUrl={brand.logo_url} size="hero" />
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">
              {brand.country_origin || "Global Brand"}
            </p>
            <h1 className="mt-2 font-display text-[clamp(2.8rem,5vw,4.8rem)] font-bold leading-[0.92] text-white">
              {brand.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/55">
              {brand.description || `${brand.name} nicotine pouch catalog tracked on PouchBase.`}
            </p>
            <p className="mt-3 text-sm text-white/46">
              Brand-level averages only reflect products with {MIN_PUBLIC_SCORE_REVIEWS}+ structured reviews.
            </p>
            {officialWebsiteUrl && (
              <a
                href={officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-accent"
              >
                <Globe className="h-4 w-4" />
                Visit brand site
              </a>
            )}
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/48">
              {strongestProduct && (
                <span className="inline-flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  Strongest: {strongestProduct.name} ({strongestProduct.strength_mg}mg)
                </span>
              )}
              {bestRatedProduct && (
                <span className="inline-flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent" />
                  Best rated: {bestRatedProduct.name} ({bestRatedProduct.avg_overall.toFixed(1)})
                </span>
              )}
              {!bestRatedProduct && mostReviewedProduct && (
                <span className="inline-flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent" />
                  Most reviewed: {mostReviewedProduct.name} ({mostReviewedProduct.review_count})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/8 pt-4 sm:grid-cols-2 lg:grid-cols-2 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
          <div>
            <div className="text-[0.66rem] uppercase tracking-[0.16em] text-white/38">Products</div>
            <div className="mt-1 inline-flex items-center gap-2 font-display text-4xl font-bold text-white">
              <Layers className="h-5 w-5 text-accent" />
              {brandProducts.length}
            </div>
          </div>
          <div>
            <div className="text-[0.66rem] uppercase tracking-[0.16em] text-white/38">Reviews Logged</div>
            <div className="mt-1 inline-flex items-center gap-2 font-display text-4xl font-bold text-white">
              <Star className="h-5 w-5 text-accent" />
              {loggedReviews}
            </div>
          </div>
          <div>
            <div className="text-[0.66rem] uppercase tracking-[0.16em] text-white/38">Average Overall</div>
            <div className="mt-1 inline-flex items-center gap-2 font-display text-4xl font-bold text-emerald-200">
              <Star className="h-5 w-5 text-accent" />
              {avgOverall ? avgOverall.toFixed(1) : "Building"}
            </div>
          </div>
          <div>
            <div className="text-[0.66rem] uppercase tracking-[0.16em] text-white/38">Average Burn</div>
            <div className="mt-1 inline-flex items-center gap-2 font-display text-4xl font-bold text-white">
              <Flame className="h-5 w-5 text-accent" />
              {avgBurn ? avgBurn.toFixed(1) : "Building"}
            </div>
          </div>
        </div>
      </section>

      {brandProducts.length > 0 ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[0.66rem] uppercase tracking-[0.16em] text-white/38">Catalog</div>
              <h2 className="mt-1 font-display text-4xl font-bold text-white">All {brand.name} products</h2>
              <p className="mt-2 text-sm leading-6 text-white/50">
                Sorted by real review signal first, then nicotine strength, so low-data launch products still stay useful to scan.
              </p>
            </div>
            <Link href="/pouches" className="text-sm text-white/60 transition hover:text-accent">
              Browse all pouches
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {brandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        <section className="pb-empty px-6 py-10 text-center">
          <div>
            <h2 className="font-display text-4xl font-bold text-white">No products listed yet</h2>
            <p className="mt-4 text-white/58">This brand profile exists, but its catalog has not been added yet.</p>
          </div>
        </section>
      )}
    </div>
  );
}
