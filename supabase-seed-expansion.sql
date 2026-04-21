-- PouchBase Expansion Seed — takes the catalog from 14 → 55+ products
-- Safe to run multiple times (upserts by slug).

begin;

-- ============================================
-- NEW BRANDS
-- ============================================
insert into brands (name, slug, country, description, website_url)
values
  ('Nordic Spirit', 'nordic-spirit', 'Sweden', 'BAT-backed brand with polished branding and widely available across Europe. Known for consistent, approachable products.', 'https://www.nordicspirit.com'),
  ('Helwit', 'helwit', 'Sweden', 'Lower-strength Swedish brand focused on smooth flavor delivery and everyday usability for lighter users.', 'https://www.helwit.com'),
  ('Skruf', 'skruf', 'Sweden', 'Traditional Swedish snus heritage brand that expanded into modern nicotine pouches with Skruf Superwhite.', 'https://www.skruf.com'),
  ('Dope', 'dope', 'Sweden', 'Bold Scandinavian brand with strong mint and fruit flavors positioned between mainstream and extreme.', null),
  ('On!', 'on', 'Sweden', 'Mini-format nicotine pouch brand by Swedish Match, designed for discreet use with a dry, low-drip profile.', 'https://www.onnicotinepouches.com'),
  ('Iceberg', 'iceberg', 'Europe', 'High-strength European brand popular in the extreme pouch community for aggressive nicotine delivery.', null),
  ('Kurwa', 'kurwa', 'Poland', 'Polish ultra-strong brand with provocative branding and heavy nicotine content targeting experienced users.', null),
  ('Grant''s', 'grants', 'Europe', 'European nicotine pouch brand offering a range of classic and fruit flavors at moderate strengths.', null),
  ('Volt', 'volt', 'Sweden', 'Swedish Match brand delivering balanced flavor and nicotine in a modern slim format.', null),
  ('Cuba', 'cuba', 'Europe', 'European brand known for sweet, candy-like flavor profiles and a range of strength options.', null)
on conflict (slug) do update
set
  name = excluded.name,
  country = excluded.country,
  description = excluded.description,
  website_url = excluded.website_url;

