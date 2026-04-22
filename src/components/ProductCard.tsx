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

  return (
    <Link
      href={`/pouches/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/8 bg-[#111114] transition duration-200 hover:border-white/16"
    >
      <div className="relative p-3 pb-0">
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

      <div className="flex flex-1 flex-col p-4 pt-3">
        <p className="mb-1 text-xs text-white/40">{brand?.name}</p>
        <h3 className="font-display text-xl font-bold text-white transition-colors group-hover:text-accent">
          {product.name}
        </h3>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="pb-tag">
            <Zap className="h-3 w-3 text-accent" />
            {product.strength_mg}mg
          </span>
          <span className="pb-tag">{product.flavor}</span>
          <span className="pb-tag">{product.format}</span>
        </div>

        <div className="mt-3">
          {product.review_count > 0 ? (
            <BurnMeter rating={product.avg_burn} size="sm" />
          ) : (
            <div className="rounded-lg border border-dashed border-white/8 px-3 py-2 text-sm text-white/40">
              No burn score yet
            </div>
          )}
        </div>

        {product.review_count > 0 ? (
          <div className="mt-auto pt-3">
            <div className="grid grid-cols-3 gap-1.5">
              <RatingBadge label="Flavor" value={product.avg_flavor} size="sm" />
              <RatingBadge label="Length" value={product.avg_longevity} size="sm" />
              <RatingBadge label="Overall" value={product.avg_overall} size="sm" />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
              <MessageSquare className="h-3 w-3" />
              {product.review_count} review{product.review_count === 1 ? "" : "s"}
            </div>
          </div>
        ) : (
          <p className="mt-auto pt-3 text-sm text-white/35">
            Be the first to review this one.
          </p>
        )}
      </div>
    </Link>
  );
}
