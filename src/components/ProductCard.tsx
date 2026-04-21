import Link from "next/link";
import { Star, MessageSquare, Zap } from "lucide-react";
import { Product } from "@/lib/types";
import { BurnMeter } from "./BurnMeter";
import { RatingBadge } from "./RatingBadge";

interface ProductCardProps {
  product: Product & { brands?: { name: string; slug: string } };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/pouches/${product.slug}`}
      className="bg-card border border-border rounded-xl p-4 hover:border-accent/50 hover:bg-card-hover transition-all group"
    >
      {/* Top: Brand + Name */}
      <div className="mb-3">
        <p className="text-xs text-muted uppercase tracking-wide">
          {product.brands?.name}
        </p>
        <h3 className="text-lg font-semibold group-hover:text-accent transition-colors truncate">
          {product.name}
        </h3>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-xs bg-zinc-800 text-muted px-2 py-0.5 rounded-full">
          {product.flavor}
        </span>
        <span className="text-xs bg-zinc-800 text-muted px-2 py-0.5 rounded-full flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {product.strength_mg}mg
        </span>
        <span className="text-xs bg-zinc-800 text-muted px-2 py-0.5 rounded-full">
          {product.format}
        </span>
      </div>

      {/* Burn Meter */}
      <div className="mb-3">
        {product.review_count > 0 ? (
          <BurnMeter rating={product.avg_burn} size="sm" />
        ) : (
          <span className="text-xs text-muted">No ratings yet</span>
        )}
      </div>

      {/* Ratings Row */}
      {product.review_count > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex gap-4">
            <RatingBadge label="Flavor" value={product.avg_flavor} size="sm" />
            <RatingBadge label="Longevity" value={product.avg_longevity} size="sm" />
            <RatingBadge label="Overall" value={product.avg_overall} size="sm" />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted">
            <MessageSquare className="w-3 h-3" />
            {product.review_count}
          </div>
        </div>
      )}
    </Link>
  );
}