-- ============================================
-- EXPANSION PRODUCTS
-- ============================================
with seed_products (
  brand_slug, name, slug, flavor, flavor_category, strength_mg, strength_label,
  format, pouches_per_can, moisture, weight_per_pouch, description,
  avg_burn, avg_flavor, avg_longevity, avg_overall, review_count
) as (
  values
    -- ZYN (adding more variants)
    ('zyn', 'Spearmint 6mg', 'zyn-spearmint-6mg', 'Spearmint', 'mint', 6, 'normal', 'slim', 20, 'dry', 0.7, 'Sweet spearmint profile with ZYN''s signature dry format. Reliable all-day pouch.', 3.8, 7.9, 6.8, 7.5, 28),
    ('zyn', 'Espressino 6mg', 'zyn-espressino-6mg', 'Espresso', 'coffee', 6, 'normal', 'slim', 20, 'dry', 0.7, 'Rich coffee flavor with subtle bitterness. A unique option for non-mint fans.', 3.4, 7.6, 6.2, 7.3, 15),
    ('zyn', 'Cool Mint Strong 9mg', 'zyn-cool-mint-strong-9mg', 'Cool Mint', 'mint', 9, 'strong', 'slim', 20, 'dry', 0.7, 'Stepped-up version of the classic Cool Mint with more nicotine punch.', 5.2, 8.0, 7.1, 7.8, 31),
    ('zyn', 'Bellini 6mg', 'zyn-bellini-6mg', 'Bellini', 'fruit', 6, 'normal', 'slim', 20, 'dry', 0.7, 'Peach and sparkling wine inspired flavor. Sweet and smooth.', 3.1, 7.4, 6.0, 7.1, 12),

    -- VELO (adding more variants)
    ('velo', 'Ice Cool 10mg', 'velo-ice-cool-10mg', 'Ice Cool', 'mint', 10, 'strong', 'slim', 20, 'moist', 0.7, 'Clean cooling mint with balanced strength. VELO''s everyday strong option.', 6.1, 7.8, 7.4, 7.7, 22),
    ('velo', 'Berry Frost 10mg', 'velo-berry-frost-10mg', 'Berry Frost', 'fruit', 10, 'strong', 'slim', 20, 'moist', 0.7, 'Mixed berry with a frosty finish. Sweet up front, cool on the back end.', 5.8, 8.2, 7.0, 7.9, 19),
    ('velo', 'Tropic Breeze 6mg', 'velo-tropic-breeze-6mg', 'Tropical', 'fruit', 6, 'normal', 'slim', 20, 'moist', 0.7, 'Light tropical fruit blend for easy daily rotation. Low burn, high flavor.', 3.2, 8.0, 6.5, 7.4, 14),
    ('velo', 'Ruby Berry 17mg', 'velo-ruby-berry-17mg', 'Ruby Berry', 'fruit', 17, 'extra-strong', 'slim', 20, 'moist', 0.7, 'Dark berry flavor with serious nicotine delivery and a lingering throat hit.', 8.1, 7.6, 7.8, 7.7, 20),

    -- LOOP (adding more variants)
    ('loop', 'Red Chili Melon Strong', 'loop-red-chili-melon-strong', 'Chili Melon', 'other', 9.4, 'strong', 'slim', 20, 'moist', 0.75, 'Watermelon sweetness meets a slow chili burn. Polarizing but addictive if it clicks.', 7.0, 8.5, 7.4, 8.2, 21),
    ('loop', 'Sicily Spritz Strong', 'loop-sicily-spritz-strong', 'Blood Orange', 'fruit', 9.4, 'strong', 'slim', 20, 'moist', 0.75, 'Blood orange and bitter aperol-style flavor. Sophisticated and unique.', 5.6, 8.6, 7.2, 8.3, 18),
    ('loop', 'Salty Ludicris', 'loop-salty-ludicris', 'Salmiak', 'other', 15, 'extra-strong', 'slim', 20, 'moist', 0.75, 'Salmiak licorice with heavy salt notes and hyper-strong nicotine. An acquired taste.', 8.5, 7.2, 8.0, 7.8, 23),

    -- Pablo (adding more variants)
    ('pablo', 'Banana Ice 30mg', 'pablo-banana-ice-30mg', 'Banana Ice', 'fruit', 30, 'super-strong', 'slim', 20, 'normal', 0.7, 'Sweet banana candy with an icy kick. Still hits like a Pablo.', 9.2, 7.3, 8.0, 7.7, 25),
    ('pablo', 'Mango Ice 30mg', 'pablo-mango-ice-30mg', 'Mango Ice', 'fruit', 30, 'super-strong', 'slim', 20, 'normal', 0.7, 'Tropical mango blended with menthol and absurd nicotine levels.', 9.3, 7.5, 8.1, 7.8, 19),
    ('pablo', 'Frosted Mint 50mg', 'pablo-frosted-mint-50mg', 'Frosted Mint', 'mint', 50, 'super-strong', 'slim', 20, 'normal', 0.7, 'One of the strongest pouches on the market. Pure icy mint and raw power.', 9.8, 6.8, 8.6, 7.5, 38),

    -- KILLA (adding more variants)
    ('killa', 'Watermelon', 'killa-watermelon', 'Watermelon', 'fruit', 16, 'extra-strong', 'slim', 20, 'normal', 0.8, 'Sweet watermelon candy flavor with KILLA''s trademark strong nicotine hit.', 8.4, 8.0, 7.5, 7.8, 22),
    ('killa', 'Apple', 'killa-apple', 'Apple', 'fruit', 16, 'extra-strong', 'slim', 20, 'normal', 0.8, 'Green apple sourness with a sweet finish and powerful delivery.', 8.2, 7.8, 7.4, 7.7, 15),
    ('killa', 'Banana Ice', 'killa-banana-ice', 'Banana Ice', 'fruit', 16, 'extra-strong', 'slim', 20, 'normal', 0.8, 'Smooth banana flavor with icy menthol undertone. One of KILLA''s tastier options.', 7.8, 8.3, 7.2, 8.0, 18),

    -- White Fox (adding more)
    ('white-fox', 'Double Mint', 'white-fox-double-mint', 'Double Mint', 'mint', 9, 'strong', 'slim', 20, 'normal', 0.7, 'Two-layer mint profile: spearmint on top, peppermint underneath. Smooth and clean.', 5.9, 8.4, 7.8, 8.2, 20),
    ('white-fox', 'Peppered Mint', 'white-fox-peppered-mint', 'Peppered Mint', 'mint', 16, 'extra-strong', 'slim', 20, 'normal', 0.7, 'Sharp peppermint with black pepper spice notes. Premium feel with serious kick.', 8.0, 7.9, 8.1, 8.0, 17),

    -- XQS (adding more)
    ('xqs', 'Elderflower', 'xqs-elderflower', 'Elderflower', 'other', 8, 'normal', 'slim', 20, 'normal', 0.7, 'Delicate elderflower flavor rarely seen in nicotine pouches. Floral and refreshing.', 4.2, 8.7, 7.0, 8.1, 16),
    ('xqs', 'Blueberry Mint', 'xqs-blueberry-mint', 'Blueberry Mint', 'fruit', 8, 'normal', 'slim', 20, 'normal', 0.7, 'Blueberry sweetness balanced with cool mint. Well-executed dual flavor.', 4.8, 8.5, 7.1, 8.0, 14),

    -- ACE (adding more)
    ('ace', 'Cool Eucalyptus', 'ace-cool-eucalyptus', 'Eucalyptus', 'mint', 9, 'strong', 'slim', 20, 'normal', 0.7, 'Herbal eucalyptus cooling that feels different from standard mint pouches. Refreshing twist.', 5.5, 8.1, 7.6, 8.0, 13),
    ('ace', 'Citrus', 'ace-citrus', 'Citrus', 'fruit', 5, 'light', 'slim', 20, 'normal', 0.7, 'Light lemon-lime flavor designed for easy daily use. Minimal burn.', 2.9, 7.8, 6.4, 7.3, 11),

    -- Nordic Spirit (new brand)
    ('nordic-spirit', 'Mint', 'nordic-spirit-mint', 'Mint', 'mint', 9, 'strong', 'slim', 20, 'normal', 0.7, 'Clean peppermint pouch widely available in stores across Europe. Reliable and polished.', 5.0, 7.7, 7.3, 7.6, 27),
    ('nordic-spirit', 'Bergamot Wildberry', 'nordic-spirit-bergamot-wildberry', 'Bergamot Wildberry', 'fruit', 9, 'strong', 'slim', 20, 'normal', 0.7, 'Earl Grey tea-like bergamot mixed with sweet berries. Unique and well-balanced.', 4.8, 8.4, 7.1, 8.0, 19),
    ('nordic-spirit', 'Watermelon', 'nordic-spirit-watermelon', 'Watermelon', 'fruit', 7, 'normal', 'slim', 20, 'normal', 0.7, 'Sweet watermelon that stays light and doesn''t overpower. Good entry pouch.', 3.6, 8.0, 6.8, 7.5, 15),
    ('nordic-spirit', 'Mocha', 'nordic-spirit-mocha', 'Mocha', 'coffee', 7, 'normal', 'slim', 20, 'normal', 0.7, 'Chocolate-coffee blend that delivers a warm, dessert-like experience.', 3.9, 7.6, 6.5, 7.3, 12),

    -- Helwit (new brand)
    ('helwit', 'Mint', 'helwit-mint', 'Mint', 'mint', 4, 'light', 'slim', 24, 'normal', 0.55, 'Gentle mint pouch at only 4mg. Perfect for lighter users or anyone cutting down.', 2.4, 7.5, 6.0, 7.2, 13),
    ('helwit', 'Banana', 'helwit-banana', 'Banana', 'fruit', 4, 'light', 'slim', 24, 'normal', 0.55, 'Mild banana flavor with barely any burn. One of the gentlest pouches available.', 1.8, 7.8, 5.8, 7.0, 10),
    ('helwit', 'Violet', 'helwit-violet', 'Violet', 'other', 4, 'light', 'slim', 24, 'normal', 0.55, 'Floral violet flavor that''s unusual and surprisingly pleasant. Very low nicotine.', 1.6, 8.2, 5.5, 7.4, 11),

    -- Skruf (new brand)
    ('skruf', 'Fresh Mint #3', 'skruf-fresh-mint-3', 'Fresh Mint', 'mint', 8, 'normal', 'slim', 20, 'normal', 0.7, 'Classic Skruf quality in a modern white pouch. Clean mint, medium strength.', 4.6, 7.9, 7.2, 7.7, 18),
    ('skruf', 'Frozen Shot #5', 'skruf-frozen-shot-5', 'Frozen Mint', 'mint', 14, 'extra-strong', 'slim', 20, 'normal', 0.7, 'Intense frozen mint with Skruf''s extra-strong nicotine kick.', 8.0, 7.5, 7.9, 7.8, 21),
    ('skruf', 'Blackcurrant #3', 'skruf-blackcurrant-3', 'Blackcurrant', 'fruit', 8, 'normal', 'slim', 20, 'normal', 0.7, 'Tart blackcurrant flavor with a natural sweetness. No artificial candy taste.', 4.3, 8.3, 7.0, 7.9, 14),

    -- Dope (new brand)
    ('dope', 'Freeze Crazy Strong', 'dope-freeze-crazy-strong', 'Freeze', 'mint', 28, 'super-strong', 'slim', 20, 'normal', 0.7, 'Extreme cooling mint with crazy nicotine levels. Not for beginners.', 9.4, 7.2, 8.3, 7.6, 30),
    ('dope', 'Lime Smash', 'dope-lime-smash', 'Lime', 'fruit', 16, 'extra-strong', 'slim', 20, 'normal', 0.7, 'Sharp lime zest with strong nicotine punch. Citrusy and aggressive.', 7.8, 8.0, 7.4, 7.8, 16),

    -- On! (new brand)
    ('on', 'Coffee 6mg', 'on-coffee-6mg', 'Coffee', 'coffee', 6, 'normal', 'mini', 20, 'dry', 0.3, 'Dry mini pouch with genuine coffee flavor. Ultra-discreet and low-drip.', 2.8, 7.3, 5.8, 7.0, 14),
    ('on', 'Mint 8mg', 'on-mint-8mg', 'Mint', 'mint', 8, 'normal', 'mini', 20, 'dry', 0.3, 'Small-format peppermint designed to be invisible under your lip.', 3.4, 7.5, 6.2, 7.2, 17),
    ('on', 'Berry 4mg', 'on-berry-4mg', 'Berry', 'fruit', 4, 'light', 'mini', 20, 'dry', 0.3, 'Light mixed berry in the smallest pouch format. Great for cautious starters.', 1.9, 7.6, 5.5, 7.1, 10),

    -- Iceberg (new brand)
    ('iceberg', 'Lemon Extra Strong', 'iceberg-lemon-extra-strong', 'Lemon', 'fruit', 20, 'extra-strong', 'slim', 20, 'normal', 0.7, 'Sour lemon candy flavor with heavy nicotine. Popular in the strong pouch scene.', 8.6, 7.8, 7.7, 7.8, 22),
    ('iceberg', 'Grape Extra Strong', 'iceberg-grape-extra-strong', 'Grape', 'fruit', 20, 'extra-strong', 'slim', 20, 'normal', 0.7, 'Sweet grape candy profile with serious strength. Divisive but has a following.', 8.4, 7.5, 7.5, 7.6, 18),

    -- Kurwa (new brand)
    ('kurwa', 'Fatality Grape Ice', 'kurwa-fatality-grape-ice', 'Grape Ice', 'fruit', 47, 'super-strong', 'slim', 20, 'normal', 0.7, 'Near top-shelf strength with sweet grape and menthol. Built for extreme users only.', 9.7, 6.9, 8.5, 7.4, 27),
    ('kurwa', 'Fatality Strawberry Ice', 'kurwa-fatality-strawberry-ice', 'Strawberry Ice', 'fruit', 47, 'super-strong', 'slim', 20, 'normal', 0.7, 'Candy strawberry meets absolute nicotine overkill. Infamous in the community.', 9.6, 7.1, 8.3, 7.5, 24),

    -- Volt (new brand)
    ('volt', 'Dark Frost', 'volt-dark-frost', 'Dark Mint', 'mint', 11, 'strong', 'slim', 20, 'normal', 0.7, 'Deep, dark mint flavor with a cool edge. Swedish Match quality at a fair price point.', 6.2, 8.0, 7.5, 7.9, 16),
    ('volt', 'Pearls Spearmint', 'volt-pearls-spearmint', 'Spearmint', 'mint', 7, 'normal', 'slim', 20, 'normal', 0.5, 'Gentle spearmint in a smaller format. Light and fresh.', 3.5, 7.7, 6.6, 7.4, 12),

    -- Cuba (new brand)
    ('cuba', 'Bubblegum', 'cuba-bubblegum', 'Bubblegum', 'other', 16, 'extra-strong', 'slim', 20, 'normal', 0.7, 'Sweet pink bubblegum flavor with a surprisingly strong nicotine delivery.', 7.6, 7.8, 7.0, 7.6, 15),
    ('cuba', 'Cola', 'cuba-cola', 'Cola', 'other', 16, 'extra-strong', 'slim', 20, 'normal', 0.7, 'Cola candy sweetness with fizzy notes. A novelty that actually delivers.', 7.4, 7.5, 6.8, 7.4, 13),

    -- Grant's (new brand)
    ('grants', 'Ice Cool', 'grants-ice-cool', 'Ice Cool', 'mint', 8, 'normal', 'slim', 20, 'normal', 0.7, 'Straightforward ice mint at a budget-friendly price. No frills, does the job.', 5.0, 7.4, 6.8, 7.2, 14),
    ('grants', 'Wild Berry', 'grants-wild-berry', 'Wild Berry', 'fruit', 8, 'normal', 'slim', 20, 'normal', 0.7, 'Mixed berry blend that leans sweet. A solid budget option for fruit lovers.', 4.6, 7.6, 6.5, 7.3, 11)
)
insert into products (
  brand_id, name, slug, flavor, flavor_category, strength_mg, strength_label,
  format, pouches_per_can, moisture, weight_per_pouch, description, image_url,
  avg_burn, avg_flavor, avg_longevity, avg_overall, review_count
)
select
  b.id, sp.name, sp.slug, sp.flavor, sp.flavor_category, sp.strength_mg, sp.strength_label,
  sp.format, sp.pouches_per_can, sp.moisture, sp.weight_per_pouch, sp.description, null,
  sp.avg_burn, sp.avg_flavor, sp.avg_longevity, sp.avg_overall, sp.review_count
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
  avg_burn = excluded.avg_burn,
  avg_flavor = excluded.avg_flavor,
  avg_longevity = excluded.avg_longevity,
  avg_overall = excluded.avg_overall,
  review_count = excluded.review_count,
  updated_at = now();

