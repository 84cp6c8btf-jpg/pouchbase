# PouchBase Core Schema

PouchBase is an editorial/reference product, not a store. The database separates canonical pouch facts, market availability, retailer price observations, public reviewer identity, and structured reviews.

This foundation intentionally stores no manual aggregate score columns. Public score values such as average burn, overall score, review count, and lowest price must be derived from `reviews` and `prices`.

## Tables

### brands

Canonical manufacturer/brand records.

Required: `id`, `name`, `slug`, `is_active`, `created_at`, `updated_at`.

Nullable: `description`, `website_url`, `logo_url`, `country_origin`.

Rules: `slug` is unique and URL-safe. Public catalog browsing reads from active brand records.

### products

Canonical pouch records. A product is not valid for live use unless every required product fact is present.

Required: `id`, `brand_id`, `name`, `slug`, `line`, `flavor`, `flavor_family`, `nicotine_mg`, `format`, `pouch_count`, `moisture_level`, `is_active`, `created_at`, `updated_at`.

Nullable: `description`, `image_url`, `gtin`, `source_url`.

Rules: `brand_id` references `brands`; `slug` is unique; `nicotine_mg` and `pouch_count` must be positive.

### product_markets

Availability by product and market, separate from canonical product facts.

Required: `id`, `product_id`, `market_code`, `is_available`, `created_at`, `updated_at`.

Nullable: none.

Rules: `product_id` references `products`; each `product_id` and `market_code` pair is unique.

### shops

Retailer/reference shop records for external price observation. PouchBase does not sell directly.

Required: `id`, `name`, `slug`, `website_url`, `market_code`, `is_active`, `created_at`, `updated_at`.

Nullable: `affiliate_base_url`.

Rules: `slug` is unique.

### prices

Point-in-time external price observations.

Required: `id`, `product_id`, `shop_id`, `product_url`, `currency`, `price_per_can`, `price_per_pouch`, `checked_at`, `created_at`, `updated_at`.

Nullable/defaulted: `in_stock` defaults to `true` and may be null if stock state is unknown.

Rules: `product_id` references `products`; `shop_id` references `shops`; price values must be zero or positive. Latest price should be derived by ordering `checked_at` descending per product/shop.

### profiles

Public reviewer identity layer. Email is never stored here and must never be exposed as public identity.

Required: `id`, `user_id`, `created_at`, `updated_at`.

Nullable: `display_name`.

Rules: `user_id` is unique and references Supabase Auth users. Users can manage only their own profile.

### reviews

Structured user reviews. These are the source of truth for public score derivation.

Required: `id`, `product_id`, `user_id`, `burn_rating`, `flavor_accuracy_rating`, `nicotine_feel_rating`, `comfort_rating`, `longevity_rating`, `value_rating`, `created_at`, `updated_at`.

Nullable: `review_text`.

Rules: `product_id` references `products`; `user_id` references `profiles.user_id`; one user can review each product once. All rating fields use a consistent integer `1` to `10` scale.

## Derived, Not Stored

Do not store these as manual source-of-truth columns:

- `avg_burn`
- `avg_flavor_accuracy`
- `avg_nicotine_feel`
- `avg_comfort`
- `avg_longevity`
- `avg_value`
- `avg_overall`
- `review_count`
- `lowest_price`
- `lowest_price_shop_id`

These should be computed from `reviews` and `prices` in queries, views, RPCs, or app-side read models. Public product scores should only be displayed once the configured real-review threshold is met.
