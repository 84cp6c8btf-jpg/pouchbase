-- PouchBase review seed
-- This creates a few demo auth users, lets the existing auth trigger create
-- matching profiles, and then inserts one real review per seeded product.
--
-- Notes:
-- - These are demo reviewer accounts for seed data, not polished production users.
-- - Running this will update product aggregates via your review triggers, so
--   product scores and review counts become consistent with actual review rows.

create extension if not exists pgcrypto;

-- ============================================
-- DEMO REVIEWER ACCOUNTS
-- ============================================
with seed_users (email, full_name) as (
  values
    ('burnchaser@pouchbase.local', 'Burn Chaser'),
    ('mintledger@pouchbase.local', 'Mint Ledger'),
    ('switchersam@pouchbase.local', 'Switcher Sam')
)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  su.email,
  crypt('temporary-demo-only', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', su.full_name, 'name', su.full_name),
  now(),
  now(),
  '',
  '',
  '',
  ''
from seed_users su
where not exists (
  select 1
  from auth.users u
  where u.email = su.email
);

with seed_users (email, full_name) as (
  values
    ('burnchaser@pouchbase.local', 'Burn Chaser'),
    ('mintledger@pouchbase.local', 'Mint Ledger'),
    ('switchersam@pouchbase.local', 'Switcher Sam')
)
update profiles p
set display_name = su.full_name
from seed_users su
join auth.users u on u.email = su.email
where p.id = u.id;

-- ============================================
-- REVIEWS
-- ============================================
with seed_reviews (
  product_slug,
  reviewer_email,
  burn_rating,
  flavor_rating,
  longevity_rating,
  overall_rating,
  review_text
) as (
  values
    (
      'zyn-cool-mint-mini-3mg',
      'mintledger@pouchbase.local',
      3,
      8,
      6,
      7,
      'Very easy daily pouch. Clean mint, light hit, and almost no drama on the lip.'
    ),
    (
      'zyn-citrus-mini-6mg',
      'switchersam@pouchbase.local',
      4,
      8,
      7,
      7,
      'Pleasant citrus peel flavor with a little extra zing. Good stepping-stone strength.'
    ),
    (
      'velo-freeze-max-17mg',
      'burnchaser@pouchbase.local',
      9,
      7,
      8,
      8,
      'This one hits fast. Strong cooling effect, clear nicotine punch, and enough longevity to feel premium.'
    ),
    (
      'velo-lime-flame-10mg',
      'switchersam@pouchbase.local',
      6,
      8,
      7,
      8,
      'Lime comes through nicely and the burn stays lively without getting overwhelming.'
    ),
    (
      'loop-jalapeno-lime-strong',
      'burnchaser@pouchbase.local',
      7,
      9,
      8,
      9,
      'Weird on paper, excellent in practice. The chili note is real and the lime keeps it bright.'
    ),
    (
      'loop-mint-mania-hyper-strong',
      'mintledger@pouchbase.local',
      8,
      8,
      8,
      8,
      'Heavy mint profile with a wet-format release. Strong but still very usable if you like intense cooling.'
    ),
    (
      'pablo-ice-cold-30mg',
      'burnchaser@pouchbase.local',
      10,
      7,
      8,
      8,
      'Exactly what the name promises. Big slap of cold mint and a serious nicotine wallop.'
    ),
    (
      'pablo-red-24mg',
      'switchersam@pouchbase.local',
      9,
      7,
      8,
      8,
      'Candy-fruit flavor with a real kick. Not subtle, but definitely memorable.'
    ),
    (
      'siberia-extremely-strong-slim',
      'burnchaser@pouchbase.local',
      10,
      6,
      9,
      8,
      'This is still the benchmark for punishment. Dry pouch, huge burn, and no pretending otherwise.'
    ),
    (
      'white-fox-full-charge',
      'mintledger@pouchbase.local',
      7,
      8,
      8,
      8,
      'Very polished peppermint pouch. Feels cleaner and more premium than most strong mint options.'
    ),
    (
      'killa-cold-mint',
      'burnchaser@pouchbase.local',
      9,
      8,
      8,
      8,
      'Sharp mint and immediate lip sting. Lives up to the KILLA name without tasting cheap.'
    ),
    (
      'killa-blueberry',
      'switchersam@pouchbase.local',
      7,
      8,
      7,
      8,
      'Sweeter than the mint variants but still has enough bite to feel strong.'
    ),
    (
      'xqs-tropical-strong',
      'mintledger@pouchbase.local',
      5,
      8,
      7,
      8,
      'Smooth tropical profile and a manageable burn. Easy recommendation for flavor-first users.'
    ),
    (
      'ace-spearmint',
      'switchersam@pouchbase.local',
      6,
      8,
      7,
      8,
      'Fresh spearmint, steady strength, and no weird aftertaste. Very safe all-rounder.'
    )
)
insert into reviews (
  product_id,
  user_id,
  burn_rating,
  flavor_rating,
  longevity_rating,
  overall_rating,
  review_text
)
select
  p.id,
  u.id,
  sr.burn_rating,
  sr.flavor_rating,
  sr.longevity_rating,
  sr.overall_rating,
  sr.review_text
from seed_reviews sr
join products p on p.slug = sr.product_slug
join auth.users u on u.email = sr.reviewer_email
on conflict (product_id, user_id) do update
set
  burn_rating = excluded.burn_rating,
  flavor_rating = excluded.flavor_rating,
  longevity_rating = excluded.longevity_rating,
  overall_rating = excluded.overall_rating,
  review_text = excluded.review_text,
  created_at = now();
