-- PouchBase Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- BRANDS
-- ============================================
create table brands (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  country text,
  description text,
  logo_url text,
  website_url text,
  created_at timestamptz default now()
);

-- ============================================
-- PRODUCTS (individual pouches/cans)
-- ============================================
create table products (
  id uuid default uuid_generate_v4() primary key,
  brand_id uuid references brands(id) on delete cascade not null,
  name text not null,
  slug text not null unique,
  flavor text not null,
  flavor_category text not null, -- mint, fruit, coffee, tobacco, other
  strength_mg numeric not null, -- nicotine mg per pouch
  strength_label text, -- light, normal, strong, extra strong, super strong
  format text default 'slim', -- slim, mini, regular, large
  pouches_per_can integer default 20,
  moisture text default 'normal', -- dry, normal, moist
  weight_per_pouch numeric, -- grams
  description text,
  image_url text,
  -- Aggregated ratings (updated by trigger)
  avg_burn numeric default 0,
  avg_flavor numeric default 0,
  avg_longevity numeric default 0,
  avg_overall numeric default 0,
  review_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  review_count integer default 0,
  created_at timestamptz default now()
);

-- ============================================
-- REVIEWS
-- ============================================
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  burn_rating integer not null check (burn_rating >= 1 and burn_rating <= 10),
  flavor_rating integer not null check (flavor_rating >= 1 and flavor_rating <= 10),
  longevity_rating integer not null check (longevity_rating >= 1 and longevity_rating <= 10),
  overall_rating integer not null check (overall_rating >= 1 and overall_rating <= 10),
  review_text text,
  helpful_count integer default 0,
  created_at timestamptz default now(),
  -- One review per user per product
  unique(product_id, user_id)
);

-- ============================================
-- SHOPS (for price comparison)
-- ============================================
create table shops (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  website_url text not null,
  affiliate_url_template text, -- e.g. https://shop.com?ref=pouchbase&product={product}
  logo_url text,
  shipping_info text,
  created_at timestamptz default now()
);

-- ============================================
-- PRICES (product prices at different shops)
-- ============================================
create table prices (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade not null,
  shop_id uuid references shops(id) on delete cascade not null,
  price numeric not null,
  pouches_in_can integer default 20,
  currency text default 'EUR',
  affiliate_url text,
  in_stock boolean default true,
  last_checked timestamptz default now(),
  created_at timestamptz default now(),
  unique(product_id, shop_id)
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_products_brand on products(brand_id);
create index idx_products_flavor_category on products(flavor_category);
create index idx_products_strength on products(strength_mg);
create index idx_products_avg_overall on products(avg_overall desc);
create index idx_products_avg_burn on products(avg_burn desc);
create index idx_products_slug on products(slug);
create index idx_reviews_product on reviews(product_id);
create index idx_reviews_user on reviews(user_id);
create index idx_prices_product on prices(product_id);
create index idx_brands_slug on brands(slug);

-- ============================================
-- FUNCTION: Update product ratings on new review
-- ============================================
create or replace function update_product_ratings()
returns trigger as $$
begin
  update products set
    avg_burn = (select coalesce(avg(burn_rating), 0) from reviews where product_id = coalesce(new.product_id, old.product_id)),
    avg_flavor = (select coalesce(avg(flavor_rating), 0) from reviews where product_id = coalesce(new.product_id, old.product_id)),
    avg_longevity = (select coalesce(avg(longevity_rating), 0) from reviews where product_id = coalesce(new.product_id, old.product_id)),
    avg_overall = (select coalesce(avg(overall_rating), 0) from reviews where product_id = coalesce(new.product_id, old.product_id)),
    review_count = (select count(*) from reviews where product_id = coalesce(new.product_id, old.product_id)),
    updated_at = now()
  where id = coalesce(new.product_id, old.product_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger on_review_change
  after insert or update or delete on reviews
  for each row execute function update_product_ratings();

-- ============================================
-- FUNCTION: Update profile review count
-- ============================================
create or replace function update_profile_review_count()
returns trigger as $$
begin
  update profiles set
    review_count = (select count(*) from reviews where user_id = coalesce(new.user_id, old.user_id))
  where id = coalesce(new.user_id, old.user_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger on_review_change_profile
  after insert or update or delete on reviews
  for each row execute function update_profile_review_count();

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Brands: anyone can read
alter table brands enable row level security;
create policy "Brands are viewable by everyone" on brands for select using (true);

-- Products: anyone can read
alter table products enable row level security;
create policy "Products are viewable by everyone" on products for select using (true);

-- Profiles: anyone can read, users can update their own
alter table profiles enable row level security;
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Reviews: anyone can read, authenticated users can create/update/delete their own
alter table reviews enable row level security;
create policy "Reviews are viewable by everyone" on reviews for select using (true);
create policy "Authenticated users can create reviews" on reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on reviews for delete using (auth.uid() = user_id);

-- Shops: anyone can read
alter table shops enable row level security;
create policy "Shops are viewable by everyone" on shops for select using (true);

-- Prices: anyone can read
alter table prices enable row level security;
create policy "Prices are viewable by everyone" on prices for select using (true);
