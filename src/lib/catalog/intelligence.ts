import {
  BURN_SCALE,
  compareScoreStates,
  getScoreState,
  hasAnyReviews,
  hasPublicScore,
} from "@/lib/catalog/burn";
import type { ProductWithBrand } from "@/lib/catalog/discovery";

export const RANKING_PRIOR_REVIEW_COUNT = 5;
export const HIGH_CONFIDENCE_REVIEW_COUNT = 6;
export const SMOOTH_HIGH_STRENGTH_MIN_MG = 12;
export const MIN_DISCOVERY_MODULE_PRODUCTS = 2;

type RankedMetric = "avg_burn" | "avg_overall" | "avg_flavor" | "avg_longevity";
type RankedDirection = "higher" | "lower";

export type BurnStrengthSignal =
  | "hot-for-mg"
  | "smooth-for-mg"
  | "balanced"
  | "outlier";

export type BurnStrengthPoint = {
  product: ProductWithBrand;
  cohortAverageBurn: number | null;
  deviation: number | null;
  signal: BurnStrengthSignal | null;
};

export type RankedDiscoveryModule = {
  key: string;
  title: string;
  description: string;
  products: ProductWithBrand[];
};

function getMetricValue(product: ProductWithBrand, metric: RankedMetric) {
  return Number(product[metric] || 0);
}

function getCatalogMean(products: ProductWithBrand[], metric: RankedMetric) {
  if (products.length === 0) return 0;

  return (
    products.reduce((sum, product) => sum + getMetricValue(product, metric), 0) /
    products.length
  );
}

export function getConfidenceWeightedScore(
  score: number,
  reviewCount: number,
  baseline: number,
  priorReviewCount = RANKING_PRIOR_REVIEW_COUNT
) {
  if (reviewCount <= 0) return baseline;

  return (
    (score * reviewCount + baseline * priorReviewCount) /
    (reviewCount + priorReviewCount)
  );
}

export function getPublicProducts(products: ProductWithBrand[]) {
  return products.filter((product) => hasPublicScore(product.review_count));
}

export function compareProductsByReviewSignal(left: ProductWithBrand, right: ProductWithBrand) {
  const stateOrder = compareScoreStates(
    getScoreState(left.review_count),
    getScoreState(right.review_count)
  );

  if (stateOrder !== 0) return stateOrder;
  if (right.review_count !== left.review_count) return right.review_count - left.review_count;
  if (right.strength_mg !== left.strength_mg) return right.strength_mg - left.strength_mg;
  return left.name.localeCompare(right.name);
}

export function sortProductsByReviewSignal(products: ProductWithBrand[]) {
  return [...products].sort(compareProductsByReviewSignal);
}

export function getProductsWithAnyReviews(products: ProductWithBrand[]) {
  return sortProductsByReviewSignal(products).filter((product) => hasAnyReviews(product.review_count));
}

export function sortProductsByAdjustedMetric(
  products: ProductWithBrand[],
  metric: RankedMetric,
  direction: RankedDirection = "higher"
) {
  const publicProducts = getPublicProducts(products);
  const baseline = getCatalogMean(publicProducts, metric);

  return [...publicProducts].sort((left, right) => {
    const leftAdjusted = getConfidenceWeightedScore(
      getMetricValue(left, metric),
      left.review_count,
      baseline
    );
    const rightAdjusted = getConfidenceWeightedScore(
      getMetricValue(right, metric),
      right.review_count,
      baseline
    );

    const primary =
      direction === "higher"
        ? rightAdjusted - leftAdjusted
        : leftAdjusted - rightAdjusted;
    if (Math.abs(primary) > 0.001) return primary;

    const secondary =
      direction === "higher"
        ? getMetricValue(right, metric) - getMetricValue(left, metric)
        : getMetricValue(left, metric) - getMetricValue(right, metric);
    if (Math.abs(secondary) > 0.001) return secondary;

    return right.review_count - left.review_count || left.name.localeCompare(right.name);
  });
}

function getStrengthCohort(
  product: ProductWithBrand,
  products: ProductWithBrand[],
  window = 2
) {
  return getPublicProducts(products).filter(
    (candidate) =>
      candidate.slug !== product.slug &&
      Math.abs(candidate.strength_mg - product.strength_mg) <= window
  );
}

export function getBurnStrengthPoint(
  product: ProductWithBrand,
  products: ProductWithBrand[]
): BurnStrengthPoint {
  if (!hasPublicScore(product.review_count)) {
    return {
      product,
      cohortAverageBurn: null,
      deviation: null,
      signal: null,
    };
  }

  const cohort = getStrengthCohort(product, products);
  if (cohort.length < 2) {
    return {
      product,
      cohortAverageBurn: null,
      deviation: null,
      signal: null,
    };
  }

  const cohortAverageBurn =
    cohort.reduce((sum, candidate) => sum + candidate.avg_burn, 0) / cohort.length;
  const deviation = product.avg_burn - cohortAverageBurn;

  let signal: BurnStrengthSignal | null = null;
  if (Math.abs(deviation) >= 2) {
    signal = "outlier";
  } else if (deviation >= 1) {
    signal = "hot-for-mg";
  } else if (deviation <= -1) {
    signal = "smooth-for-mg";
  } else if (Math.abs(deviation) <= 0.45) {
    signal = "balanced";
  }

  return {
    product,
    cohortAverageBurn,
    deviation,
    signal,
  };
}

