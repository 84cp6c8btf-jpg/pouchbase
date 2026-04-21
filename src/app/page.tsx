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
    description: "Start with the community favorites that already feel proven.",
    icon: Star,
  },
  {
    href: "/highest-burn",
    title: "Burn Index",
    description: "Track the pouches that actually bite back on the lip.",
    icon: Flame,
  },
  {
    href: "/brands",
    title: "Brand Atlas",
    description: "Map the catalogs behind the category instead of shopping blind.",
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
              Flavor-led discovery.
              <span className="mt-2 block text-accent">Authority-first structure.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/66 sm:text-xl">
              PouchBase is built like a review index, not a merch shop: structured ratings, a
              signature burn metric, real user signal, and side-by-side price context for adults
              comparing nicotine pouches seriously.
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
              <span className="pb-chip-soft">Structured community scores</span>
              <span className="pb-chip-soft">Flavor-first browsing</span>
              <span className="pb-chip-soft">Independent price comparison</span>
            </div>
          </div>

          <div className="grid gap-4">
            {featuredProduct && (
              <div className="pb-data-panel p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[0.68rem] uppercase tracking-[0.24em] text-white/42">
                      Featured Catalog Entry
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
                        Burn signal starts once reviews come in.
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
          <div className="mb-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/38">Catalog</div>
          <div className="font-display text-5xl font-bold text-accent">{stats.products}</div>
          <p className="mt-2 text-sm text-white/55">Pouches tracked across mainstream and cult brands.</p>
        </div>
        <div className="pb-stat-tile">
          <div className="mb-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/38">Signal</div>
          <div className="font-display text-5xl font-bold text-accent">{stats.reviews}</div>
          <p className="mt-2 text-sm text-white/55">Published review entries shaping flavor and burn rankings.</p>
        </div>
        <div className="pb-stat-tile">
          <div className="mb-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/38">Coverage</div>
          <div className="font-display text-5xl font-bold text-accent">{stats.brands}</div>
          <p className="mt-2 text-sm text-white/55">Brands covered with structured, comparable product data.</p>
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
                Editorial Picks
              </div>
              <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">Top Rated right now</h2>
              <p className="mt-3 max-w-2xl text-white/60">
                High-confidence favorites with structured scoring, readable cards, and enough signal
                to compare them properly.
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
                Signature Metric
              </div>
              <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">Burn worth tracking</h2>
              <p className="mt-3 max-w-2xl text-white/60">
                The burn rating is our differentiator: not just nicotine strength, but the felt lip
                sting users actually talk about.
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
                  Read it fast
                </div>
                <h3 className="font-display text-4xl font-bold leading-[0.95] text-white">
                  Stronger than strength alone.
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/58">
                  Burn captures the feeling users chase or avoid. It gives the catalog a more
                  culturally honest language than milligrams by themselves.
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
            Structured enough to trust.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/60">
            Browse by brand, flavor, burn signal, or review confidence without falling into the
            usual affiliate-store clutter. It is product discovery with an encyclopedia mindset.
          </p>
        </div>
        <div className="grid gap-3">
          <div className="pb-data-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <Search className="h-4 w-4 text-accent" />
              Discovery layer
            </div>
            <p className="text-sm leading-7 text-white/56">
              Filters, flavor worlds, and ranking pages make the catalog easy to scan quickly.
            </p>
          </div>
          <div className="pb-data-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <MessageSquare className="h-4 w-4 text-accent" />
              Review layer
            </div>
            <p className="text-sm leading-7 text-white/56">
              Community posts feed structured product scores instead of loose testimonial clutter.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
