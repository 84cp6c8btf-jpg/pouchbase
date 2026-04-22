import Link from "next/link";
import { MessageSquare, Zap } from "lucide-react";
import { Product, RelationResult } from "@/lib/types";
import { BurnMeter } from "./BurnMeter";
import { RatingBadge } from "./RatingBadge";
import { ProductArtwork } from "./ProductArtwork";

interface ProductCardProps {
  product: Product & { brands?: RelationResult<{ name: string; slug: string }> };
}

export function ProductCard({ product }: ProductCardProps) {
  const brand = Array.isArray(product.brands) ? product.brands[0] : product.brands;
  const flavorCategory =
    product.flavor_category.charAt(0).toUpperCase() + product.flavor_category.slice(1);

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
          {product.review_count > 0 ? (
            <BurnMeter rating={product.avg_burn} size="sm" />
          ) : (
            <div className="rounded-lg border border-dashed border-white/8 px-3 py-2 text-sm text-white/46">
              No burn score yet
            </div>
          )}
        </div>

        {product.review_count > 0 ? (
          <div className="mt-auto border-t border-white/8 pt-4">
            <div className="grid grid-cols-3 gap-2">
              <RatingBadge label="Flavor" value={product.avg_flavor} size="sm" />
              <RatingBadge label="Length" value={product.avg_longevity} size="sm" />
              <RatingBadge label="Overall" value={product.avg_overall} size="sm" />
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-white/48">
              <MessageSquare className="h-3 w-3" />
              {product.review_count} review{product.review_count === 1 ? "" : "s"}
            </div>
          </div>
        ) : (
          <p className="mt-auto border-t border-white/8 pt-4 text-sm text-white/46">
            Be the first to review this one.
          </p>
        )}
      </div>
    </Link>
  );
}
