-- PouchBase starter seed
-- Safe to run multiple times. Existing rows are updated by slug/name.
-- Product rating aggregates are recalculated from the real reviews table at
-- the end of this script. Seed products should never ship with invented
-- community review counts or averages.

begin;

-- ============================================
-- BRANDS
-- ============================================
insert into brands (name, slug, country, description, website_url)
values
  (
    'ZYN',
    'zyn',
    'Sweden',
    'Mass-market nicotine pouch brand known for clean mint profiles and approachable strengths.',
    'https://www.zyn.com'
  ),
  (
    'VELO',
    'velo',
    'Sweden',
    'Modern all-rounder brand with broad flavor coverage from everyday mint to stronger fruit blends.',
    'https://www.velo.com'
  ),
  (
    'LOOP',
    'loop',
    'Sweden',
    'Flavor-forward Scandinavian pouch brand with playful combinations and a strong moisture profile.',
    'https://www.loopnicotinepouches.com'
  ),
  (
    'Pablo',
    'pablo',
    'Poland',
    'High-strength brand with a reputation for aggressive burn and no-nonsense performance.',
    null
  ),
  (
    'Siberia',
    'siberia',
    'Sweden',
    'Legendary ultra-strong name in the category, built around extreme nicotine strength and icy profiles.',
    'https://www.siberiasnus.com'
  ),
  (
    'White Fox',
    'white-fox',
    'Sweden',
    'Premium-feeling white pouch line that balances strong nicotine with polished mint flavors.',
    null
  ),
  (
    'KILLA',
    'killa',
    'Poland',
    'Strong pouch brand popular for sharp mint, candy-style fruit flavors, and punchy delivery.',
    'https://killapods.eu'
  ),
  (
    'XQS',
    'xqs',
    'Sweden',
    'Design-led pouch brand focused on balanced strength and distinctive flavor blends.',
    'https://xqs.com'
  ),
  (
    'ACE',
    'ace',
    'Denmark',
    'Clean Scandinavian-style pouches positioned around smooth nicotine delivery and everyday usability.',
    'https://acex.dk'
  )
on conflict (slug) do update
set
  name = excluded.name,
  country = excluded.country,
  description = excluded.description,
  website_url = excluded.website_url;

-- ============================================
-- SHOPS
-- ============================================
insert into shops (name, slug, website_url, affiliate_url_template, shipping_info)
values
  (
    'Swenico',
    'swenico',
    'https://www.swenico.com',
    'https://www.swenico.com/search?q={product}',
    'European shipping. Affiliate template is a placeholder.'
  ),
  (
    'SnusCore',
    'snuscore',
    'https://snuscore.com',
    'https://snuscore.com/search?q={product}',
    'European pouch retailer. Affiliate template is a placeholder.'
  ),
  (
    'Nicopods UK',
    'nicopods-uk',
    'https://www.nicopodsuk.com',
    'https://www.nicopodsuk.com/search?q={product}',
    'UK-focused shop. Affiliate template is a placeholder.'
  ),
  (
    'Snusmania',
    'snusmania',
    'https://www.snusmania.eu',
    'https://www.snusmania.eu/search?type=product&q={product}',
    'EU retailer. Affiliate template is a placeholder.'
  )
on conflict (slug) do update
set
  name = excluded.name,
  website_url = excluded.website_url,
  affiliate_url_template = excluded.affiliate_url_template,
  shipping_info = excluded.shipping_info;