export function getBurnStrengthPoints(products: ProductWithBrand[]) {
  return getPublicProducts(products)
    .map((product) => getBurnStrengthPoint(product, products))
    .filter((point) => point.cohortAverageBurn !== null);
}

export function getBurnStrengthSignalLabel(signal: BurnStrengthSignal) {
  if (signal === "hot-for-mg") return "High burn for the mg";
  if (signal === "smooth-for-mg") return "Smoother at similar strength";
  if (signal === "balanced") return "Balanced for the mg";
  return "Clear outlier";
}

export function getBurnStrengthSignalTone(signal: BurnStrengthSignal) {
  if (signal === "hot-for-mg") {
    return {
      dotClass: "fill-red-400",
      textClass: "text-red-200",
      chipClass: "border-red-400/20 bg-red-400/10 text-red-200",
    };
  }

  if (signal === "smooth-for-mg") {
    return {
      dotClass: "fill-emerald-300",
      textClass: "text-emerald-200",
      chipClass: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (signal === "balanced") {
    return {
      dotClass: "fill-white",
      textClass: "text-white",
      chipClass: "border-white/12 bg-white/[0.05] text-white/68",
    };
  }

  return {
    dotClass: "fill-amber-300",
    textClass: "text-amber-200",
    chipClass: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  };
}

function takeTop(products: ProductWithBrand[], limit = 5) {
  return products.slice(0, limit);
}

function getBurnBandLeaders(products: ProductWithBrand[]) {
  return BURN_SCALE.map((band) => {
    const candidates = getPublicProducts(products).filter(
      (product) => product.avg_burn >= band.min && product.avg_burn <= band.max
    );

    return {
      key: `band-${band.label.toLowerCase()}`,
      title: `${band.label} leaders`,
      description: `Best-rated products in the ${band.label.toLowerCase()} burn band.`,
      products: takeTop(sortProductsByAdjustedMetric(candidates, "avg_overall", "higher"), 3),
    };
  }).filter((module) => module.products.length >= MIN_DISCOVERY_MODULE_PRODUCTS);
}

export function getBurnIntelligenceModules(products: ProductWithBrand[]) {
  const publicProducts = getPublicProducts(products);
  const strengthPoints = getBurnStrengthPoints(publicProducts);
  const hotForMg = takeTop(
    strengthPoints
      .filter((point) => point.deviation !== null && point.deviation >= 1)
      .sort(
        (left, right) =>
          (right.deviation || 0) - (left.deviation || 0) ||
          right.product.review_count - left.product.review_count
      )
      .map((point) => point.product)
  );
  const smoothHighStrength = takeTop(
    strengthPoints
      .filter(
        (point) =>
          point.product.strength_mg >= SMOOTH_HIGH_STRENGTH_MIN_MG &&
          point.deviation !== null &&
          point.deviation <= -1
      )
      .sort(
        (left, right) =>
          (left.deviation || 0) - (right.deviation || 0) ||
          right.product.avg_overall - left.product.avg_overall
      )
      .map((point) => point.product)
  );
  const hardButLoved = takeTop(
    sortProductsByAdjustedMetric(
      publicProducts.filter((product) => product.avg_burn >= 6),
      "avg_overall",
      "higher"
    )
  );
  const highConfidenceBurn = takeTop(
    sortProductsByAdjustedMetric(
      publicProducts.filter(
        (product) => product.review_count >= HIGH_CONFIDENCE_REVIEW_COUNT
      ),
      "avg_burn",
      "higher"
    )
  );
  const hardWithoutExtremeMg = takeTop(
    sortProductsByAdjustedMetric(
      publicProducts.filter(
        (product) => product.strength_mg <= 12 && product.avg_burn >= 6
      ),
      "avg_burn",
      "higher"
    )
  );

  const modules: RankedDiscoveryModule[] = [
    {
      key: "hard-but-loved",
      title: "High burn, still well rated",
      description:
        "Products that hit hard but still hold up on flavor, longevity, and overall experience.",
      products: hardButLoved,
    },
    {
      key: "burn-above-strength",
      title: "Burn above the mg",
      description:
        "Public-score products that feel harsher than nearby-strength peers.",
      products: hotForMg,
    },
    {
      key: "smooth-high-strength",
      title: "Smoothest high-strength products",
      description:
        "Higher-nicotine pouches that stay calmer than neighboring strength tiers suggest.",
      products: smoothHighStrength,
    },
    {
      key: "hard-without-extreme-mg",
      title: "Serious burn below 12mg",
      description:
        "Useful when you want strong felt intensity without automatically jumping to the heaviest strength band.",
      products: hardWithoutExtremeMg,
    },
    {
      key: "high-confidence-burn",
      title: "High-confidence burn leaders",
      description:
        "Burn leaders with deeper review depth, so the ranking has more authority behind it.",
      products: highConfidenceBurn,
    },
  ];

  return {
    modules: modules.filter((module) => module.products.length >= MIN_DISCOVERY_MODULE_PRODUCTS),
    bandLeaders: getBurnBandLeaders(products),
  };
}
