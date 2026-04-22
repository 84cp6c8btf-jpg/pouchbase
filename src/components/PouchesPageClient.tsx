"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product, FLAVOR_CATEGORIES } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Flame, Search, SlidersHorizontal, X } from "lucide-react";
import { PageIntro } from "@/components/PageIntro";

type SortOption = "overall" | "burn" | "strength" | "reviews" | "newest";

export function PouchesPageClient() {
  const [products, setProducts] = useState<(Product & { brands: { name: string; slug: string } })[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBurnMin, setSelectedBurnMin] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("overall");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchProducts() {
      setLoading(true);
      let query = supabase.from("products").select("*, brands(name, slug)");

      if (selectedBrand) {
        query = query.eq("brand_id", selectedBrand);
      }
      if (selectedCategory) {
        query = query.eq("flavor_category", selectedCategory);
      }
      if (selectedBurnMin > 0) {
        query = query.gte("avg_burn", selectedBurnMin);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,flavor.ilike.%${search}%`);
      }

      switch (sortBy) {
        case "overall":
          query = query.order("avg_overall", { ascending: false });
          break;
        case "burn":
          query = query.order("avg_burn", { ascending: false });
          break;
        case "strength":
          query = query.order("strength_mg", { ascending: false });
          break;
        case "reviews":
          query = query.order("review_count", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
      }

      const { data } = await query.limit(50);

      if (ignore) return;

      setProducts((data as typeof products) || []);
      setLoading(false);
    }

    void fetchProducts();

    return () => {
      ignore = true;
    };
  }, [search, selectedBrand, selectedBurnMin, selectedCategory, sortBy]);

  useEffect(() => {
    async function fetchBrands() {
      const { data } = await supabase.from("brands").select("id, name, slug").order("name");
      setBrands(data || []);
    }
    fetchBrands();
  }, []);

  const clearFilters = () => {
    setSearch("");
    setSelectedBrand("");
    setSelectedCategory("");
    setSelectedBurnMin(0);
    setSortBy("overall");
  };

  const hasActiveFilters = Boolean(selectedBrand || selectedCategory || selectedBurnMin > 0 || search);

  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Directory"
        title="Find your next pouch."
        description="Search by name or flavor, filter by brand and felt burn, and sort the catalog around the signals that matter."
        meta={loading ? "Refreshing catalog..." : `${products.length} pouch${products.length === 1 ? "" : "es"} shown`}
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
                className="pb-input px-3 py-2.5 text-sm"
              >
                <option value="overall">Highest rated</option>
                <option value="burn">Highest burn</option>
                <option value="strength">Strongest (mg)</option>
                <option value="reviews">Most reviewed</option>
                <option value="newest">Newest</option>
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

        <div className={`${showFilters ? "grid" : "hidden"} mt-4 gap-3 md:grid md:grid-cols-3`}>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-white/42">Brand</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="pb-input px-3 py-2.5 text-sm"
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
              className="pb-input px-3 py-2.5 text-sm"
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
            <span className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-white/42">
              <Flame className="h-3 w-3 text-accent" />
              Min burn
            </span>
            <select
              value={selectedBurnMin}
              onChange={(e) => setSelectedBurnMin(Number(e.target.value))}
              className="pb-input px-3 py-2.5 text-sm"
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
            Browse by community data, not retailer placement. Burn and ranking signals come from product reviews.
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
        ) : products.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {products.map((product) => (
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
