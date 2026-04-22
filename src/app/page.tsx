import Link from "next/link";
import {
  ArrowRight,
  Flame,
  Layers,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import { ProductArtwork } from "@/components/ProductArtwork";
import { BurnMeter } from "@/components/BurnMeter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 60;

async function getTopProducts() {
  const { data } = await supabase
    .from("products")
    .select("*, brands(name, slug)")
    .order("avg_overall", { ascending: false })
    .limit(6);
  return data || [];
}

async function getHighestBurn() {
  const { data } = await supabase
    .from("products")
    .select("*, brands(name, slug)")
    .gt("review_count", 0)
    .order("avg_burn", { ascending: false })
    .limit(3);
  return data || [];
}

async function getStats() {
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  const { count: reviewCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true });
  const { count: brandCount } = await supabase
    .from("brands")
    .select("*", { count: "exact", head: true });

  return {
    products: productCount || 0,
    reviews: reviewCount || 0,
    brands: brandCount || 0,
  };
}

const EDITORIAL_LINKS = [
  {
    href: "/top-rated",
    title: "Top Rated",
    description: "The highest-scored pouches across all brands, ranked by real user reviews.",
    icon: Star,
  },
  {
    href: "/highest-burn",
    title: "Highest Burn",
    description: "The pouches that hit hardest. Ranked by lip sting, not just milligrams.",
    icon: Flame,
  },
  {
    href: "/brands",
    title: "All Brands",
    description: "Browse every brand we cover — from mainstream giants to cult favorites.",
    icon: Tag,
  },
];

