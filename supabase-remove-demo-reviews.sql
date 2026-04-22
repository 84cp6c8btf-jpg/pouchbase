-- PouchBase demo-review cleanup
-- Run this once in the Supabase SQL Editor before launch.
--
-- What it does:
-- 1. Deletes every review created by PouchBase demo reviewer accounts
-- 2. Recomputes product aggregates from the remaining real reviews only
-- 3. Recomputes profile review counts
-- 4. Removes the demo auth users and profiles used only for seed reviews

begin;

with demo_emails (email) as (
  values
    ('burnchaser@pouchbase.local'),
    ('mintledger@pouchbase.local'),
    ('switchersam@pouchbase.local'),
    ('pouchwizard@pouchbase.local'),
    ('frostbitelou@pouchbase.local'),
    ('snusviking@pouchbase.local'),
    ('nicnerd@pouchbase.local'),
    ('flavorhunter@pouchbase.local'),
    ('tincanreview@pouchbase.local'),
    ('dailypoucher@pouchbase.local')
),
demo_users as (
  select u.id
  from auth.users u
  join demo_emails de on de.email = u.email
)
delete from reviews
where user_id in (select id from demo_users);

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

with profile_rollup as (
  select
    user_id,
    count(*)::integer as review_count
  from reviews
  group by user_id
)
update profiles p
set review_count = coalesce(pr.review_count, 0)
from profile_rollup pr
where p.id = pr.user_id;

update profiles p
set review_count = 0
where not exists (
  select 1
  from reviews r
  where r.user_id = p.id
);

delete from auth.users
where email in (
  'burnchaser@pouchbase.local',
  'mintledger@pouchbase.local',
  'switchersam@pouchbase.local',
  'pouchwizard@pouchbase.local',
  'frostbitelou@pouchbase.local',
  'snusviking@pouchbase.local',
  'nicnerd@pouchbase.local',
  'flavorhunter@pouchbase.local',
  'tincanreview@pouchbase.local',
  'dailypoucher@pouchbase.local'
);

commit;
