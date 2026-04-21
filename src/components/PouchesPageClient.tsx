"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Product, FLAVOR_CATEGORIES } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Search, SlidersHorizontal, Flame, X } from "lucide-react";

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

  const hasActiveFilters = selectedBrand || selectedCategory || selectedBurnMin > 0 || search;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Pouches</h1>
        <p className="text-muted">
          Explore {products.length} nicotine pouches. Filter by brand, flavor, burn level, and more.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Search by name or flavor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors sm:w-auto ${
            showFilters || hasActiveFilters
              ? "border-accent text-accent bg-accent/10"
              : "border-border text-muted hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-zinc-800 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              >
                <option value="">All brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Flavor</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-zinc-800 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              >
                <option value="">All flavors</option>
                {FLAVOR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-accent" /> Min Burn
                </span>
              </label>
              <select
                value={selectedBurnMin}
                onChange={(e) => setSelectedBurnMin(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              >
                <option value={0}>Any</option>
                <option value={3}>3+ (Moderate)</option>
                <option value={5}>5+ (Spicy)</option>
                <option value={7}>7+ (Intense)</option>
                <option value={9}>9+ (Inferno)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-zinc-800 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              >
                <option value="overall">Highest Rated</option>
                <option value="burn">Highest Burn</option>
                <option value="strength">Strongest (mg)</option>
                <option value="reviews">Most Reviewed</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
              <X className="w-3 h-3" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 h-48 animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted text-lg">No pouches found matching your filters.</p>
          <button onClick={clearFilters} className="text-accent hover:text-accent-hover mt-2 text-sm">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
