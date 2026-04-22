"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Price } from "@/lib/types";
import { ExternalLink, Tag } from "lucide-react";

interface PriceComparisonProps {
  productId: string;
  pouchesPerCan: number | null;
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
    return <div className="h-72 animate-pulse rounded-xl border border-white/6 bg-white/[0.03]" />;
  }

  if (prices.length === 0) {
    return (
      <section className="rounded-xl border border-white/8 bg-card p-6 sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
            <Tag className="h-[1.125rem] w-[1.125rem]" />
          </div>
          <div>
            <div className="text-[0.66rem] uppercase tracking-[0.18em] text-white/36">Price Check</div>
            <h2 className="font-display text-2xl font-bold text-white">Price Comparison</h2>
          </div>
        </div>
        <div className="pb-empty px-5 py-6 text-sm text-white/56">
          No live shop prices are available for this product yet.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-white/8 bg-card p-6 sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
          <Tag className="h-[1.125rem] w-[1.125rem]" />
        </div>
        <div>
          <div className="text-[0.66rem] uppercase tracking-[0.18em] text-white/36">Price Check</div>
          <h2 className="font-display text-2xl font-bold text-white">Price Comparison</h2>
        </div>
      </div>

      <div className="space-y-3">
        {prices.map((price, index) => {
          const pouchCount = price.pouches_in_can || pouchesPerCan || 20;
          const pricePerPouch = price.price / pouchCount;
          const isCheapest = index === 0;

          return (
            <a
              key={price.id}
              href={price.affiliate_url || price.shops?.website_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`block rounded-xl border p-4 transition ${
                isCheapest
                  ? "border-accent/30 bg-accent/8"
                  : "border-white/8 bg-white/[0.03] hover:border-white/14"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-2xl font-bold text-white">{price.shops?.name}</span>
                    {isCheapest && (
                      <span className="rounded-md border border-accent/20 bg-accent/12 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-accent">
                        Best Price
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-white/56">
                    {price.currency} {pricePerPouch.toFixed(3)} per pouch
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="text-right">
                    <div className={`font-display text-4xl font-bold ${isCheapest ? "text-accent" : "text-white"}`}>
                      {price.currency} {price.price.toFixed(2)}
                    </div>
                    <div className="text-xs uppercase tracking-[0.16em] text-white/34">In stock</div>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white/48">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-6 text-white/42">
        Prices come from external shops and can change quickly. Some outbound links may be affiliate
        links, but retailer relationships never affect product rankings.
      </p>
    </section>
  );
}
