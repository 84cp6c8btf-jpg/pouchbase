import Link from "next/link";
import { MessageSquare, Zap } from "lucide-react";
import { BurnMeter } from "@/components/burn/BurnMeter";
import { ProductArtwork } from "@/components/catalog/ProductArtwork";
import { RatingBadge } from "@/components/catalog/RatingBadge";
import {
  MIN_PUBLIC_SCORE_REVIEWS,
  formatReviewCount,
  getReviewsNeededForPublicScore,
  getScoreState,
} from "@/lib/catalog/burn";
import { getBrand, type ProductWithBrand } from "@/lib/catalog/discovery";

interface ProductCardProps {
  product: ProductWithBrand;
}

export function ProductCard({ product }: ProductCardProps) {
  const brand = getBrand(product);
  const flavorCategory =
    product.flavor_category.charAt(0).toUpperCase() + product.flavor_category.slice(1);
  const scoreState = getScoreState(product.review_count);
  const reviewsNeeded = getReviewsNeededForPublicScore(product.review_count);

  return (
    <Link
      href={`/pouches/${product.slug}`}
      className="group flex h-full flex-col rounded-xl border border-white/8 bg-card p-4 transition duration-200 hover:border-white/16"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-white/42">{brand?.name}</p>
          <h3 className="mt-1 font-display text-xl font-bold leading-tight text-white transition-colors group-hover:text-accent">
            {product.name}
          </h3>
        </div>
        <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[0.72rem] font-semibold text-white/70">
          {product.strength_mg}mg
        </span>
      </div>

      <div className="mt-3">
        <ProductArtwork
          brand={brand?.name}
          brandSlug={brand?.slug}
          name={product.name}
          flavor={product.flavor}
          flavorCategory={product.flavor_category}
          strengthMg={product.strength_mg}
          format={product.format}
          imageUrl={product.image_url}
        />
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <div className="flex flex-wrap gap-1.5">
          <span className="pb-tag-soft">{product.flavor}</span>
          <span className="pb-tag-soft">{product.format}</span>
          <span className="pb-tag-soft">
            <Zap className="h-3 w-3 text-accent" />
            {flavorCategory}
          </span>
        </div>

        <div className="mt-4">
          {scoreState === "public" ? (
            <BurnMeter rating={product.avg_burn} size="sm" />
          ) : scoreState === "early" ? (
            <div className="rounded-lg border border-dashed border-white/8 px-3 py-2 text-sm text-white/50">
              {formatReviewCount(product.review_count)} logged. Public burn score unlocks at{" "}
              {MIN_PUBLIC_SCORE_REVIEWS} reviews.
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-white/8 px-3 py-2 text-sm text-white/46">
              No burn score yet
            </div>
          )}
        </div>

        {scoreState === "public" ? (
          <div className="mt-auto border-t border-white/8 pt-4">
            <div className="grid grid-cols-3 gap-2">
              <RatingBadge label="Flavor" value={product.avg_flavor} size="sm" />
              <RatingBadge label="Length" value={product.avg_longevity} size="sm" />
              <RatingBadge label="Overall" value={product.avg_overall} size="sm" />
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-white/48">
              <MessageSquare className="h-3 w-3" />
              {formatReviewCount(product.review_count)}
            </div>
          </div>
        ) : scoreState === "early" ? (
          <p className="mt-auto border-t border-white/8 pt-4 text-sm text-white/48">
            Early signal only. Needs {reviewsNeeded} more {reviewsNeeded === 1 ? "review" : "reviews"} for
            public scoring.
          </p>
        ) : (
          <p className="mt-auto border-t border-white/8 pt-4 text-sm text-white/46">
            No community ratings yet. Use flavor, format, and strength to compare it for now.
          </p>
        )}
      </div>
    </Link>
  );
}
