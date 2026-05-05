import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

type ReviewStatsRow = {
  product_id: string;
  burn_rating: number;
  flavor_accuracy_rating: number;
  nicotine_feel_rating: number;
  comfort_rating: number;
  longevity_rating: number;
  value_rating: number;
};

type ReviewStatsAccumulator = {
  count: number;
  burn: number;
  flavorAccuracy: number;
  nicotineFeel: number;
  comfort: number;
  longevity: number;
  value: number;
};

export type ProductReviewStats = {
  review_count: number;
  avg_burn: number;
  avg_flavor: number;
  avg_flavor_accuracy: number;
  avg_nicotine_feel: number;
  avg_comfort: number;
  avg_longevity: number;
  avg_value: number;
  avg_overall: number;
};

const RATING_COLUMNS =
  "product_id, burn_rating, flavor_accuracy_rating, nicotine_feel_rating, comfort_rating, longevity_rating, value_rating";

function emptyReviewStats(): ProductReviewStats {
  return {
    review_count: 0,
    avg_burn: 0,
    avg_flavor: 0,
    avg_flavor_accuracy: 0,
    avg_nicotine_feel: 0,
    avg_comfort: 0,
    avg_longevity: 0,
    avg_value: 0,
    avg_overall: 0,
  };
}

function average(total: number, count: number) {
  return count > 0 ? total / count : 0;
}

export function buildReviewStatsMap(rows: ReviewStatsRow[] | null | undefined) {
  const accumulators = new Map<string, ReviewStatsAccumulator>();

  for (const row of rows || []) {
    const current = accumulators.get(row.product_id) || {
      count: 0,
      burn: 0,
      flavorAccuracy: 0,
      nicotineFeel: 0,
      comfort: 0,
      longevity: 0,
      value: 0,
    };

    current.count += 1;
    current.burn += Number(row.burn_rating || 0);
    current.flavorAccuracy += Number(row.flavor_accuracy_rating || 0);
    current.nicotineFeel += Number(row.nicotine_feel_rating || 0);
    current.comfort += Number(row.comfort_rating || 0);
    current.longevity += Number(row.longevity_rating || 0);
    current.value += Number(row.value_rating || 0);
    accumulators.set(row.product_id, current);
  }

  const stats = new Map<string, ProductReviewStats>();

  for (const [productId, current] of accumulators) {
    const avgBurn = average(current.burn, current.count);
    const avgFlavorAccuracy = average(current.flavorAccuracy, current.count);
    const avgNicotineFeel = average(current.nicotineFeel, current.count);
    const avgComfort = average(current.comfort, current.count);
    const avgLongevity = average(current.longevity, current.count);
    const avgValue = average(current.value, current.count);

    stats.set(productId, {
      review_count: current.count,
      avg_burn: avgBurn,
      avg_flavor: avgFlavorAccuracy,
      avg_flavor_accuracy: avgFlavorAccuracy,
      avg_nicotine_feel: avgNicotineFeel,
      avg_comfort: avgComfort,
      avg_longevity: avgLongevity,
      avg_value: avgValue,
      avg_overall: (avgBurn + avgFlavorAccuracy + avgNicotineFeel + avgComfort + avgLongevity + avgValue) / 6,
    });
  }

  return stats;
}

export async function fetchReviewStatsByProductIds(productIds: string[]) {
  const uniqueProductIds = [...new Set(productIds.filter(Boolean))];
  const allRows: ReviewStatsRow[] = [];

  for (let index = 0; index < uniqueProductIds.length; index += 200) {
    const ids = uniqueProductIds.slice(index, index + 200);
    if (!ids.length) continue;

    const { data, error } = await supabase
      .from("reviews")
      .select(RATING_COLUMNS)
      .in("product_id", ids);

    if (error) {
      console.error("Failed to load review stats", error);
      continue;
    }

    allRows.push(...((data || []) as ReviewStatsRow[]));
  }

  return buildReviewStatsMap(allRows);
}

export function applyReviewStatsToProducts<T extends Product>(
  products: T[],
  statsByProductId: Map<string, ProductReviewStats>
) {
  return products.map((product) => ({
    ...product,
    ...(statsByProductId.get(product.id) || emptyReviewStats()),
  }));
}

export async function withReviewStats<T extends Product>(products: T[]) {
  const statsByProductId = await fetchReviewStatsByProductIds(products.map((product) => product.id));
  return applyReviewStatsToProducts(products, statsByProductId);
}
