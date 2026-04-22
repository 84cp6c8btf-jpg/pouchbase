-- PouchBase Expansion Seed — takes the catalog from 14 → 55+ products
-- Safe to run multiple times (upserts by slug).
-- Product rating aggregates are recalculated from the real reviews table at
-- the end of this script so expansion products do not inherit fake community
-- numbers.

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
    ('grants', 'Wild Berry', 'grants-wild-berry', 'Wild Berry', 'fruit', 8, 'normal', 'slim', 20, 'normal', 0.7, 'Mixed berry blend that leans sweet. A solid budget option for fruit lovers.', 4.6, 7.6, 6.5, 7.3, 11),

    -- 2026 sourced launch additions
    -- Sources:
    -- - Official ZYN product pages on zyn.com (UK/Europe)
    -- - Official VELO UK product pages on velo.com
    -- - Official Nordic Spirit UK product pages on nordicspirit.co.uk

    -- ZYN
    ('zyn', 'Black Cherry Mini 3mg', 'zyn-black-cherry-mini-3mg', 'Black Cherry', 'fruit', 3, 'light', 'mini', 20, 'dry', null, 'Mini dry pouch with black cherry flavor and notes of forest berries and vanilla.', 0, 0, 0, 0, 0),
    ('zyn', 'Black Cherry Mini 6mg', 'zyn-black-cherry-mini-6mg', 'Black Cherry', 'fruit', 6, 'normal', 'mini', 20, 'dry', null, 'Mini dry pouch with black cherry flavor and notes of forest berries and vanilla.', 0, 0, 0, 0, 0),
    ('zyn', 'Apple Mint Mini 6mg', 'zyn-apple-mint-mini-6mg', 'Apple Mint', 'fruit', 6, 'normal', 'mini', 20, 'dry', null, 'Mini dry pouch with green apple, peppermint, and spearmint notes.', 0, 0, 0, 0, 0),
    ('zyn', 'Guava Spice 11mg', 'zyn-guava-spice-11mg', 'Guava Spice', 'other', 11, 'strong', 'regular', 21, 'moist', null, 'Regular pouch with guava and chili flavor.', 0, 0, 0, 0, 0),
    ('zyn', 'Cool Mint 11mg', 'zyn-cool-mint-11mg', 'Cool Mint', 'mint', 11, 'strong', 'regular', 21, 'moist', null, 'Regular pouch with peppermint and menthol flavor.', 0, 0, 0, 0, 0),

    -- VELO
    ('velo', 'Crispy Peppermint 6mg', 'velo-crispy-peppermint-6mg', 'Crispy Peppermint', 'mint', 6, 'normal', 'slim', 20, null, null, 'Slim pouch with peppermint flavor and a cooling aftertaste.', 0, 0, 0, 0, 0),
    ('velo', 'Crispy Peppermint 10mg', 'velo-crispy-peppermint-10mg', 'Crispy Peppermint', 'mint', 10, 'strong', 'slim', 20, null, null, 'Slim pouch with peppermint flavor and a cooling aftertaste.', 0, 0, 0, 0, 0),
    ('velo', 'Icy Berries 10mg', 'velo-icy-berries-10mg', 'Icy Berries', 'fruit', 10, 'strong', 'slim', 20, null, null, 'Slim pouch with blueberry, raspberry, and blackberry flavor plus cooling.', 0, 0, 0, 0, 0),
    ('velo', 'Icy Berries 14mg', 'velo-icy-berries-14mg', 'Icy Berries', 'fruit', 14, 'extra-strong', 'slim', 20, null, null, 'Slim pouch with blueberry, raspberry, and blackberry flavor plus cooling.', 0, 0, 0, 0, 0),
    ('velo', 'Icy Berries 17mg', 'velo-icy-berries-17mg', 'Icy Berries', 'fruit', 17, 'extra-strong', 'slim', 20, null, null, 'Slim pouch with blueberry, raspberry, and blackberry flavor plus cooling.', 0, 0, 0, 0, 0),
    ('velo', 'Tropical Mango 6mg', 'velo-tropical-mango-6mg', 'Tropical Mango', 'fruit', 6, 'normal', 'slim', 20, null, null, 'Slim pouch with mandarin, passionfruit, and mango flavors.', 0, 0, 0, 0, 0),
    ('velo', 'Tropical Mango 10mg', 'velo-tropical-mango-10mg', 'Tropical Mango', 'fruit', 10, 'strong', 'slim', 20, null, null, 'Slim pouch with mandarin, passionfruit, and mango flavors.', 0, 0, 0, 0, 0),
    ('velo', 'Strawberry Ice Mini 6mg', 'velo-strawberry-ice-mini-6mg', 'Strawberry Ice', 'fruit', 6, 'normal', 'mini', 15, null, null, 'Mini pouch with strawberry flavor and cooling effect.', 0, 0, 0, 0, 0),
    ('velo', 'Strawberry Ice 10mg', 'velo-strawberry-ice-10mg', 'Strawberry Ice', 'fruit', 10, 'strong', 'slim', 20, null, null, 'Slim pouch with strawberry flavor and cooling effect.', 0, 0, 0, 0, 0),
    ('velo', 'Orange Ice 10mg', 'velo-orange-ice-10mg', 'Orange Ice', 'fruit', 10, 'strong', 'slim', 20, null, null, 'Slim pouch with orange flavor and cooling effect.', 0, 0, 0, 0, 0),
    ('velo', 'Mango Flame 10mg', 'velo-mango-flame-10mg', 'Mango Flame', 'fruit', 10, 'strong', 'slim', 20, null, null, 'Slim pouch with ripe mango flavor.', 0, 0, 0, 0, 0),
    ('velo', 'Mango Ice 10mg', 'velo-mango-ice-10mg', 'Mango Ice', 'fruit', 10, 'strong', 'slim', 20, null, null, 'Slim pouch with cooling mango flavor.', 0, 0, 0, 0, 0),

    -- Nordic Spirit
    ('nordic-spirit', 'Mint Mini 3mg', 'nordic-spirit-mint-mini-3mg', 'Mint', 'mint', 3, 'light', 'mini', 20, null, null, 'Mini pouch with menthol and peppermint flavor.', 0, 0, 0, 0, 0),
    ('nordic-spirit', 'Mint 6mg', 'nordic-spirit-mint-6mg', 'Mint', 'mint', 6, 'normal', 'regular', 20, null, null, 'Standard pouch with menthol and peppermint flavor.', 0, 0, 0, 0, 0),
    ('nordic-spirit', 'Mint 9mg', 'nordic-spirit-mint-9mg', 'Mint', 'mint', 9, 'strong', 'regular', 20, null, null, 'Standard pouch with menthol and peppermint flavor.', 0, 0, 0, 0, 0),
    ('nordic-spirit', 'Mint 11mg', 'nordic-spirit-mint-11mg', 'Mint', 'mint', 11, 'strong', 'regular', 20, null, null, 'Standard pouch with menthol and peppermint flavor.', 0, 0, 0, 0, 0),
    ('nordic-spirit', 'Spearmint Mini 3mg', 'nordic-spirit-spearmint-mini-3mg', 'Spearmint', 'mint', 3, 'light', 'mini', 20, null, null, 'Mini pouch with sweet spearmint and menthol flavor.', 0, 0, 0, 0, 0),
    ('nordic-spirit', 'Spearmint 6mg', 'nordic-spirit-spearmint-6mg', 'Spearmint', 'mint', 6, 'normal', 'regular', 20, null, null, 'Standard pouch with sweet spearmint and menthol flavor.', 0, 0, 0, 0, 0),
    ('nordic-spirit', 'Spearmint 9mg', 'nordic-spirit-spearmint-9mg', 'Spearmint', 'mint', 9, 'strong', 'regular', 20, null, null, 'Standard pouch with sweet spearmint and menthol flavor.', 0, 0, 0, 0, 0),
    ('nordic-spirit', 'Spearmint 11mg', 'nordic-spirit-spearmint-11mg', 'Spearmint', 'mint', 11, 'strong', 'regular', 20, null, null, 'Standard pouch with sweet spearmint and menthol flavor.', 0, 0, 0, 0, 0),
    ('nordic-spirit', 'Bergamot Wildberry 6mg', 'nordic-spirit-bergamot-wildberry-6mg', 'Bergamot Wildberry', 'fruit', 6, 'normal', 'regular', 20, null, null, 'Standard pouch with wild berry flavor and bergamot citrus aftertaste.', 0, 0, 0, 0, 0),
    ('nordic-spirit', 'Bergamot Wildberry 11mg', 'nordic-spirit-bergamot-wildberry-11mg', 'Bergamot Wildberry', 'fruit', 11, 'strong', 'regular', 20, null, null, 'Standard pouch with wild berry flavor and bergamot citrus aftertaste.', 0, 0, 0, 0, 0)
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
-- CANONICAL DATA SAFETY
-- ============================================
-- Expansion rows are kept as structured catalog facts. Unsourced narrative
-- copy and placeholder retailer prices are intentionally stripped so the app
-- only publishes data we can stand behind.
update brands
set
  description = null;

