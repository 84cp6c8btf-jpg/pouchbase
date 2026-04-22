import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { RatingBadge } from "@/components/RatingBadge";
import { ReviewSection } from "@/components/ReviewSection";
import { PriceComparison } from "@/components/PriceComparison";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { getSiteUrl } from "@/lib/site";
import { Droplets, Package, Ruler, Zap } from "lucide-react";
import type { Metadata } from "next";
import type { RelationResult } from "@/lib/types";
import Link from "next/link";
import { ProductArtwork } from "@/components/ProductArtwork";
import { BurnMethodology } from "@/components/BurnMethodology";
import { TrustDisclosure } from "@/components/TrustDisclosure";
import { hasPublicScore } from "@/lib/burn";
import { ProductBurnSummary } from "@/components/ProductBurnSummary";
import {
  getCompareUrl,
  getRelatedDiscoveryGroups,
  type ProductWithBrand,
} from "@/lib/discovery";
import { RelatedComparisons } from "@/components/RelatedComparisons";
import { BurnLadder } from "@/components/BurnLadder";

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

  const siteUrl = getSiteUrl();

  const { data: prices } = await supabase
    .from("prices")
    .select("price, currency")
    .eq("product_id", product.id)
    .eq("in_stock", true)
    .order("price", { ascending: true });

  const lowestPrice = prices?.[0]?.price;
  const highestPrice = prices?.[prices.length - 1]?.price;
  const priceCurrency = prices?.[0]?.currency || "EUR";
  const publicScoreVisible = hasPublicScore(product.review_count);
  const { data: relatedProductsData } = await supabase
    .from("products")
    .select("id, brand_id, name, slug, flavor, flavor_category, strength_mg, strength_label, format, pouches_per_can, moisture, weight_per_pouch, description, image_url, avg_burn, avg_flavor, avg_longevity, avg_overall, review_count, created_at, brands(name, slug)")
    .neq("slug", product.slug);
  const relatedProducts = (relatedProductsData || []) as ProductWithBrand[];
  const comparisonGroups = getRelatedDiscoveryGroups(product as ProductWithBrand, relatedProducts);
  const ladderProducts = [product as ProductWithBrand, ...relatedProducts];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ProductJsonLd
        name={product.name}
        brand={brand?.name || ""}
        description={product.description || `${brand?.name} ${product.name} nicotine pouch review.`}
        slug={product.slug}
        flavor={product.flavor}
        strengthMg={product.strength_mg}
        avgOverall={product.avg_overall}
        reviewCount={product.review_count}
        siteUrl={siteUrl}
        lowestPrice={lowestPrice}
        highestPrice={highestPrice}
        currency={priceCurrency}
      />
      <BreadcrumbJsonLd
        siteUrl={siteUrl}
        items={[
          { name: "Home", href: "/" },
          { name: "Pouches", href: "/pouches" },
          { name: brand?.name || "", href: `/brands/${brand?.slug}` },
          { name: product.name, href: `/pouches/${product.slug}` },
        ]}
      />

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-white/35">
        <Link href="/pouches" className="transition hover:text-white">Pouches</Link>
        <span>/</span>
        <Link href={`/brands/${brand?.slug}`} className="transition hover:text-white">{brand?.name}</Link>
        <span>/</span>
        <span className="text-white/60">{product.name}</span>
      </nav>

      {/* Product header */}
      <section className="grid gap-6 lg:grid-cols-[auto_1fr]">
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

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-white/35">
              {brand?.name}{brand?.country ? ` · ${brand.country}` : ""}
            </p>
            <h1 className="mt-1 font-display text-[clamp(2.2rem,4vw,3.5rem)] font-bold leading-[0.95] text-white">
              {product.name}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/56">
              {product.description || `${brand?.name} ${product.name} — ${product.flavor}, ${product.strength_mg}mg nicotine pouch.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="pb-tag">
              <Zap className="h-3 w-3 text-accent" />
              {product.strength_mg}mg{product.strength_label ? ` · ${product.strength_label}` : ""}
            </span>
            <span className="pb-tag">{product.flavor}</span>
            <span className="pb-tag">
              <Ruler className="h-3 w-3 text-white/40" />
              {product.format}
            </span>
            <span className="pb-tag">
              <Droplets className="h-3 w-3 text-white/40" />
              {product.moisture}
            </span>
            <span className="pb-tag">
              <Package className="h-3 w-3 text-white/40" />
              {product.pouches_per_can}/can
            </span>
            <Link
              href={getCompareUrl(product.slug)}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/56 transition hover:text-white"
            >
              Compare with another pouch
            </Link>
            <Link
              href="/burn-ladder"
              className="inline-flex items-center gap-1 rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/56 transition hover:text-white"
            >
              Browse burn ladder
            </Link>
          </div>

          <ProductBurnSummary
            rating={product.avg_burn}
            reviewCount={product.review_count}
            strengthMg={product.strength_mg}
          />
        </div>
      </section>

      {publicScoreVisible ? (
        <section className="grid gap-2 sm:grid-cols-4">
          <RatingBadge label="Flavor" value={product.avg_flavor} />
          <RatingBadge label="Longevity" value={product.avg_longevity} />
          <RatingBadge label="Overall" value={product.avg_overall} />
          <div className="px-3 py-2">
            <div className="text-xs uppercase tracking-wider text-white/40">Reviews</div>
            <div className="font-display text-2xl font-bold text-white">{product.review_count}</div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <BurnMethodology compact />
        <TrustDisclosure context="product" />
      </section>

      <BurnLadder
        products={ladderProducts}
        currentSlug={product.slug}
        compact
        title="Step down or step up in burn"
        description="Nearest public-score alternatives above and below this pouch by felt intensity."
      />

      <RelatedComparisons currentSlug={product.slug} groups={comparisonGroups} />

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
        <PriceComparison productId={product.id} pouchesPerCan={product.pouches_per_can} />
        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
}
