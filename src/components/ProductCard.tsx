import Link from "next/link";
import { ChevronRight, MessageSquare, Sparkles, Zap } from "lucide-react";
import { Product, RelationResult } from "@/lib/types";
import { BurnMeter } from "./BurnMeter";
import { RatingBadge } from "./RatingBadge";
import { ProductArtwork } from "./ProductArtwork";

interface ProductCardProps {
  product: Product & { brands?: RelationResult<{ name: string; slug: string }> };
}

function formatFlavorCategory(category?: string | null) {
  if (!category) return "Category";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function ProductCard({ product }: ProductCardProps) {
  const brand = Array.isArray(product.brands) ? product.brands[0] : product.brands;

  return (
    <Link
      href={`/pouches/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(23,24,29,0.96),rgba(15,16,20,0.98))] shadow-[0_18px_60px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1 hover:border-accent/40"
    >
      <div className="relative p-4 pb-0">
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
        <div className="pointer-events-none absolute inset-x-6 top-6 flex items-start justify-between gap-3">
          <span className="pb-chip-soft backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            {formatFlavorCategory(product.flavor_category)}
          </span>
          <span className="pb-chip-soft backdrop-blur-sm">
            {product.review_count > 0 ? `${product.review_count} reviews` : "New listing"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="mb-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/48">
              {brand?.name}
            </p>
            <h3 className="font-display text-[1.6rem] font-bold leading-[1.02] tracking-[-0.05em] text-white transition-colors group-hover:text-accent">
              {product.name}
            </h3>
          </div>
          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-white/30 transition-colors group-hover:text-accent" />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="pb-chip">{product.flavor}</span>
          <span className="pb-chip">
            <Zap className="h-3.5 w-3.5 text-accent" />
            {product.strength_mg}mg
          </span>
          <span className="pb-chip">{product.format}</span>
        </div>

        <div className="mb-4">
          {product.review_count > 0 ? (
            <BurnMeter rating={product.avg_burn} size="sm" />
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-white/56">
              No community burn signal yet.
            </div>
          )}
        </div>

        {product.review_count > 0 ? (
          <div className="mt-auto rounded-[1.35rem] border border-white/8 bg-black/15 p-3.5">
            <div className="grid grid-cols-3 gap-2">
              <RatingBadge label="Flavor" value={product.avg_flavor} size="sm" />
              <RatingBadge label="Length" value={product.avg_longevity} size="sm" />
              <RatingBadge label="Overall" value={product.avg_overall} size="sm" />
            </div>
            <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-white/50">
              <MessageSquare className="h-3.5 w-3.5" />
              {product.review_count}
            </div>
          </div>
        ) : (
          <div className="mt-auto rounded-[1.35rem] border border-white/8 bg-black/15 p-3.5 text-sm text-white/56">
            Structured scores unlock once the first reviews land.
          </div>
        )}
      </div>
    </Link>
  );
}