export default async function Home() {
  const [topProducts, highestBurn, stats] = await Promise.all([
    getTopProducts(),
    getHighestBurn(),
    getStats(),
  ]);

  const featuredProduct = topProducts[0];
  const featuredBrand = Array.isArray(featuredProduct?.brands)
    ? featuredProduct.brands[0]
    : featuredProduct?.brands;
  const burnLeader = highestBurn[0];
  const burnBrand = Array.isArray(burnLeader?.brands) ? burnLeader.brands[0] : burnLeader?.brands;

  return (
    <div className="space-y-14 pb-6 sm:space-y-18">
      <section className="pb-editorial-panel px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="pb-grid-backdrop absolute inset-0 opacity-80" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="max-w-3xl">
            <div className="pb-kicker mb-6">
              <Flame className="h-3.5 w-3.5" />
              Independent Pouch Encyclopedia
            </div>
            <h1 className="font-display text-[clamp(3.5rem,8vw,7.5rem)] font-bold leading-[0.9] tracking-[-0.07em] text-white">
              Every pouch,
              <span className="mt-2 block text-accent">rated honestly.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/66 sm:text-xl">
              PouchBase is a review site, not a shop. We track burn, flavor, longevity,
              and price across every mainstream nicotine pouch so you can compare them
              properly before you buy.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pouches"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-accent-hover"
              >
                <Search className="h-[1.125rem] w-[1.125rem]" />
                Browse Pouches
              </Link>
              <Link
                href="/highest-burn"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white transition hover:border-accent/35 hover:bg-accent/8"
              >
                <Flame className="h-[1.125rem] w-[1.125rem] text-accent" />
                Explore Burn Index
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <span className="pb-chip-soft">Community ratings</span>
              <span className="pb-chip-soft">Burn scores</span>
              <span className="pb-chip-soft">Price comparison</span>
            </div>
          </div>

          <div className="grid gap-4">
            {featuredProduct && (
              <div className="pb-data-panel p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[0.68rem] uppercase tracking-[0.24em] text-white/42">
                      Top Rated
                    </div>
                    <h2 className="mt-1 font-display text-2xl font-bold text-white">
                      {featuredProduct.name}
                    </h2>
                  </div>
                  <Link
                    href={`/pouches/${featuredProduct.slug}`}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/72 transition hover:border-accent/30 hover:text-white"
                  >
                    Open
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                  <ProductArtwork
                    brand={featuredBrand?.name}
                    brandSlug={featuredBrand?.slug}
                    name={featuredProduct.name}
                    flavor={featuredProduct.flavor}
                    flavorCategory={featuredProduct.flavor_category}
                    strengthMg={featuredProduct.strength_mg}
                    format={featuredProduct.format}
                    imageUrl={featuredProduct.image_url}
                    size="hero"
                  />
                  <div className="flex flex-col justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="pb-chip">{featuredBrand?.name}</span>
                      <span className="pb-chip">{featuredProduct.flavor}</span>
                      <span className="pb-chip">{featuredProduct.strength_mg}mg</span>
                    </div>
                    {featuredProduct.review_count > 0 ? (
                      <BurnMeter rating={featuredProduct.avg_burn} size="md" />
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-white/56">
                        No burn score yet — needs reviews.
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="pb-stat-tile">
                        <div className="text-[0.66rem] uppercase tracking-[0.22em] text-white/40">
                          Overall
                        </div>
                        <div className="mt-1 font-display text-3xl font-bold text-emerald-200">
                          {(featuredProduct.avg_overall || 0).toFixed(1)}
                        </div>
                      </div>
                      <div className="pb-stat-tile">
                        <div className="text-[0.66rem] uppercase tracking-[0.22em] text-white/40">
                          Reviews
                        </div>
                        <div className="mt-1 font-display text-3xl font-bold text-white">
                          {featuredProduct.review_count}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {burnLeader && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="pb-data-card p-4">
                  <div className="mb-2 text-[0.66rem] uppercase tracking-[0.22em] text-white/40">
                    Current Burn Leader
                  </div>
                  <p className="font-display text-[1.65rem] font-bold leading-[1.02]">
                    {burnLeader.name}
                  </p>
                  <p className="mt-2 text-sm text-white/58">
                    {burnBrand?.name} · {burnLeader.flavor}
                  </p>
                </div>
                <BurnMeter rating={burnLeader.avg_burn} size="md" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="pb-stat-tile">
          <div className="mb-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/38">Pouches</div>
          <div className="font-display text-5xl font-bold text-accent">{stats.products}</div>
          <p className="mt-2 text-sm text-white/55">Products tracked across mainstream and niche brands.</p>
        </div>
        <div className="pb-stat-tile">
          <div className="mb-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/38">Reviews</div>
          <div className="font-display text-5xl font-bold text-accent">{stats.reviews}</div>
          <p className="mt-2 text-sm text-white/55">Community reviews with burn, flavor, and longevity scores.</p>
        </div>
        <div className="pb-stat-tile">
          <div className="mb-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/38">Brands</div>
          <div className="font-display text-5xl font-bold text-accent">{stats.brands}</div>
          <p className="mt-2 text-sm text-white/55">From ZYN and VELO to Pablo, Siberia, and beyond.</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {EDITORIAL_LINKS.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="pb-data-card group p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/35"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-white/30 transition group-hover:text-accent" />
            </div>
            <h2 className="font-display text-3xl font-bold text-white">{title}</h2>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/58">{description}</p>
          </Link>
        ))}
      </section>

      {topProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="pb-kicker mb-4">
                <Star className="h-3.5 w-3.5" />
                Community Favorites
              </div>
              <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">Top Rated right now</h2>
              <p className="mt-3 max-w-2xl text-white/60">
                The pouches people keep coming back to, sorted by overall score.
              </p>
            </div>
            <Link
              href="/top-rated"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/64 transition hover:text-accent"
            >
              View ranking <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {topProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {highestBurn.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="pb-kicker mb-4">
                <Flame className="h-3.5 w-3.5" />
                Burn Leaders
              </div>
              <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">Highest burn right now</h2>
              <p className="mt-3 max-w-2xl text-white/60">
                Burn measures the actual lip sting — not just nicotine strength. These are the ones
                that hit hardest.
              </p>
            </div>
            <Link
              href="/highest-burn"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/64 transition hover:text-accent"
            >
              Open burn index <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="pb-editorial-panel px-6 py-7">
              <div className="relative">
                <div className="pb-kicker mb-5">
                  <Sparkles className="h-3.5 w-3.5" />
                  What is burn?
                </div>
                <h3 className="font-display text-4xl font-bold leading-[0.95] text-white">
                  More than just milligrams.
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/58">
                  Two pouches with the same nicotine can feel completely different under your lip.
                  Burn captures that — the sting, the heat, the intensity people actually care about.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {highestBurn.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-data-panel grid gap-6 px-6 py-7 sm:px-7 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div>
          <div className="pb-kicker mb-4">
            <Layers className="h-3.5 w-3.5" />
            Why PouchBase
          </div>
          <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">
            Not another affiliate store.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/60">
            Most pouch sites exist to sell you something. We exist to help you compare.
            Filter by brand, flavor, burn, or strength — and read what real users actually think.
          </p>
        </div>
        <div className="grid gap-3">
          <div className="pb-data-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <Search className="h-4 w-4 text-accent" />
              Find what fits
            </div>
            <p className="text-sm leading-7 text-white/56">
              Filter by flavor, strength, burn level, or brand. Compare products side by side
              instead of scrolling through store pages.
            </p>
          </div>
          <div className="pb-data-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <MessageSquare className="h-4 w-4 text-accent" />
              Real reviews
            </div>
            <p className="text-sm leading-7 text-white/56">
              Every review scores burn, flavor, longevity, and overall. No vague testimonials —
              actual ratings you can compare across products.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
