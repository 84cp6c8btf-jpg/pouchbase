import Link from "next/link";
import { Flame, Search, TrendingUp, Star, Zap, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";

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
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center pt-8 pb-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Flame className="w-12 h-12 text-accent" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Rate. Review. <span className="text-accent">Compare.</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
          The independent encyclopedia for nicotine pouches. Real reviews from real users.
          The only burn rating system on the internet. Find the perfect pouch at the best price.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
        <div className="text-center">
          <p className="text-3xl font-bold text-accent">{stats.products}</p>
          <p className="text-sm text-muted">Pouches</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-accent">{stats.reviews}</p>
          <p className="text-sm text-muted">Reviews</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-accent">{stats.brands}</p>
          <p className="text-sm text-muted">Brands</p>
        </div>
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
