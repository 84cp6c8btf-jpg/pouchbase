export const MIN_PUBLIC_SCORE_REVIEWS = 3;

export const BURN_SCALE = [
  {
    min: 0,
    max: 2.4,
    label: "Soft",
    range: "0-2.4",
    description: "Noticeable but easygoing under the lip.",
    textClass: "text-amber-300",
    barClass: "bg-amber-400",
    ogColor: "#fbbf24",
  },
  {
    min: 2.5,
    max: 4.4,
    label: "Warm",
    range: "2.5-4.4",
    description: "Present and clearly felt without turning aggressive.",
    textClass: "text-orange-300",
    barClass: "bg-orange-400",
    ogColor: "#fdba74",
  },
  {
    min: 4.5,
    max: 6.4,
    label: "Sharp",
    range: "4.5-6.4",
    description: "Clearly strong and likely to stand out on first use.",
    textClass: "text-orange-400",
    barClass: "bg-orange-500",
    ogColor: "#f97316",
  },
  {
    min: 6.5,
    max: 8.4,
    label: "Intense",
    range: "6.5-8.4",
    description: "Aggressive burn for users who want a harder hit.",
    textClass: "text-red-400",
    barClass: "bg-red-500",
    ogColor: "#ef4444",
  },
  {
    min: 8.5,
    max: 10,
    label: "Inferno",
    range: "8.5-10",
    description: "Very intense and usually harsher than average.",
    textClass: "text-red-300",
    barClass: "bg-red-400",
    ogColor: "#f87171",
  },
] as const;

export type ScoreState = "none" | "early" | "public";

export function formatBurnRating(rating: number) {
  return (Math.round(rating * 10) / 10).toFixed(1);
}

export function getBurnScaleEntry(rating: number) {
  const normalized = Math.max(0, Math.min(10, rating));
  return BURN_SCALE.find((step) => normalized >= step.min && normalized <= step.max) || BURN_SCALE[BURN_SCALE.length - 1];
}

export function getBurnLabel(rating: number) {
  return getBurnScaleEntry(rating).label;
}

export function getBurnUiTone(rating: number) {
  const step = getBurnScaleEntry(rating);
  return {
    text: step.textClass,
    bar: step.barClass,
    ogColor: step.ogColor,
  };
}

export function getScoreState(reviewCount: number): ScoreState {
  if (reviewCount <= 0) return "none";
  if (reviewCount < MIN_PUBLIC_SCORE_REVIEWS) return "early";
  return "public";
}

export function hasPublicScore(reviewCount: number) {
  return getScoreState(reviewCount) === "public";
}

export function getReviewsNeededForPublicScore(reviewCount: number) {
  return Math.max(0, MIN_PUBLIC_SCORE_REVIEWS - reviewCount);
}

export function getScoreStateLabel(reviewCount: number) {
  const state = getScoreState(reviewCount);

  if (state === "public") return "Structured score";
  if (state === "early") return "Early signal";
  return "No score yet";
}

export function formatReviewCount(reviewCount: number) {
  return `${reviewCount} review${reviewCount === 1 ? "" : "s"}`;
}
