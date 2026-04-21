"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Product, FLAVOR_CATEGORIES } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Flame, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

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

  const fetchProducts = useCallback(async () => {
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
    setProducts((data as typeof products) || []);
    setLoading(false);
  }, [selectedBrand, selectedCategory, selectedBurnMin, search, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    <div className="space-y-6">
      <section className="pb-editorial-panel px-5 py-6 sm:px-7 sm:py-7">
        <div className="relative z-10">
          <div className="pb-kicker mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Structured Catalog
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <h1 className="font-display text-[clamp(2.9rem,6vw,5.8rem)] font-bold leading-[0.92] text-white">
                Browse pouches with actual signal.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/62">
                Search by flavor, filter by burn, sort by review confidence, and scan the catalog
                like a database instead of a store shelf.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="pb-stat-tile">
                <div className="text-[0.66rem] uppercase tracking-[0.22em] text-white/36">Results</div>
                <div className="mt-1 font-display text-4xl font-bold text-accent">{products.length}</div>
              </div>
              <div className="pb-stat-tile">
                <div className="text-[0.66rem] uppercase tracking-[0.22em] text-white/36">Sort</div>
                <div className="mt-1 font-display text-2xl font-bold text-white">
                  {sortBy === "overall" ? "Best" : sortBy === "burn" ? "Burn" : sortBy === "strength" ? "MG" : sortBy === "reviews" ? "Reviewed" : "New"}
                </div>
              </div>
              <div className="pb-stat-tile">
                <div className="text-[0.66rem] uppercase tracking-[0.22em] text-white/36">Filters</div>
                <div className="mt-1 font-display text-4xl font-bold text-white">
                  {hasActiveFilters ? "On" : "Off"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <button
            onClick={() => setShowFilters((open) => !open)}
            className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition xl:hidden ${
              showFilters || hasActiveFilters
                ? "border-accent/35 bg-accent/10 text-accent"
                : "border-white/10 bg-white/[0.03] text-white/70"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters & sorting
          </button>

          <div className={`${showFilters ? "block" : "hidden"} xl:block`}>
            <div className="pb-data-panel p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[0.66rem] uppercase tracking-[0.22em] text-white/36">Controls</div>
                  <h2 className="mt-1 font-display text-2xl font-bold text-white">Filter set</h2>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-xs text-accent transition hover:text-accent-hover"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[0.66rem] uppercase tracking-[0.22em] text-white/38">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-white/34" />
                    <input
                      type="text"
                      placeholder="Name or flavor"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-accent/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[0.66rem] uppercase tracking-[0.22em] text-white/38">
                    Brand
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none transition focus:border-accent/40"
                  >
                    <option value="">All brands</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[0.66rem] uppercase tracking-[0.22em] text-white/38">
                    Flavor category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none transition focus:border-accent/40"
                  >
                    <option value="">All flavors</option>
                    {FLAVOR_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.22em] text-white/38">
                    <Flame className="h-3.5 w-3.5 text-accent" />
                    Burn threshold
                  </label>
                  <select
                    value={selectedBurnMin}
                    onChange={(e) => setSelectedBurnMin(Number(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none transition focus:border-accent/40"
                  >
                    <option value={0}>Any</option>
                    <option value={3}>3+ · Warm</option>
                    <option value={5}>5+ · Sharp</option>
                    <option value={7}>7+ · Intense</option>
                    <option value={9}>9+ · Inferno</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[0.66rem] uppercase tracking-[0.22em] text-white/38">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none transition focus:border-accent/40"
                  >
                    <option value="overall">Highest rated</option>
                    <option value="burn">Highest burn</option>
                    <option value="strength">Strongest (mg)</option>
                    <option value="reviews">Most reviewed</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-5">
          <div className="pb-data-panel px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[0.66rem] uppercase tracking-[0.22em] text-white/36">Results Layer</div>
                <h2 className="mt-1 font-display text-3xl font-bold text-white">
                  {loading ? "Loading catalog" : `${products.length} pouch${products.length === 1 ? "" : "es"} found`}
                </h2>
              </div>
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 text-xs text-white/58">
                  {selectedCategory && <span className="pb-chip-soft">{selectedCategory}</span>}
                  {selectedBrand && <span className="pb-chip-soft">brand selected</span>}
                  {selectedBurnMin > 0 && <span className="pb-chip-soft">burn {selectedBurnMin}+</span>}
                  {search && <span className="pb-chip-soft">search active</span>}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-[27rem] animate-pulse rounded-[1.7rem] border border-white/6 bg-white/[0.03]"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="pb-editorial-panel px-6 py-12 text-center">
              <div className="relative z-10 mx-auto max-w-xl">
                <div className="pb-kicker mb-5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Empty Result
                </div>
                <h3 className="font-display text-4xl font-bold text-white">No pouches match that mix.</h3>
                <p className="mt-4 text-sm leading-7 text-white/58">
                  Clear the current filters and start wider. Flavor + burn combinations can get very
                  specific fast.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-hover"
                >
                  Reset filters
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
