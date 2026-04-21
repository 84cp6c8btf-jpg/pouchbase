"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Price } from "@/lib/types";
import { ExternalLink, Tag } from "lucide-react";

interface PriceComparisonProps {
  productId: string;
  pouchesPerCan: number;
}

export function PriceComparison({ productId, pouchesPerCan }: PriceComparisonProps) {
  const [prices, setPrices] = useState<(Price & { shops: { name: string; slug: string; website_url: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      const { data } = await supabase
        .from("prices")
        .select("*, shops(name, slug, website_url)")
        .eq("product_id", productId)
        .eq("in_stock", true)
        .order("price", { ascending: true });
      setPrices((data as typeof prices) || []);
      setLoading(false);
    }
    fetchPrices();
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 mb-8 animate-pulse h-32" />
    );
  }

  if (prices.length === 0) {
    return null;
  }

  const cheapest = prices[0];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-accent" />
        Price Comparison
      </h2>

      <div className="space-y-3">
        {prices.map((price, index) => {
          const pricePerPouch = price.price / (price.pouches_in_can || pouchesPerCan);
          const isCheapest = index === 0;

          return (
            <a
              key={price.id}
              href={price.affiliate_url || price.shops?.website_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-colors ${
                isCheapest
                  ? "border-accent/50 bg-accent/5 hover:bg-accent/10"
                  : "border-border hover:bg-card-hover"
              }`}
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold flex flex-wrap items-center gap-2">
                    {price.shops?.name}
                    {isCheapest && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
                        Best Price
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    {price.currency} {pricePerPouch.toFixed(3)}/pouch
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <span className={`text-lg font-bold ${isCheapest ? "text-accent" : ""}`}>
                  {price.currency} {price.price.toFixed(2)}
                </span>
                <ExternalLink className="w-4 h-4 text-muted" />
              </div>
            </a>
          );
        })}
      </div>

      <p className="text-xs text-muted mt-4">
        Prices may vary. We earn a commission from qualifying purchases — this helps keep PouchBase free and independent.
      </p>
    </div>
  );
}
