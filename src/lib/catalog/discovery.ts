import { unwrapRelation, type Product, type RelationResult } from "@/lib/types";
import {
  formatBurnRating,
  formatReviewCount,
  getBurnLabel,
  getScoreState,
  hasPublicScore,
} from "@/lib/catalog/burn";

export type ProductBrand = {
  name?: string | null;
  slug?: string | null;
  country?: string | null;
};

export type ProductWithBrand = Product & {
  brands?: RelationResult<ProductBrand>;
};

export type PriceRowLite = {
  product_id: string;
  price: number;
  currency: string;
};

export type PriceSummary = {
  lowestPrice: number | null;
  currency: string | null;
  offerCount: number;
};

export type DiscoveryGroup = {
  key: string;
  title: string;
  description: string;
  products: ProductWithBrand[];
};

export function getBrand(product: ProductWithBrand) {
  return unwrapRelation(product.brands);
}

export function getPublicScoredProducts<T extends Product>(products: T[]) {
  return products.filter((product) => hasPublicScore(product.review_count));
}

export function buildPriceSummaryMap(rows: PriceRowLite[]) {
  const map = new Map<string, PriceSummary>();

  for (const row of rows) {
    const current = map.get(row.product_id);
    if (!current) {
      map.set(row.product_id, {
        lowestPrice: row.price,
        currency: row.currency,
        offerCount: 1,
      });
      continue;
    }

    map.set(row.product_id, {
      lowestPrice:
        current.lowestPrice === null ? row.price : Math.min(current.lowestPrice, row.price),
      currency: current.currency || row.currency,
      offerCount: current.offerCount + 1,
    });
  }

  return map;
}

export function formatPriceSummary(summary?: PriceSummary) {
  if (summary?.lowestPrice == null || !summary.currency) return "No live price";
  return `${summary.currency} ${summary.lowestPrice.toFixed(2)}`;
}

export function sortByBurn(products: ProductWithBrand[]) {
  return [...products].sort((a, b) => a.avg_burn - b.avg_burn || a.avg_overall - b.avg_overall);
}

export function getBurnStepProducts(
  current: ProductWithBrand,
  products: ProductWithBrand[],
  count = 2
) {
  const ladder = sortByBurn(getPublicScoredProducts(products)).filter((product) => product.slug !== current.slug);
  const lower = ladder
    .filter((product) => product.avg_burn < current.avg_burn)
    .sort((a, b) => b.avg_burn - a.avg_burn)
    .slice(0, count)
    .reverse();
  const higher = ladder
    .filter((product) => product.avg_burn > current.avg_burn)
    .slice(0, count);

  return { lower, higher };
}

export function getRelatedDiscoveryGroups(
  current: ProductWithBrand,
  products: ProductWithBrand[]
): DiscoveryGroup[] {
  const allProducts = products.filter((product) => product.slug !== current.slug);
  const publicProducts = getPublicScoredProducts(products).filter((product) => product.slug !== current.slug);
  const sortByCatalogUsefulness = (left: ProductWithBrand, right: ProductWithBrand) =>
    right.review_count - left.review_count ||
    Math.abs(left.strength_mg - current.strength_mg) - Math.abs(right.strength_mg - current.strength_mg) ||
    left.name.localeCompare(right.name);

  const sameFlavorFamily = allProducts
    .filter((product) => product.flavor_category === current.flavor_category)
    .sort(sortByCatalogUsefulness)
    .slice(0, 3);

  const nearbyStrength = allProducts
    .sort(sortByCatalogUsefulness)
    .slice(0, 3);

  const sameFlavorFamilyHigherBurn = publicProducts
    .filter(
      (product) =>
        product.flavor_category === current.flavor_category &&
        product.avg_burn > current.avg_burn
    )
    .sort((a, b) => a.avg_burn - b.avg_burn)
    .slice(0, 3);

  const sameFlavorFamilyLowerBurn = publicProducts
    .filter(
      (product) =>
        product.flavor_category === current.flavor_category &&
        product.avg_burn < current.avg_burn
    )
    .sort((a, b) => b.avg_burn - a.avg_burn)
    .slice(0, 3);

  const similarBurnBetterRating = publicProducts
    .filter(
      (product) =>
        Math.abs(product.avg_burn - current.avg_burn) <= 1 &&
        product.avg_overall > current.avg_overall
    )
    .sort(
      (a, b) =>
        b.avg_overall - a.avg_overall || Math.abs(a.avg_burn - current.avg_burn) - Math.abs(b.avg_burn - current.avg_burn)
    )
    .slice(0, 3);

  const sameMgDifferentBurn = publicProducts
    .filter(
      (product) =>
        product.strength_mg === current.strength_mg &&
        Math.abs(product.avg_burn - current.avg_burn) >= 1
    )
    .sort((a, b) => Math.abs(b.avg_burn - current.avg_burn) - Math.abs(a.avg_burn - current.avg_burn))
    .slice(0, 3);

  const sameBrandAlternatives = allProducts
    .filter((product) => product.brand_id === current.brand_id)
    .sort(sortByCatalogUsefulness)
    .slice(0, 3);

  const groups: DiscoveryGroup[] = [
    {
      key: "same-brand",
      title: "Same brand alternatives",
      description: "Useful when you want nearby options within the same brand family even before ratings mature.",
      products: sameBrandAlternatives,
    },
    {
      key: "same-flavor-family",
      title: "Same flavor family",
      description: "A fact-led starting point when you want to stay in the same general flavor lane.",
      products: sameFlavorFamily,
    },
    {
      key: "nearby-strength",
      title: "Nearby in strength",
      description: "Helpful when you are stepping up or down in nicotine before community burn data is fully built out.",
      products: nearbyStrength,
    },
  ];

  if (hasPublicScore(current.review_count)) {
    groups.push(
      {
        key: "same-flavor-higher",
        title: "Same flavor family, higher burn",
        description: "Useful when you like the profile but want a harder hit.",
        products: sameFlavorFamilyHigherBurn,
      },
      {
        key: "same-flavor-lower",
        title: "Same flavor family, lower burn",
        description: "A step down without leaving the same general flavor lane.",
        products: sameFlavorFamilyLowerBurn,
      },
      {
        key: "similar-burn-better-rating",
        title: "Similar burn, better rating",
        description: "Close in felt intensity, but stronger on community overall score.",
        products: similarBurnBetterRating,
      },
      {
        key: "same-mg-different-burn",
        title: "Same mg, different burn",
        description: "Useful for seeing how recipe and pouch construction change felt harshness.",
        products: sameMgDifferentBurn,
      }
    );
  }

  return groups.filter((group) => group.products.length > 0);
}

