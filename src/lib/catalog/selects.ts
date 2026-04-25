export const PRODUCT_BASE_SELECT =
  "id, brand_id, name, slug, line, flavor, flavor_family, flavor_category:flavor_family, nicotine_mg, strength_mg:nicotine_mg, format, pouch_count, pouches_per_can:pouch_count, moisture_level, moisture:moisture_level, description, image_url, gtin, source_url, is_active, created_at, updated_at" as const;
export const PRODUCT_WITH_BRAND_SELECT = `${PRODUCT_BASE_SELECT}, brands(name, slug)` as const;
export const PRODUCT_WITH_BRAND_COUNTRY_SELECT =
  `${PRODUCT_BASE_SELECT}, brands(name, slug, country_origin, country:country_origin)` as const;
export const PRODUCT_CATALOG_SELECT =
  `${PRODUCT_BASE_SELECT}, brands(name, slug)` as const;
export const PRODUCT_METADATA_SELECT =
  "name, flavor, nicotine_mg, strength_mg:nicotine_mg, brands(name)" as const;
export const PRODUCT_OG_SELECT =
  "name, flavor, nicotine_mg, strength_mg:nicotine_mg, brands(name)" as const;
