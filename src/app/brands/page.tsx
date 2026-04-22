import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Flame, Globe, MessageSquare, Star, Zap } from "lucide-react";
import type { Metadata } from "next";
import { BrandArtwork } from "@/components/BrandArtwork";
import { PageIntro } from "@/components/PageIntro";
import { hasPublicScore } from "@/lib/burn";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Nicotine Pouch Brands — PouchBase",
  description: "Browse nicotine pouch brands, compare catalogs, and discover what each brand is known for.",
  alternates: {
    canonical: "/brands",
  },
};

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  description: string | null;
  website_url: string | null;
};

type BrandProductRow = {
  brand_id: string;
  slug: string;
  name: string;
  strength_mg: number;
  avg_burn: number;
  avg_overall: number;
  review_count: number;
};

export default async function BrandsPage() {
  const [{ data: brands }, { data: products }] = await Promise.all([
    supabase.from("brands").select("id, name, slug, country, description, website_url").order("name"),
    supabase
      .from("products")
      .select("brand_id, slug, name, strength_mg, avg_burn, avg_overall, review_count"),
  ]);

  const productRows = (products || []) as BrandProductRow[];
  const brandProducts = new Map<string, BrandProductRow[]>();

  for (const product of productRows) {
    const current = brandProducts.get(product.brand_id) || [];
    current.push(product);
    brandProducts.set(product.brand_id, current);
  }

  const enrichedBrands = ((brands || []) as BrandRow[])
    .map((brand) => ({
      ...brand,
      products: brandProducts.get(brand.id) || [],
    }))
    .map((brand) => {
      const reviewedProducts = brand.products.filter((product) => hasPublicScore(product.review_count));
      const loggedReviewCount = brand.products.reduce((sum, product) => sum + product.review_count, 0);
      const totalReviews = reviewedProducts.reduce((sum, product) => sum + product.review_count, 0);
      const weightedOverall =
        totalReviews > 0
          ? reviewedProducts.reduce((sum, product) => sum + product.avg_overall * product.review_count, 0) / totalReviews
          : null;
      const weightedBurn =
        totalReviews > 0
          ? reviewedProducts.reduce((sum, product) => sum + product.avg_burn * product.review_count, 0) / totalReviews
          : null;
      const strongestProduct = [...brand.products].sort(
        (a, b) => b.strength_mg - a.strength_mg || b.review_count - a.review_count
      )[0];
      const mostReviewedProduct = [...brand.products]
        .filter((product) => product.review_count > 0)
        .sort((a, b) => b.review_count - a.review_count || b.strength_mg - a.strength_mg)[0];
      const bestRatedProduct = [...reviewedProducts].sort(
        (a, b) => b.avg_overall - a.avg_overall || b.review_count - a.review_count
      )[0];

      return {
        ...brand,
        productCount: brand.products.length,
        reviewCount: loggedReviewCount,
        publicProductCount: reviewedProducts.length,
        avgOverall: weightedOverall,
        avgBurn: weightedBurn,
        strongestProduct,
        mostReviewedProduct,
        bestRatedProduct,
      };
    })
    .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Brand Directory"
        title="Every brand we track."
        description="A comparative directory of pouch catalogs, logged review depth, and brand-level public signals where enough real data exists."
        meta={`${enrichedBrands.length} brands · ${productRows.length} products tracked`}
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {enrichedBrands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="group flex h-full flex-col rounded-xl border border-white/8 bg-card p-5 transition hover:border-white/16"
          >
            <div className="flex items-start gap-4">
              <BrandArtwork name={brand.name} slug={brand.slug} country={brand.country} size="card" />
              <div className="min-w-0 flex-1">
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-white/42">
                  {brand.country || "Global"}
                </p>
                <h2 className="font-display text-xl font-bold text-white transition-colors group-hover:text-accent">
                  {brand.name}
                </h2>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-white/50 line-clamp-2">
              {brand.description || `${brand.name} catalog tracked on PouchBase.`}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/8 pt-4">
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.14em] text-white/38">Catalog</div>
                <div className="mt-1 font-display text-xl font-bold text-white">{brand.productCount}</div>
              </div>
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.14em] text-white/38">Reviews</div>
                <div className="mt-1 inline-flex items-center gap-1.5 font-display text-xl font-bold text-white">
                  <MessageSquare className="h-4 w-4 text-accent" />
                  {brand.reviewCount}
                </div>
              </div>
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.14em] text-white/38">Overall</div>
                <div className="mt-1 inline-flex items-center gap-1.5 font-display text-xl font-bold text-white">
                  <Star className="h-4 w-4 text-accent" />
                  {brand.avgOverall ? brand.avgOverall.toFixed(1) : "Building"}
                </div>
              </div>
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.14em] text-white/38">Burn</div>
                <div className="mt-1 inline-flex items-center gap-1.5 font-display text-xl font-bold text-white">
                  <Flame className="h-4 w-4 text-accent" />
                  {brand.avgBurn ? brand.avgBurn.toFixed(1) : "Building"}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-white/50">
              {brand.strongestProduct && (
                <div className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="line-clamp-1">
                    Strongest: {brand.strongestProduct.name} ({brand.strongestProduct.strength_mg}mg)
                  </span>
                </div>
              )}
              {brand.bestRatedProduct ? (
                <div className="flex items-start gap-2">
                  <Star className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="line-clamp-1">
                    Best rated: {brand.bestRatedProduct.name} ({brand.bestRatedProduct.avg_overall.toFixed(1)})
                  </span>
                </div>
              ) : brand.mostReviewedProduct ? (
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="line-clamp-1">
                    Most reviewed: {brand.mostReviewedProduct.name} ({brand.mostReviewedProduct.review_count})
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                  <span>No real review activity yet</span>
                </div>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-white/8 pt-4 text-xs text-white/44">
              <span>
                {brand.publicProductCount} public-score product{brand.publicProductCount === 1 ? "" : "s"}
              </span>
              {brand.website_url && (
                <span className="inline-flex items-center gap-1 text-white/40">
                  <Globe className="h-3 w-3" />
                  Brand site
                </span>
              )}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