export function getStrengthBurnContext(
  product: ProductWithBrand,
  products: ProductWithBrand[]
) {
  const cohort = getPublicScoredProducts(products).filter(
    (candidate) =>
      candidate.slug !== product.slug && candidate.strength_mg === product.strength_mg
  );

  if (cohort.length < 2 || !hasPublicScore(product.review_count)) return null;

  const averageBurn =
    cohort.reduce((sum, candidate) => sum + candidate.avg_burn, 0) / cohort.length;
  const diff = product.avg_burn - averageBurn;

  if (diff >= 1) {
    return `Higher burn than most ${product.strength_mg}mg products`;
  }

  if (diff <= -1) {
    return `Smoother than most ${product.strength_mg}mg products`;
  }

  return `Close to the usual burn range for ${product.strength_mg}mg`;
}

export function getComparisonInsights(
  left: ProductWithBrand,
  right: ProductWithBrand
) {
  const insights: string[] = [];
  const burnDiff = left.avg_burn - right.avg_burn;
  const mgDiff = left.strength_mg - right.strength_mg;

  if (hasPublicScore(left.review_count) && hasPublicScore(right.review_count)) {
    if (Math.abs(burnDiff) <= 0.6 && Math.abs(mgDiff) >= 2) {
      const lowerMg = left.strength_mg < right.strength_mg ? left : right;
      insights.push(`${lowerMg.name} reaches similar burn with lower nicotine.`);
    }

    if (Math.abs(mgDiff) <= 2 && Math.abs(burnDiff) >= 1.2) {
      const harsher = burnDiff > 0 ? left : right;
      insights.push(`${harsher.name} burns harder than the similar-strength alternative.`);
    }

    if (Math.abs(left.avg_overall - right.avg_overall) >= 1 && Math.abs(burnDiff) <= 1) {
      const better = left.avg_overall > right.avg_overall ? left : right;
      insights.push(`${better.name} keeps a similar burn band with a stronger overall rating.`);
    }
  }

  return insights;
}

export function getMetricHighlight(
  leftValue: number | null,
  rightValue: number | null,
  direction: "higher" | "lower"
) {
  if (leftValue === null || rightValue === null || leftValue === rightValue) {
    return "tie" as const;
  }

  if (direction === "higher") {
    return leftValue > rightValue ? "left" as const : "right" as const;
  }

  return leftValue < rightValue ? "left" as const : "right" as const;
}

export function getCompareUrl(leftSlug: string, rightSlug?: string) {
  const params = new URLSearchParams();
  params.set("left", leftSlug);
  if (rightSlug) params.set("right", rightSlug);
  return `/compare?${params.toString()}`;
}

export function getBurnDisplay(product: ProductWithBrand) {
  const state = getScoreState(product.review_count);
  if (state === "none") return "No community burn signal yet";
  if (state === "early") return `${formatReviewCount(product.review_count)} · early burn signal`;
  return `${formatBurnRating(product.avg_burn)} · ${getBurnLabel(product.avg_burn)}`;
}
