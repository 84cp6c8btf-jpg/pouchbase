"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product, FLAVOR_CATEGORIES, applyProductsDerivedDefaults } from "@/lib/types";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Flame, Search, SlidersHorizontal, X } from "lucide-react";
import { PageIntro } from "@/components/common/PageIntro";
import {
  MIN_PUBLIC_SCORE_REVIEWS,
  compareScoreStates,
  getScoreState,
} from "@/lib/catalog/burn";
import { PRODUCT_WITH_BRAND_SELECT } from "@/lib/catalog/selects";
import { compareProductsByReviewSignal } from "@/lib/catalog/intelligence";

type SortOption = "overall" | "burn" | "strength" | "reviews" | "newest" | "name";
type SignalFilter = "all" | "public" | "early" | "none";

export function PouchesPageClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBurnMin, setSelectedBurnMin] = useState(0);
  const [selectedSignal, setSelectedSignal] = useState<SignalFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("reviews");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchProducts() {
      setLoading(true);
      let query = supabase.from("products").select(PRODUCT_WITH_BRAND_SELECT).eq("is_active", true);

      if (selectedBrand) {
        query = query.eq("brand_id", selectedBrand);
      }
      if (selectedCategory) {
        query = query.eq("flavor_family", selectedCategory);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,flavor.ilike.%${search}%`);
      }

      const { data } = await query.order("created_at", { ascending: false }).limit(180);

      if (ignore) return;

      const normalizedProducts = applyProductsDerivedDefaults(data as typeof products);
      setProducts(
        normalizedProducts.filter((product) => {
          if (selectedBurnMin > 0 && product.avg_burn < selectedBurnMin) return false;
          if (selectedSignal === "public") return product.review_count >= MIN_PUBLIC_SCORE_REVIEWS;
          if (selectedSignal === "early") return product.review_count > 0 && product.review_count < MIN_PUBLIC_SCORE_REVIEWS;
          if (selectedSignal === "none") return product.review_count === 0;
          return true;
        })
      );
      setLoading(false);
    }

    void fetchProducts();

    return () => {
      ignore = true;
    };
  }, [search, selectedBrand, selectedBurnMin, selectedCategory, selectedSignal]);

  useEffect(() => {
    async function fetchBrands() {
      const { data } = await supabase.from("brands").select("id, name, slug").eq("is_active", true).order("name");
      setBrands(data || []);
    }
    fetchBrands();
  }, []);

  const clearFilters = () => {
    setSearch("");
    setSelectedBrand("");
    setSelectedCategory("");
    setSelectedBurnMin(0);
    setSelectedSignal("all");
    setSortBy("reviews");
  };

  const hasActiveFilters = Boolean(
    selectedBrand || selectedCategory || selectedBurnMin > 0 || search || selectedSignal !== "all"
  );
  const sortedProducts = [...products].sort((left, right) => {
    if (sortBy === "reviews") {
      return compareProductsByReviewSignal(left, right);
    }

    if (sortBy === "overall") {
      const leftState = getScoreState(left.review_count);
      const rightState = getScoreState(right.review_count);
      if (leftState !== rightState) {
        return compareScoreStates(leftState, rightState);
      }
      if (leftState === "public" && right.avg_overall !== left.avg_overall) {
        return right.avg_overall - left.avg_overall;
      }
      return compareProductsByReviewSignal(left, right);
    }

    if (sortBy === "burn") {
      const leftState = getScoreState(left.review_count);
      const rightState = getScoreState(right.review_count);
      if (leftState !== rightState) {
        return compareScoreStates(leftState, rightState);
      }
      if (leftState === "public" && right.avg_burn !== left.avg_burn) {
        return right.avg_burn - left.avg_burn;
      }
      return compareProductsByReviewSignal(left, right);
    }

    if (sortBy === "strength") {
      return right.strength_mg - left.strength_mg || left.name.localeCompare(right.name);
    }

    if (sortBy === "newest") {
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    }

    return left.name.localeCompare(right.name);
  });
  const publicCount = products.filter((product) => getScoreState(product.review_count) === "public").length;
  const earlyCount = products.filter((product) => getScoreState(product.review_count) === "early").length;

  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Directory"
        title="Find your next pouch."
        description="Search by name or flavor, filter by brand and signal state, and compare the catalog on product facts first while real community ratings build."
        meta={
          loading
            ? "Refreshing catalog..."
            : `${products.length} shown · ${publicCount} public score${publicCount === 1 ? "" : "s"} · ${earlyCount} early signal${earlyCount === 1 ? "" : "s"}`
        }
      />

      <section className="rounded-xl border border-white/8 bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block flex-1">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-white/42">Search</span>
            <Search className="absolute left-3 top-[calc(50%+10px)] h-4 w-4 -translate-y-1/2 text-white/34" />
            <input
              type="text"
              placeholder="Search by product or flavor"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pb-input py-2.5 pl-9 pr-3 text-sm"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:w-[22rem]">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-white/42">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="pb-select px-3 py-2.5 text-sm"
              >
                <option value="reviews">Most reviewed</option>
                <option value="overall">Highest rated (public only first)</option>
                <option value="burn">Highest burn (public only first)</option>
                <option value="strength">Strongest (mg)</option>
                <option value="newest">Newest</option>
                <option value="name">Name A-Z</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                onClick={() => setShowFilters((open) => !open)}
                className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition md:hidden ${
                  showFilters || hasActiveFilters
                    ? "border-accent/35 bg-accent/10 text-accent"
                    : "border-white/10 text-white/60"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        <div className={`${showFilters ? "grid" : "hidden"} mt-4 gap-3 md:grid md:grid-cols-4`}>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-white/42">Brand</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="pb-select px-3 py-2.5 text-sm"
            >
              <option value="">All brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-white/42">Flavor</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pb-select px-3 py-2.5 text-sm"
            >
              <option value="">All flavors</option>
              {FLAVOR_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-white/42">Signal</span>
            <select
              value={selectedSignal}
              onChange={(e) => setSelectedSignal(e.target.value as SignalFilter)}
              className="pb-select px-3 py-2.5 text-sm"
            >
              <option value="all">Any signal level</option>
              <option value="public">Public scores only</option>
              <option value="early">Early signals only</option>
              <option value="none">No ratings yet</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-white/42">
              <Flame className="h-3 w-3 text-accent" />
              Min burn
            </span>
            <select
              value={selectedBurnMin}
              onChange={(e) => setSelectedBurnMin(Number(e.target.value))}
              className="pb-select px-3 py-2.5 text-sm"
            >
              <option value={0}>Any</option>
              <option value={3}>3+ Warm</option>
              <option value={5}>5+ Sharp</option>
              <option value={7}>7+ Intense</option>
              <option value={9}>9+ Inferno</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-white/8 pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {selectedCategory && <span className="pb-tag-soft">{selectedCategory}</span>}
            {selectedBrand && <span className="pb-tag-soft">brand filtered</span>}
            {selectedSignal !== "all" && <span className="pb-tag-soft">{selectedSignal} signal</span>}
            {selectedBurnMin > 0 && <span className="pb-tag-soft">burn {selectedBurnMin}+</span>}
            {search && <span className="pb-tag-soft">&quot;{search}&quot;</span>}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-white/52 transition hover:text-white"
              >
                <X className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>

          <p className="text-xs leading-6 text-white/40">
            Burn and rating sorts prioritize public-score products first. Unrated products stay useful through flavor, format, strength, and live retailer context where available.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-xl border border-white/6 bg-white/[0.02]"
              />
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-card px-6 py-12 text-center">
            <h3 className="font-display text-2xl font-bold text-white">Nothing matches those filters.</h3>
            <p className="mt-2 text-sm text-white/48">
              Try removing a filter or broadening your search.
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-accent-hover"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
