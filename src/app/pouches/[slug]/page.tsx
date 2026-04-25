import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { RatingBadge } from "@/components/catalog/RatingBadge";
import { ProductArtwork } from "@/components/catalog/ProductArtwork";
import { TrustDisclosure } from "@/components/common/TrustDisclosure";
import { BurnLadder } from "@/components/burn/BurnLadder";
import { BurnMethodology } from "@/components/burn/BurnMethodology";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";
import { Droplets, Package, Ruler, Zap } from "lucide-react";
import type { Metadata } from "next";
import { applyProductDerivedDefaults, applyProductsDerivedDefaults, unwrapRelation, type RelationResult } from "@/lib/types";
import Link from "next/link";
import { hasPublicScore } from "@/lib/catalog/burn";
import {
  getCompareUrl,
  getRelatedDiscoveryGroups,
  type ProductWithBrand,
} from "@/lib/catalog/discovery";
import {
  PRODUCT_CATALOG_SELECT,
  PRODUCT_METADATA_SELECT,
  PRODUCT_WITH_BRAND_COUNTRY_SELECT,
} from "@/lib/catalog/selects";
import { PriceComparison } from "./_components/PriceComparison";
import { ProductBurnSummary } from "./_components/ProductBurnSummary";
import { ReferencePanel } from "./_components/ReferencePanel";
import { RelatedComparisons } from "./_components/RelatedComparisons";
import { ReviewSection } from "./_components/ReviewSection";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await supabase
    .from("products")
    .select(PRODUCT_METADATA_SELECT)
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Product Not Found" };

  const normalizedProduct = applyProductDerivedDefaults(product);
  const brandName = unwrapRelation(normalizedProduct.brands as RelationResult<{ name: string }>)?.name || "";
  const publicScoreVisible = hasPublicScore(normalizedProduct.review_count);
  const description = publicScoreVisible
    ? `Read real reviews of ${brandName} ${normalizedProduct.name} (${normalizedProduct.flavor}, ${normalizedProduct.strength_mg}mg). Burn rating, flavor score, and price comparison. Currently ${normalizedProduct.avg_overall.toFixed(1)}/10 from structured community reviews.`
    : `Read product details, retailer pricing where available, and early community feedback for ${brandName} ${normalizedProduct.name} (${normalizedProduct.flavor}, ${normalizedProduct.strength_mg}mg). Public scoring appears after enough real reviews.`;
  return {
    title: `${brandName} ${normalizedProduct.name} Review — PouchBase`,
    description,
    alternates: {
      canonical: `/pouches/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const { data: product } = await supabase
    .from("products")
    .select(PRODUCT_WITH_BRAND_COUNTRY_SELECT)
    .eq("slug", slug)
    .single();

  if (!product) notFound();
  const normalizedProduct = applyProductDerivedDefaults(product);

  const brand = unwrapRelation(
    normalizedProduct.brands as RelationResult<{ name: string; slug: string; country: string | null }>
  );

  const siteUrl = getSiteUrl();

  const { data: prices } = await supabase
    .from("prices")
    .select("price_per_can, currency")
    .eq("product_id", normalizedProduct.id)
    .eq("in_stock", true)
    .order("price_per_can", { ascending: true });

  const lowestPrice = prices?.[0]?.price_per_can;
  const highestPrice = prices?.[prices.length - 1]?.price_per_can;
  const priceCurrency = prices?.[0]?.currency || "EUR";
  const publicScoreVisible = hasPublicScore(normalizedProduct.review_count);
  const { data: relatedProductsData } = await supabase
    .from("products")
    .select(PRODUCT_CATALOG_SELECT)
    .eq("is_active", true)
    .neq("slug", normalizedProduct.slug);
  const relatedProducts = applyProductsDerivedDefaults(relatedProductsData as ProductWithBrand[]);
  const comparisonGroups = getRelatedDiscoveryGroups(normalizedProduct as ProductWithBrand, relatedProducts);
  const ladderProducts = [normalizedProduct as ProductWithBrand, ...relatedProducts];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ProductJsonLd
        name={normalizedProduct.name}
        brand={brand?.name || ""}
        description={normalizedProduct.description || `${brand?.name} ${normalizedProduct.name} nicotine pouch review.`}
        slug={normalizedProduct.slug}
        flavor={normalizedProduct.flavor}
        strengthMg={normalizedProduct.strength_mg}
        avgOverall={normalizedProduct.avg_overall}
        reviewCount={normalizedProduct.review_count}
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
          { name: normalizedProduct.name, href: `/pouches/${normalizedProduct.slug}` },
        ]}
      />

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-white/35">
        <Link href="/pouches" className="transition hover:text-white">Pouches</Link>
        <span>/</span>
        <Link href={`/brands/${brand?.slug}`} className="transition hover:text-white">{brand?.name}</Link>
        <span>/</span>
        <span className="text-white/60">{normalizedProduct.name}</span>
      </nav>

      {/* Product header */}
      <section className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <ProductArtwork
          brand={brand?.name}
          brandSlug={brand?.slug}
          name={normalizedProduct.name}
          flavor={normalizedProduct.flavor}
          flavorCategory={normalizedProduct.flavor_category}
          strengthMg={normalizedProduct.strength_mg}
          format={normalizedProduct.format}
          imageUrl={normalizedProduct.image_url}
          size="hero"
        />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-white/35">
              {brand?.name}{brand?.country ? ` · ${brand.country}` : ""}
            </p>
            <h1 className="mt-1 font-display text-[clamp(2.2rem,4vw,3.5rem)] font-bold leading-[0.95] text-white">
              {normalizedProduct.name}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/56">
              {normalizedProduct.description || `${brand?.name} ${normalizedProduct.name} — ${normalizedProduct.flavor}, ${normalizedProduct.strength_mg}mg nicotine pouch.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="pb-tag">
              <Zap className="h-3 w-3 text-accent" />
              {normalizedProduct.strength_mg}mg{normalizedProduct.strength_label ? ` · ${normalizedProduct.strength_label}` : ""}
            </span>
            <span className="pb-tag">{normalizedProduct.flavor}</span>
            {normalizedProduct.format && (
              <span className="pb-tag">
                <Ruler className="h-3 w-3 text-white/40" />
                {normalizedProduct.format}
              </span>
            )}
            {normalizedProduct.moisture && (
              <span className="pb-tag">
                <Droplets className="h-3 w-3 text-white/40" />
                {normalizedProduct.moisture}
              </span>
            )}
            {normalizedProduct.pouches_per_can ? (
              <span className="pb-tag">
                <Package className="h-3 w-3 text-white/40" />
                {normalizedProduct.pouches_per_can}/can
              </span>
            ) : null}
            <Link
              href={getCompareUrl(normalizedProduct.slug)}
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
            rating={normalizedProduct.avg_burn}
            reviewCount={normalizedProduct.review_count}
            strengthMg={normalizedProduct.strength_mg}
          />
        </div>
      </section>

      {publicScoreVisible ? (
        <section className="grid gap-2 sm:grid-cols-4">
          <RatingBadge label="Flavor" value={normalizedProduct.avg_flavor} />
          <RatingBadge label="Longevity" value={normalizedProduct.avg_longevity} />
          <RatingBadge label="Overall" value={normalizedProduct.avg_overall} />
          <div className="px-3 py-2">
            <div className="text-xs uppercase tracking-wider text-white/40">Reviews</div>
            <div className="font-display text-2xl font-bold text-white">{normalizedProduct.review_count}</div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <BurnMethodology compact />
        <TrustDisclosure context="product" />
      </section>

      {publicScoreVisible ? (
        <BurnLadder
          products={ladderProducts}
          currentSlug={normalizedProduct.slug}
          compact
          title="Step down or step up in burn"
          description="Nearest public-score alternatives above and below this pouch by felt intensity."
        />
      ) : (
        <ReferencePanel
          eyebrow="Low-Data Mode"
          title="Use the product record while ratings build."
          columns={3}
          items={[
            {
              icon: Zap,
              label: "Strength and flavor first",
              description: `${normalizedProduct.strength_mg}mg${normalizedProduct.strength_label ? ` · ${normalizedProduct.strength_label}` : ""} with ${normalizedProduct.flavor} flavor${normalizedProduct.flavor_category ? ` in the ${normalizedProduct.flavor_category} lane` : ""}.`,
            },
            {
              icon: Ruler,
              label: "Format and can details",
              description: `${normalizedProduct.format ? `${normalizedProduct.format} format` : "Format not listed"}${normalizedProduct.pouches_per_can ? ` · ${normalizedProduct.pouches_per_can} per can` : ""}${normalizedProduct.moisture ? ` · ${normalizedProduct.moisture} moisture` : ""}.`,
            },
            {
              icon: Package,
              label: "Price context stays separate",
              description: lowestPrice
                ? `Current external offers start at ${priceCurrency} ${lowestPrice.toFixed(2)}. Retail pricing never changes ranking or burn status.`
                : "No live retailer offer is listed right now, so compare this pouch by product facts and nearby alternatives first.",
            },
          ]}
        />
      )}

      <RelatedComparisons currentSlug={normalizedProduct.slug} groups={comparisonGroups} />

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
        <PriceComparison productId={normalizedProduct.id} pouchesPerCan={normalizedProduct.pouches_per_can} />
        <ReviewSection productId={normalizedProduct.id} />
      </div>
    </div>
  );
}