-- ============================================
-- PRODUCTS
-- ============================================
with seed_products (
  brand_slug,
  name,
  slug,
  flavor,
  flavor_category,
  strength_mg,
  strength_label,
  format,
  pouches_per_can,
  moisture,
  weight_per_pouch,
  description,
  avg_burn,
  avg_flavor,
  avg_longevity,
  avg_overall,
  review_count
) as (
  values
    ('zyn', 'Cool Mint Mini 3mg', 'zyn-cool-mint-mini-3mg', 'Cool Mint', 'mint', 3, 'light', 'mini', 20, 'dry', 0.4, 'A crisp peppermint pouch for lighter daily use with a very controlled burn.', 3.2, 8.1, 6.3, 7.4, 34),
    ('zyn', 'Citrus Mini 6mg', 'zyn-citrus-mini-6mg', 'Citrus', 'fruit', 6, 'normal', 'mini', 20, 'dry', 0.4, 'Bright citrus peel profile with a gentle tingle and easy all-day strength.', 3.5, 7.7, 6.5, 7.2, 21),
    ('velo', 'Freeze Max 17mg', 'velo-freeze-max-17mg', 'Freeze', 'mint', 17, 'extra-strong', 'slim', 20, 'moist', 0.7, 'Intense cooling mint pouch with a fast nicotine release and big hit.', 8.7, 7.4, 7.9, 8.0, 29),
    ('velo', 'Lime Flame 10mg', 'velo-lime-flame-10mg', 'Lime', 'fruit', 10, 'strong', 'slim', 20, 'moist', 0.7, 'Sharp lime-led flavor with a slightly sweet finish and moderate burn.', 6.4, 8.0, 7.2, 7.8, 18),
    ('loop', 'Jalapeno Lime Strong', 'loop-jalapeno-lime-strong', 'Jalapeno Lime', 'other', 9.4, 'strong', 'slim', 20, 'moist', 0.75, 'One of the most distinctive pouch flavors around: green chili bite with bright lime.', 7.3, 8.8, 7.6, 8.5, 26),
    ('loop', 'Mint Mania Hyper Strong', 'loop-mint-mania-hyper-strong', 'Mint Mania', 'mint', 15, 'extra-strong', 'slim', 20, 'moist', 0.75, 'Wet-format mint pouch with a rapid release and long-lasting cooling profile.', 8.2, 8.1, 8.3, 8.4, 24),
    ('pablo', 'Ice Cold 30mg', 'pablo-ice-cold-30mg', 'Ice Cold', 'mint', 30, 'super-strong', 'slim', 20, 'normal', 0.7, 'Classic high-strength ice mint pouch with a brutal opening burn and heavy nicotine punch.', 9.6, 7.1, 8.4, 8.2, 41),
    ('pablo', 'Red 24mg', 'pablo-red-24mg', 'Cherry Ice', 'fruit', 24, 'super-strong', 'slim', 20, 'normal', 0.7, 'Candy cherry profile backed by strong nicotine delivery and a sharp throat-style hit.', 8.9, 7.5, 7.8, 7.9, 17),
    ('siberia', 'Extremely Strong Slim', 'siberia-extremely-strong-slim', 'Mint', 'mint', 43, 'super-strong', 'slim', 20, 'dry', 0.65, 'The benchmark for extreme pouches: icy, dry, and famously unforgiving.', 9.9, 6.4, 8.8, 7.8, 52),
    ('white-fox', 'Full Charge', 'white-fox-full-charge', 'Peppermint', 'mint', 12, 'strong', 'slim', 20, 'normal', 0.7, 'Clean peppermint pouch with premium-feeling release and a smooth but serious nicotine level.', 7.2, 8.2, 8.0, 8.3, 23),
    ('killa', 'Cold Mint', 'killa-cold-mint', 'Cold Mint', 'mint', 16, 'extra-strong', 'slim', 20, 'normal', 0.8, 'Big icy mint flavor with an immediate hit and a reputation for strong lip burn.', 8.8, 7.6, 7.7, 7.9, 31),
    ('killa', 'Blueberry', 'killa-blueberry', 'Blueberry', 'fruit', 13, 'strong', 'slim', 20, 'normal', 0.8, 'Sweet blueberry pouch that still keeps enough sting to feel like a KILLA product.', 7.1, 8.1, 7.3, 7.8, 16),
    ('xqs', 'Tropical Strong', 'xqs-tropical-strong', 'Tropical', 'fruit', 8, 'normal', 'slim', 20, 'normal', 0.7, 'Balanced tropical fruit pouch for users who want flavor first and a manageable burn second.', 5.4, 8.4, 7.2, 8.0, 19),
    ('ace', 'Spearmint', 'ace-spearmint', 'Spearmint', 'mint', 9, 'strong', 'slim', 20, 'normal', 0.7, 'Fresh spearmint pouch with polished Scandinavian styling and steady nicotine delivery.', 5.8, 8.0, 7.4, 7.9, 14)
)
insert into products (
  brand_id,
  name,
  slug,
  flavor,
  flavor_category,
  strength_mg,
  strength_label,
  format,
  pouches_per_can,
  moisture,
  weight_per_pouch,
  description,
  image_url,
  avg_burn,
  avg_flavor,
  avg_longevity,
  avg_overall,
  review_count
)
select
  b.id,
  sp.name,
  sp.slug,
  sp.flavor,
  sp.flavor_category,
  sp.strength_mg,
  sp.strength_label,
  sp.format,
  sp.pouches_per_can,
  sp.moisture,
  sp.weight_per_pouch,
  sp.description,
  null,
  sp.avg_burn,
  sp.avg_flavor,
  sp.avg_longevity,
  sp.avg_overall,
  sp.review_count
