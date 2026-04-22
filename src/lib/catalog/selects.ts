export const PRODUCT_WITH_BRAND_SELECT = "*, brands(name, slug)" as const;
export const PRODUCT_WITH_BRAND_COUNTRY_SELECT = "*, brands(name, slug, country)" as const;
export const PRODUCT_CATALOG_SELECT =
  "id, brand_id, name, slug, flavor, flavor_category, strength_mg, strength_label, format, pouches_per_can, moisture, weight_per_pouch, description, image_url, avg_burn, avg_flavor, avg_longevity, avg_overall, review_count, created_at, brands(name, slug)" as const;
export const PRODUCT_METADATA_SELECT =
  "name, flavor, strength_mg, avg_overall, review_count, brands(name)" as const;
export const PRODUCT_OG_SELECT =
  "name, flavor, strength_mg, strength_label, avg_burn, avg_overall, review_count, brands(name)" as const;
export const POLL_OPTION_WITH_PRODUCT_SELECT =
  `id, poll_id, label, sort_order, product_id, products(${PRODUCT_CATALOG_SELECT})` as const;
