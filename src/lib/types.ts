export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  country_origin: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Compatibility alias used by existing catalog components.
  country?: string | null;
}

export type RelationResult<T> = T | T[] | null;

export function unwrapRelation<T>(relation: RelationResult<T> | undefined): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation ?? null;
}

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  line: string;
  flavor: string;
  flavor_family: string;
  nicotine_mg: number;
  format: string;
  pouch_count: number;
  moisture_level: string;
  description: string | null;
  image_url: string | null;
  gtin: string | null;
  source_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  brands?: RelationResult<Partial<Brand>>;
  // Compatibility aliases used while the UI is moved off the old stored-score schema.
  flavor_category: string;
  strength_mg: number;
  strength_label?: string | null;
  pouches_per_can: number;
  moisture: string;
  avg_burn: number;
  avg_flavor: number;
  avg_flavor_accuracy: number;
  avg_nicotine_feel: number;
  avg_comfort: number;
  avg_longevity: number;
  avg_value: number;
  avg_overall: number;
  review_count: number;
}

export interface ProductMarket {
  id: string;
  product_id: string;
  market_code: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  burn_rating: number;
  flavor_accuracy_rating: number;
  nicotine_feel_rating: number;
  comfort_rating: number;
  longevity_rating: number;
  value_rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  // Compatibility aliases for legacy review UI labels.
  flavor_rating?: number;
  overall_rating?: number;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  website_url: string;
  market_code: string;
  affiliate_base_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Price {
  id: string;
  product_id: string;
  shop_id: string;
  product_url: string;
  currency: string;
  price_per_can: number;
  price_per_pouch: number;
  in_stock: boolean | null;
  checked_at: string;
  created_at: string;
  updated_at: string;
  shops?: Shop;
  // Compatibility aliases for legacy price components.
  price?: number;
  affiliate_url?: string | null;
  pouches_in_can?: number;
}

export type FlavorCategory = "mint" | "fruit" | "coffee" | "tobacco" | "other";
export type Format = "slim" | "mini" | "regular" | "large";
export type Moisture = "dry" | "normal" | "moist";

export const FLAVOR_CATEGORIES: FlavorCategory[] = ["mint", "fruit", "coffee", "tobacco", "other"];
export const FORMATS: Format[] = ["slim", "mini", "regular", "large"];

export function applyProductDerivedDefaults<T extends object>(product: T): T & Product {
  const source = product as Partial<Product>;
  const nicotineMg = Number(source.nicotine_mg ?? source.strength_mg ?? 0);
  const pouchCount = Number(source.pouch_count ?? source.pouches_per_can ?? 0);
  const flavorFamily = String(source.flavor_family ?? source.flavor_category ?? "other");
  const moistureLevel = String(source.moisture_level ?? source.moisture ?? "normal");

  return {
    avg_burn: 0,
    avg_flavor: 0,
    avg_flavor_accuracy: 0,
    avg_nicotine_feel: 0,
    avg_comfort: 0,
    avg_longevity: 0,
    avg_value: 0,
    avg_overall: 0,
    review_count: 0,
    strength_mg: nicotineMg,
    flavor_category: flavorFamily,
    pouches_per_can: pouchCount,
    moisture: moistureLevel,
    ...product,
    nicotine_mg: nicotineMg,
    flavor_family: flavorFamily,
    pouch_count: pouchCount,
    moisture_level: moistureLevel,
  } as T & Product;
}

export function applyProductsDerivedDefaults<T extends object>(products: T[] | null | undefined) {
  return (products || []).map((product) => applyProductDerivedDefaults(product));
}
