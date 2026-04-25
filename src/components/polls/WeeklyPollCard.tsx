"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Flame, LockKeyhole, Swords } from "lucide-react";
import { usePathname } from "next/navigation";
import { ProductArtwork } from "@/components/catalog/ProductArtwork";
import {
  getPollCompareHref,
  getPollEyebrow,
  getPollOptionSubtitle,
  getPollOptionTitle,
  type WeeklyPoll,
} from "@/lib/polls";
import { getBrand } from "@/lib/catalog/discovery";

interface WeeklyPollCardProps {
  poll: WeeklyPoll;
}

export function WeeklyPollCard({ poll }: WeeklyPollCardProps) {
  const pathname = usePathname();
  const compareHref = useMemo(() => getPollCompareHref(poll), [poll]);
  const loginHref = useMemo(() => {
    const next = pathname && pathname !== "/login" ? pathname : "/";
    return `/login?next=${encodeURIComponent(next)}`;
  }, [pathname]);
  return (
    <section className="overflow-hidden rounded-xl border border-white/8 bg-card">
      <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(255,122,26,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-[0.68rem] uppercase tracking-[0.18em] text-accent/85">
              {getPollEyebrow(poll)}
            </div>
            <h2 className="mt-2 max-w-2xl font-display text-2xl font-bold text-white sm:text-3xl">
              {poll.question}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
              One active editorial poll at a time. Results stay hidden until you vote, then the split reveals instantly.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/48">
            <Flame className="h-3.5 w-3.5 text-accent" />
            Burn-first signal
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
        {poll.options.map((option) => {
          const brand = option.product ? getBrand(option.product) : null;

          return (
            <button
              key={option.id}
              type="button"
              disabled
              className="group relative overflow-hidden rounded-xl border border-white/8 bg-white/[0.02] text-left"
            >
              <div className="relative flex h-full flex-col gap-4 p-4">
                {option.product ? (
                  <ProductArtwork
                    brand={brand?.name}
                    brandSlug={brand?.slug}
                    name={option.product.name}
                    flavor={option.product.flavor}
                    flavorCategory={option.product.flavor_category}
                    strengthMg={option.product.strength_mg}
                    format={option.product.format}
                    imageUrl={option.product.image_url}
                  />
                ) : (
                  <div className="rounded-lg border border-white/8 bg-black/20 px-4 py-6 text-center text-sm text-white/54">
                    Editorial option
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-xl font-bold text-white">
                        {getPollOptionTitle(option)}
                      </div>
                      {getPollOptionSubtitle(option) && (
                        <div className="mt-1 text-sm text-white/48">{getPollOptionSubtitle(option)}</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 text-xs uppercase tracking-[0.16em] text-white/42">
                    Poll voting is disabled in the core schema
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/8 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-3 text-white/44">
          <span className="inline-flex items-center gap-2">
            <LockKeyhole className="h-3.5 w-3.5" />
            Polls are outside the core database foundation
          </span>
          <Link href={loginHref} className="text-accent transition hover:text-accent-hover">
            Sign in for reviews
          </Link>
        </div>

        {compareHref && (
          <Link
            href={compareHref}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white/72 transition hover:border-white/18 hover:text-white"
          >
            <Swords className="h-4 w-4 text-accent" />
            {poll.ctaLabel || "Compare these two"}
          </Link>
        )}
      </div>

    </section>
  );
}
