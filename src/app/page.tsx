import Link from "next/link";
import {
  ArrowRight,
  Flame,
  MessageSquare,
  Search,
  Star,
  Tag,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
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

const NAV_LINKS = [
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

  const burnLeader = highestBurn[0];
  const burnBrand = Array.isArray(burnLeader?.brands) ? burnLeader.brands[0] : burnLeader?.brands;

  return (
    <div className="space-y-16 pb-8">
      {/* Hero */}
      <section className="pt-8 sm:pt-14">
        <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.88] tracking-[-0.06em] text-white">
          Every pouch,<br />
          <span className="text-accent">rated honestly.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/50">
          PouchBase is a review site, not a shop. We track burn, flavor, longevity,
          and price across every mainstream nicotine pouch so you can compare them
          properly before you buy.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/pouches"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-black transition hover:bg-accent-hover"
          >
            <Search className="h-4 w-4" />
            Browse Pouches
          </Link>
          <Link
            href="/highest-burn"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20"
          >
            <Flame className="h-4 w-4 text-accent" />
            Highest Burn
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-10 flex gap-8 border-t border-white/8 pt-6">
          <div>
            <div className="font-display text-3xl font-bold text-white">{stats.products}</div>
            <div className="text-sm text-white/40">Pouches</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-white">{stats.reviews}</div>
            <div className="text-sm text-white/40">Reviews</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-white">{stats.brands}</div>
            <div className="text-sm text-white/40">Brands</div>
          </div>
        </div>
      </section>

      {/* Burn leader callout */}
      {burnLeader && (
        <section className="rounded-xl border border-white/8 bg-[#111114] p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-white/35 uppercase tracking-wider">Current Burn Leader</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-white">
                {burnLeader.name}
              </h2>
              <p className="mt-1 text-sm text-white/45">{burnBrand?.name} · {burnLeader.flavor} · {burnLeader.strength_mg}mg</p>
            </div>
            <div className="w-full sm:w-64">
              <BurnMeter rating={burnLeader.avg_burn} size="md" />
            </div>
          </div>
        </section>
      )}

      {/* Quick links */}
      <section className="grid gap-3 lg:grid-cols-3">
        {NAV_LINKS.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-4 rounded-xl border border-white/8 bg-[#111114] p-5 transition hover:border-white/16"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white group-hover:text-accent transition-colors">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-white/45">{description}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Top Rated */}
      {topProducts.length > 0 && (
        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Top Rated</h2>
              <p className="mt-2 text-white/45">
                The pouches people keep coming back to, sorted by overall score.
              </p>
            </div>
            <Link
              href="/top-rated"
              className="shrink-0 text-sm text-white/45 transition hover:text-accent inline-flex items-center gap-1"
            >
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {topProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Highest Burn */}
      {highestBurn.length > 0 && (
        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Highest Burn</h2>
              <p className="mt-2 text-white/45">
                Burn measures the actual lip sting — not just nicotine strength. These hit hardest.
              </p>
            </div>
            <Link
              href="/highest-burn"
              className="shrink-0 text-sm text-white/45 transition hover:text-accent inline-flex items-center gap-1"
            >
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {highestBurn.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* What is PouchBase */}
      <section className="border-t border-white/8 pt-12">
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Not another affiliate store.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/45">
          Most pouch sites exist to sell you something. We exist to help you compare.
          Filter by brand, flavor, burn, or strength — and read what real users actually think.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/8 bg-[#111114] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Search className="h-4 w-4 text-accent" />
              Find what fits
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/40">
              Filter by flavor, strength, burn level, or brand. Compare products side by side
              instead of scrolling through store pages.
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-[#111114] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <MessageSquare className="h-4 w-4 text-accent" />
              Real reviews
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/40">
              Every review scores burn, flavor, longevity, and overall. No vague testimonials —
              actual ratings you can compare across products.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