-- ============================================
-- EXPANSION PRICES
-- ============================================
with seed_prices (product_slug, shop_slug, price, pouches_in_can, currency, affiliate_url, in_stock) as (
  values
    -- ZYN expansion
    ('zyn-spearmint-6mg', 'swenico', 4.59, 20, 'EUR', 'https://www.swenico.com/search?q=zyn+spearmint', true),
    ('zyn-spearmint-6mg', 'snuscore', 4.85, 20, 'EUR', 'https://snuscore.com/search?q=zyn+spearmint', true),
    ('zyn-espressino-6mg', 'swenico', 4.59, 20, 'EUR', 'https://www.swenico.com/search?q=zyn+espressino', true),
    ('zyn-cool-mint-strong-9mg', 'swenico', 4.79, 20, 'EUR', 'https://www.swenico.com/search?q=zyn+cool+mint+strong', true),
    ('zyn-cool-mint-strong-9mg', 'snuscore', 5.09, 20, 'EUR', 'https://snuscore.com/search?q=zyn+cool+mint+strong', true),
    ('zyn-bellini-6mg', 'swenico', 4.59, 20, 'EUR', 'https://www.swenico.com/search?q=zyn+bellini', true),

    -- VELO expansion
    ('velo-ice-cool-10mg', 'swenico', 5.09, 20, 'EUR', 'https://www.swenico.com/search?q=velo+ice+cool', true),
    ('velo-ice-cool-10mg', 'snusmania', 5.19, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=velo+ice+cool', true),
    ('velo-berry-frost-10mg', 'swenico', 5.09, 20, 'EUR', 'https://www.swenico.com/search?q=velo+berry+frost', true),
    ('velo-tropic-breeze-6mg', 'swenico', 4.89, 20, 'EUR', 'https://www.swenico.com/search?q=velo+tropic+breeze', true),
    ('velo-ruby-berry-17mg', 'snusmania', 5.39, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=velo+ruby+berry', true),

    -- LOOP expansion
    ('loop-red-chili-melon-strong', 'swenico', 5.39, 20, 'EUR', 'https://www.swenico.com/search?q=loop+red+chili+melon', true),
    ('loop-sicily-spritz-strong', 'swenico', 5.39, 20, 'EUR', 'https://www.swenico.com/search?q=loop+sicily+spritz', true),
    ('loop-salty-ludicris', 'swenico', 5.49, 20, 'EUR', 'https://www.swenico.com/search?q=loop+salty+ludicris', true),

    -- Pablo expansion
    ('pablo-banana-ice-30mg', 'snusmania', 4.79, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=pablo+banana+ice', true),
    ('pablo-banana-ice-30mg', 'nicopods-uk', 4.99, 20, 'GBP', 'https://www.nicopodsuk.com/search?q=pablo+banana+ice', true),
    ('pablo-mango-ice-30mg', 'snusmania', 4.79, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=pablo+mango+ice', true),
    ('pablo-frosted-mint-50mg', 'snusmania', 5.29, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=pablo+frosted+mint', true),
    ('pablo-frosted-mint-50mg', 'nicopods-uk', 5.49, 20, 'GBP', 'https://www.nicopodsuk.com/search?q=pablo+frosted+mint', true),

    -- KILLA expansion
    ('killa-watermelon', 'snusmania', 4.39, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=killa+watermelon', true),
    ('killa-apple', 'snusmania', 4.39, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=killa+apple', true),
    ('killa-banana-ice', 'snusmania', 4.39, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=killa+banana+ice', true),
    ('killa-banana-ice', 'nicopods-uk', 4.59, 20, 'GBP', 'https://www.nicopodsuk.com/search?q=killa+banana+ice', true),

    -- Nordic Spirit
    ('nordic-spirit-mint', 'swenico', 5.19, 20, 'EUR', 'https://www.swenico.com/search?q=nordic+spirit+mint', true),
    ('nordic-spirit-mint', 'snuscore', 5.35, 20, 'EUR', 'https://snuscore.com/search?q=nordic+spirit+mint', true),
    ('nordic-spirit-bergamot-wildberry', 'swenico', 5.19, 20, 'EUR', 'https://www.swenico.com/search?q=nordic+spirit+bergamot', true),
    ('nordic-spirit-watermelon', 'swenico', 5.09, 20, 'EUR', 'https://www.swenico.com/search?q=nordic+spirit+watermelon', true),

    -- Skruf
    ('skruf-fresh-mint-3', 'swenico', 4.89, 20, 'EUR', 'https://www.swenico.com/search?q=skruf+fresh+mint', true),
    ('skruf-frozen-shot-5', 'swenico', 4.99, 20, 'EUR', 'https://www.swenico.com/search?q=skruf+frozen+shot', true),
    ('skruf-blackcurrant-3', 'swenico', 4.89, 20, 'EUR', 'https://www.swenico.com/search?q=skruf+blackcurrant', true),

    -- Dope
    ('dope-freeze-crazy-strong', 'snusmania', 4.99, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=dope+freeze', true),
    ('dope-lime-smash', 'snusmania', 4.69, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=dope+lime+smash', true),

    -- On!
    ('on-coffee-6mg', 'swenico', 4.29, 20, 'EUR', 'https://www.swenico.com/search?q=on+coffee', true),
    ('on-mint-8mg', 'swenico', 4.29, 20, 'EUR', 'https://www.swenico.com/search?q=on+mint', true),
    ('on-berry-4mg', 'swenico', 4.29, 20, 'EUR', 'https://www.swenico.com/search?q=on+berry', true),

    -- Iceberg
    ('iceberg-lemon-extra-strong', 'snusmania', 4.59, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=iceberg+lemon', true),
    ('iceberg-grape-extra-strong', 'snusmania', 4.59, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=iceberg+grape', true),

    -- Kurwa
    ('kurwa-fatality-grape-ice', 'snusmania', 5.49, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=kurwa+fatality+grape', true),
    ('kurwa-fatality-strawberry-ice', 'snusmania', 5.49, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=kurwa+fatality+strawberry', true),

    -- Volt
    ('volt-dark-frost', 'swenico', 4.79, 20, 'EUR', 'https://www.swenico.com/search?q=volt+dark+frost', true),
    ('volt-pearls-spearmint', 'swenico', 4.69, 20, 'EUR', 'https://www.swenico.com/search?q=volt+pearls+spearmint', true),

    -- Cuba
    ('cuba-bubblegum', 'snusmania', 4.49, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=cuba+bubblegum', true),
    ('cuba-cola', 'snusmania', 4.49, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=cuba+cola', true),

    -- Grant's
    ('grants-ice-cool', 'snusmania', 3.99, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=grants+ice+cool', true),
    ('grants-wild-berry', 'snusmania', 3.99, 20, 'EUR', 'https://www.snusmania.eu/search?type=product&q=grants+wild+berry', true)
)
insert into prices (product_id, shop_id, price, pouches_in_can, currency, affiliate_url, in_stock)
select p.id, s.id, sp.price, sp.pouches_in_can, sp.currency, sp.affiliate_url, sp.in_stock
from seed_prices sp
join products p on p.slug = sp.product_slug
join shops s on s.slug = sp.shop_slug
on conflict (product_id, shop_id) do update
set
  price = excluded.price,
  pouches_in_can = excluded.pouches_in_can,
  currency = excluded.currency,
  affiliate_url = excluded.affiliate_url,
  in_stock = excluded.in_stock,
  last_checked = now();

commit;
