import Link from "next/link";
import { Flame, Search, Star, Zap, ArrowRight, MessageSquare, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 60; // revalidate every minute

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

export default async function Home() {
  const [topProducts, highestBurn, stats] = await Promise.all([
    getTopProducts(),
    getHighestBurn(),
    getStats(),
  ]);

  return (
    <div className="space-y-14 sm:space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/60 px-6 py-12 sm:px-10 sm:py-16">
        <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_60%)]" />
        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-accent mb-6">
            <Flame className="w-3.5 h-3.5" />
            Independent Pouch Database
          </div>
          <div className="flex items-center justify-center gap-3 mb-6">
            <Flame className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Rate. Review. <span className="text-accent">Compare.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            The independent encyclopedia for nicotine pouches. Real reviews from real users.
            The only burn rating system on the internet. Find the perfect pouch at the best price.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/pouches"
              className="bg-accent hover:bg-accent-hover text-black font-semibold px-8 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Browse Pouches
            </Link>
            <Link
              href="/highest-burn"
              className="border border-accent text-accent hover:bg-accent/10 font-semibold px-8 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Flame className="w-5 h-5" />
              Highest Burn
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="rounded-full border border-border bg-zinc-900/70 px-3 py-1.5 text-muted">
              Community burn ratings
            </span>
            <span className="rounded-full border border-border bg-zinc-900/70 px-3 py-1.5 text-muted">
              Independent price comparison
            </span>
            <span className="rounded-full border border-border bg-zinc-900/70 px-3 py-1.5 text-muted">
              Brand and flavor discovery
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-accent">{stats.products}</p>
          <p className="text-sm text-muted mt-1">Pouches tracked</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-accent">{stats.reviews}</p>
          <p className="text-sm text-muted mt-1">Reviews published</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-accent">{stats.brands}</p>
          <p className="text-sm text-muted mt-1">Brands covered</p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/top-rated"
          className="bg-card border border-border rounded-2xl p-5 hover:border-accent/50 hover:bg-card-hover transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <Star className="w-6 h-6 text-accent" />
            <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
          </div>
          <h2 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">Find the best-rated picks</h2>
          <p className="text-sm text-muted">
            Start with the community favorites ranked by overall score and review confidence.
          </p>
        </Link>
        <Link
          href="/highest-burn"
          className="bg-card border border-border rounded-2xl p-5 hover:border-accent/50 hover:bg-card-hover transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <Flame className="w-6 h-6 text-accent" />
            <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
          </div>
          <h2 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">Chase the burn</h2>
          <p className="text-sm text-muted">
            Explore the most intense pouches for lip sting, nicotine punch, and full inferno energy.
          </p>
        </Link>
        <Link
          href="/brands"
          className="bg-card border border-border rounded-2xl p-5 hover:border-accent/50 hover:bg-card-hover transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <Tag className="w-6 h-6 text-accent" />
            <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
          </div>
          <h2 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">Browse by brand</h2>
          <p className="text-sm text-muted">
            Compare the brands behind the pouches, then drill down into each catalog from one hub.
          </p>
        </Link>
      </section>

      {/* Top Rated */}
      {topProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6 text-accent" />
              Top Rated
            </h2>
            <Link
              href="/top-rated"
              className="text-accent hover:text-accent-hover transition-colors text-sm flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Highest Burn */}
      {highestBurn.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Flame className="w-6 h-6 text-red-500" />
              Highest Burn
            </h2>
            <Link
              href="/highest-burn"
              className="text-accent hover:text-accent-hover transition-colors text-sm flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highestBurn.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Why PouchBase */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-accent mb-3">Why It Works</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Built to be useful before it gets huge</h2>
          <p className="text-muted leading-relaxed">
            PouchBase is designed to make comparison easy: discover brands, sort by rating or burn,
            and check live-ish price coverage without digging through shop-owned “best pouch” lists.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <Search className="w-5 h-5 text-accent mb-3" />
            <h3 className="font-semibold mb-1">Discovery first</h3>
            <p className="text-sm text-muted">Find products fast by brand, flavor, strength, and burn level.</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <MessageSquare className="w-5 h-5 text-accent mb-3" />
            <h3 className="font-semibold mb-1">Review-driven</h3>
            <p className="text-sm text-muted">Community ratings make the database feel alive and trustworthy.</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <Zap className="w-5 h-5 text-accent mb-3" />
            <h3 className="font-semibold mb-1">Burn as a metric</h3>
            <p className="text-sm text-muted">The signature score gives the site its own angle from day one.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-card border border-border rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-3">Tried a pouch? Rate it.</h2>
        <p className="text-muted mb-6">
          Help the community find the best pouches. Leave a review with your burn, flavor, and longevity ratings.
        </p>
        <Link
          href="/login"
          className="bg-accent hover:bg-accent-hover text-black font-semibold px-8 py-3 rounded-xl transition-colors inline-block"
        >
          Sign Up & Start Rating
        </Link>
      </section>
    </div>
  );
}