delete from prices;

update products
set
  description = null,
  updated_at = now()
where slug not in (
  'zyn-black-cherry-mini-3mg',
  'zyn-black-cherry-mini-6mg',
  'zyn-apple-mint-mini-6mg',
  'zyn-guava-spice-11mg',
  'zyn-cool-mint-11mg',
  'velo-crispy-peppermint-6mg',
  'velo-crispy-peppermint-10mg',
  'velo-icy-berries-10mg',
  'velo-icy-berries-14mg',
  'velo-icy-berries-17mg',
  'velo-tropical-mango-6mg',
  'velo-tropical-mango-10mg',
  'velo-strawberry-ice-mini-6mg',
  'velo-strawberry-ice-10mg',
  'velo-orange-ice-10mg',
  'velo-mango-flame-10mg',
  'velo-mango-ice-10mg',
  'nordic-spirit-mint-mini-3mg',
  'nordic-spirit-mint-6mg',
  'nordic-spirit-mint-9mg',
  'nordic-spirit-mint-11mg',
  'nordic-spirit-spearmint-mini-3mg',
  'nordic-spirit-spearmint-6mg',
  'nordic-spirit-spearmint-9mg',
  'nordic-spirit-spearmint-11mg',
  'nordic-spirit-bergamot-wildberry-6mg',
  'nordic-spirit-bergamot-wildberry-11mg'
);

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

commit;
