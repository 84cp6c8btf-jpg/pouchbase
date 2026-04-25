-- PouchBase core schema
-- Canonical catalog, market availability, shop prices, public profiles, and structured reviews only.

create extension if not exists "uuid-ossp";

drop table if exists poll_votes cascade;
drop table if exists poll_options cascade;
drop table if exists polls cascade;
drop table if exists prices cascade;
drop table if exists reviews cascade;
drop table if exists product_markets cascade;
drop table if exists products cascade;
drop table if exists shops cascade;
drop table if exists profiles cascade;
drop table if exists brands cascade;

drop function if exists public.set_updated_at() cascade;
drop function if exists public.handle_new_user_profile() cascade;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, null)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create table public.brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null check (length(btrim(name)) > 0),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  website_url text,
  logo_url text,
  country_origin text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  line text not null check (length(btrim(line)) > 0),
  flavor text not null check (length(btrim(flavor)) > 0),
  flavor_family text not null check (length(btrim(flavor_family)) > 0),
  nicotine_mg numeric(8, 2) not null check (nicotine_mg > 0),
  format text not null check (length(btrim(format)) > 0),
  pouch_count integer not null check (pouch_count > 0),
  moisture_level text not null check (length(btrim(moisture_level)) > 0),
  description text,
  image_url text,
  gtin text,
  source_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_markets (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  market_code text not null check (market_code = upper(market_code) and market_code ~ '^[A-Z]{2}(?:-[A-Z0-9]{2,})?$'),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, market_code)
);

create table public.shops (
  id uuid primary key default uuid_generate_v4(),
  name text not null check (length(btrim(name)) > 0),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  website_url text not null check (length(btrim(website_url)) > 0),
  market_code text not null check (market_code = upper(market_code) and market_code ~ '^[A-Z]{2}(?:-[A-Z0-9]{2,})?$'),
  affiliate_base_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prices (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_url text not null check (length(btrim(product_url)) > 0),
  currency text not null check (currency = upper(currency) and currency ~ '^[A-Z]{3}$'),
  price_per_can numeric(10, 2) not null check (price_per_can >= 0),
  price_per_pouch numeric(10, 4) not null check (price_per_pouch >= 0),
  in_stock boolean default true,
  checked_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  burn_rating integer not null check (burn_rating between 1 and 10),
  flavor_accuracy_rating integer not null check (flavor_accuracy_rating between 1 and 10),
  nicotine_feel_rating integer not null check (nicotine_feel_rating between 1 and 10),
  comfort_rating integer not null check (comfort_rating between 1 and 10),
  longevity_rating integer not null check (longevity_rating between 1 and 10),
  value_rating integer not null check (value_rating between 1 and 10),
  review_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index idx_brands_slug on public.brands(slug);
create index idx_products_slug on public.products(slug);
create index idx_products_brand_id on public.products(brand_id);
create index idx_product_markets_product_id on public.product_markets(product_id);
create index idx_product_markets_market_code on public.product_markets(market_code);
create index idx_shops_slug on public.shops(slug);
create index idx_shops_market_code on public.shops(market_code);
create index idx_prices_product_id on public.prices(product_id);
create index idx_prices_shop_id on public.prices(shop_id);
create index idx_prices_checked_at on public.prices(checked_at desc);
create index idx_prices_latest_lookup on public.prices(product_id, shop_id, checked_at desc);
create index idx_reviews_product_id on public.reviews(product_id);
create index idx_reviews_user_id on public.reviews(user_id);

create trigger set_brands_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger set_product_markets_updated_at
  before update on public.product_markets
  for each row execute function public.set_updated_at();

create trigger set_shops_updated_at
  before update on public.shops
  for each row execute function public.set_updated_at();

create trigger set_prices_updated_at
  before update on public.prices
  for each row execute function public.set_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_markets enable row level security;
alter table public.shops enable row level security;
alter table public.prices enable row level security;
alter table public.profiles enable row level security;
alter table public.reviews enable row level security;

create policy "Brands are publicly readable"
  on public.brands for select
  using (true);

create policy "Products are publicly readable"
  on public.products for select
  using (true);

create policy "Product markets are publicly readable"
  on public.product_markets for select
  using (true);

create policy "Shops are publicly readable"
  on public.shops for select
  using (true);

create policy "Prices are publicly readable"
  on public.prices for select
  using (true);

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users can create own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own profile"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);

create policy "Users can create own reviews"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.reviews for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);
