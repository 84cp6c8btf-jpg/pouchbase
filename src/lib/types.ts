export interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
}

export type RelationResult<T> = T | T[] | null;

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  flavor: string;
  flavor_category: string;
  strength_mg: number;
  strength_label: string | null;
  format: string;
  pouches_per_can: number;
  moisture: string;
  weight_per_pouch: number | null;
  description: string | null;
  image_url: string | null;
  avg_burn: number;
  avg_flavor: number;
  avg_longevity: number;
  avg_overall: number;
  review_count: number;
  created_at: string;
  brands?: RelationResult<Brand>;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  burn_rating: number;
  flavor_rating: number;
  longevity_rating: number;
  overall_rating: number;
  review_text: string | null;
  helpful_count: number;
  created_at: string;
  profiles?: Profile;
}

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  review_count: number;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  website_url: string;
  logo_url: string | null;
  shipping_info: string | null;
}

export interface Price {
  id: string;
  product_id: string;
  shop_id: string;
  price: number;
  pouches_in_can: number;
  currency: string;
  affiliate_url: string | null;
  in_stock: boolean;
  shops?: Shop;
}

export type FlavorCategory = "mint" | "fruit" | "coffee" | "tobacco" | "other";
export type StrengthLabel = "light" | "normal" | "strong" | "extra-strong" | "super-strong";
export type Format = "slim" | "mini" | "regular" | "large";
export type Moisture = "dry" | "normal" | "moist";

export const FLAVOR_CATEGORIES: FlavorCategory[] = ["mint", "fruit", "coffee", "tobacco", "other"];
export const STRENGTH_LABELS: StrengthLabel[] = ["light", "normal", "strong", "extra-strong", "super-strong"];
export const FORMATS: Format[] = ["slim", "mini", "regular", "large"];