from seed_products sp
join brands b on b.slug = sp.brand_slug
on conflict (slug) do update
set
  brand_id = excluded.brand_id,
  name = excluded.name,
  flavor = excluded.flavor,
  flavor_category = excluded.flavor_category,
  strength_mg = excluded.strength_mg,
  strength_label = excluded.strength_label,
  format = excluded.format,
  pouches_per_can = excluded.pouches_per_can,
  moisture = excluded.moisture,
  weight_per_pouch = excluded.weight_per_pouch,
  description = excluded.description,
  image_url = excluded.image_url,
  avg_burn = excluded.avg_burn,
  avg_flavor = excluded.avg_flavor,
  avg_longevity = excluded.avg_longevity,
  avg_overall = excluded.avg_overall,
  review_count = excluded.review_count,
  updated_at = now();

-- ============================================
-- REVIEW AGGREGATES (REAL REVIEWS ONLY)
-- ============================================
with review_rollup as (
  select
    product_id,
    coalesce(avg(burn_rating), 0) as avg_burn,
    coalesce(avg(flavor_rating), 0) as avg_flavor,
    coalesce(avg(longevity_rating), 0) as avg_longevity,
    coalesce(avg(overall_rating), 0) as avg_overall,
    count(*)::integer as review_count
  from reviews
  group by product_id
)
update products p
set
  avg_burn = coalesce(rr.avg_burn, 0),
  avg_flavor = coalesce(rr.avg_flavor, 0),
  avg_longevity = coalesce(rr.avg_longevity, 0),
  avg_overall = coalesce(rr.avg_overall, 0),
  review_count = coalesce(rr.review_count, 0),
  updated_at = now()
from review_rollup rr
where p.id = rr.product_id;

update products p
set
  avg_burn = 0,
  avg_flavor = 0,
  avg_longevity = 0,
  avg_overall = 0,
  review_count = 0,
  updated_at = now()
where not exists (
  select 1
  from reviews r
  where r.product_id = p.id
);

-- ============================================
-- CANONICAL DATA SAFETY
-- ============================================
-- Base seed rows keep structured product facts only. Narrative descriptions and
-- retailer prices must come from verified sources, so they are not seeded here.
update brands
set
  description = null;

update shops
set
  shipping_info = null;

delete from prices;

update products
set
  description = null,
  updated_at = now();

-- ============================================
-- WEEKLY POLL
-- ============================================
insert into polls (slug, question, status, category, week_label, starts_at, cta_label)
values (
  'mint-burn-battle-2026-w17',
  'Which burns harder?',
  'active',
  'burn',
  'Week 17',
  now(),
  'Compare these two'
)
on conflict (slug) do update
set
  question = excluded.question,
  status = excluded.status,
  category = excluded.category,
  week_label = excluded.week_label,
  starts_at = excluded.starts_at,
  cta_label = excluded.cta_label,
  updated_at = now();

update polls
set status = 'archived', updated_at = now()
where slug <> 'mint-burn-battle-2026-w17' and status = 'active';

with active_poll as (
  select id
  from polls
  where slug = 'mint-burn-battle-2026-w17'
),
option_rows as (
  select
    ap.id as poll_id,
    p.id as product_id,
    row_number() over (order by p.slug) as sort_order
  from active_poll ap
  join products p on p.slug in ('pablo-ice-cold-30mg', 'siberia-extremely-strong-slim')
)
insert into poll_options (poll_id, product_id, sort_order)
select poll_id, product_id, sort_order
from option_rows
on conflict (poll_id, sort_order) do update
set product_id = excluded.product_id;

commit;
