import Link from "next/link";
import {
  formatPriceSummary,
  getBrand,
  getComparisonInsights,
  getCompareUrl,
  getMetricHighlight,
  type PriceSummary,
  type ProductWithBrand,
} from "@/lib/discovery";
import { BurnMeter } from "@/components/BurnMeter";
import { ProductArtwork } from "@/components/ProductArtwork";
import { formatReviewCount, hasPublicScore } from "@/lib/burn";

interface ProductComparisonTableProps {
  left: ProductWithBrand;
  right: ProductWithBrand;
  leftPrice?: PriceSummary;
  rightPrice?: PriceSummary;
}

function Cell({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        highlight
          ? "border-accent/30 bg-accent/8"
          : "border-white/8 bg-white/[0.03]"
      }`}
    >
      {children}
    </div>
  );
}

export function ProductComparisonTable({
  left,
  right,
  leftPrice,
  rightPrice,
}: ProductComparisonTableProps) {
  const insights = getComparisonInsights(left, right);
  const leftBrand = getBrand(left);
  const rightBrand = getBrand(right);

  const burnWinner = hasPublicScore(left.review_count) && hasPublicScore(right.review_count)
    ? getMetricHighlight(left.avg_burn, right.avg_burn, "higher")
    : "tie";
  const overallWinner = hasPublicScore(left.review_count) && hasPublicScore(right.review_count)
    ? getMetricHighlight(left.avg_overall, right.avg_overall, "higher")
    : "tie";
  const flavorWinner = hasPublicScore(left.review_count) && hasPublicScore(right.review_count)
    ? getMetricHighlight(left.avg_flavor, right.avg_flavor, "higher")
    : "tie";
  const longevityWinner = hasPublicScore(left.review_count) && hasPublicScore(right.review_count)
    ? getMetricHighlight(left.avg_longevity, right.avg_longevity, "higher")
    : "tie";
  const priceWinner =
    leftPrice?.lowestPrice && rightPrice?.lowestPrice
      ? getMetricHighlight(leftPrice.lowestPrice, rightPrice.lowestPrice, "lower")
      : "tie";

  const rows = [
    {
      label: "Flavor",
      left: left.flavor,
      right: right.flavor,
    },
    {
      label: "Flavor family",
      left: left.flavor_category,
      right: right.flavor_category,
    },
    {
      label: "Nicotine",
      left: `${left.strength_mg}mg`,
      right: `${right.strength_mg}mg`,
    },
    {
      label: "Burn",
      left: hasPublicScore(left.review_count) ? <BurnMeter rating={left.avg_burn} size="sm" /> : "Early signal",
      right: hasPublicScore(right.review_count) ? <BurnMeter rating={right.avg_burn} size="sm" /> : "Early signal",
      winner: burnWinner,
    },
    {
      label: "Flavor score",
      left: hasPublicScore(left.review_count) ? left.avg_flavor.toFixed(1) : "Early signal",
      right: hasPublicScore(right.review_count) ? right.avg_flavor.toFixed(1) : "Early signal",
      winner: flavorWinner,
    },
    {
      label: "Longevity",
      left: hasPublicScore(left.review_count) ? left.avg_longevity.toFixed(1) : "Early signal",
      right: hasPublicScore(right.review_count) ? right.avg_longevity.toFixed(1) : "Early signal",
      winner: longevityWinner,
    },
    {
      label: "Overall",
      left: hasPublicScore(left.review_count) ? left.avg_overall.toFixed(1) : "Early signal",
      right: hasPublicScore(right.review_count) ? right.avg_overall.toFixed(1) : "Early signal",
      winner: overallWinner,
    },
    {
      label: "Review volume",
      left: formatReviewCount(left.review_count),
      right: formatReviewCount(right.review_count),
      winner: getMetricHighlight(left.review_count, right.review_count, "higher"),
    },
    {
      label: "Best live price",
      left: formatPriceSummary(leftPrice),
      right: formatPriceSummary(rightPrice),
      winner: priceWinner,
    },
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-[1fr_5rem_1fr]">
        {[left, right].map((product, index) => {
          const brand = index === 0 ? leftBrand : rightBrand;
          const compareTarget = index === 0 ? right.slug : left.slug;
          return (
            <div key={product.id} className="rounded-xl border border-white/8 bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-white/42">{brand?.name}</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-white">{product.name}</h2>
                </div>
                <Link
                  href={`/pouches/${product.slug}`}
                  className="text-xs text-white/48 transition hover:text-accent"
                >
                  View
                </Link>
              </div>
              <div className="mt-4">
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
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="pb-tag-soft">{product.flavor}</span>
                <span className="pb-tag-soft">{product.format}</span>
                <span className="pb-tag-soft">{product.strength_mg}mg</span>
              </div>
              <Link
                href={getCompareUrl(product.slug, compareTarget)}
                className="mt-4 inline-flex text-sm text-white/48 transition hover:text-accent"
              >
                Refresh this comparison
              </Link>
            </div>
          );
        })}

        <div className="hidden items-center justify-center lg:flex">
          <div className="font-display text-3xl text-white/18">vs</div>
        </div>
      </section>

      {insights.length > 0 && (
        <section className="rounded-xl border border-white/8 bg-card p-5">
          <div className="mb-3 text-[0.68rem] uppercase tracking-[0.18em] text-accent/85">Comparison notes</div>
          <div className="space-y-2">
            {insights.map((insight) => (
              <p key={insight} className="text-sm leading-6 text-white/56">
                {insight}
              </p>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-white/8 bg-card p-5">
        <div className="mb-4 text-[0.68rem] uppercase tracking-[0.18em] text-accent/85">Head to head</div>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="grid gap-3 lg:grid-cols-[1fr_10rem_1fr] lg:items-center">
              <Cell highlight={row.winner === "left"}>{row.left}</Cell>
              <div className="text-center text-xs uppercase tracking-[0.14em] text-white/38">{row.label}</div>
              <Cell highlight={row.winner === "right"}>{row.right}</Cell>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-6 text-white/40">
          Public score rows only become active once a pouch reaches the minimum structured-review threshold.
        </p>
      </section>
    </div>
  );
}
