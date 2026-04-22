import { Flame, MessageSquare, Zap } from "lucide-react";
import {
  MIN_PUBLIC_SCORE_REVIEWS,
  formatBurnRating,
  formatReviewCount,
  getBurnLabel,
  getReviewsNeededForPublicScore,
  getScoreState,
} from "@/lib/burn";
import { BurnMeter } from "@/components/BurnMeter";

interface ProductBurnSummaryProps {
  rating: number;
  reviewCount: number;
  strengthMg: number;
}

export function ProductBurnSummary({
  rating,
  reviewCount,
  strengthMg,
}: ProductBurnSummaryProps) {
  const state = getScoreState(reviewCount);
  const burnLabel = getBurnLabel(rating);
  const reviewsNeeded = getReviewsNeededForPublicScore(reviewCount);

  return (
    <section className="rounded-xl border border-white/8 bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-accent/85">
            <Flame className="h-3.5 w-3.5" />
            Burn Index
          </div>

          {state === "public" ? (
            <>
              <div className="flex flex-wrap items-end gap-3">
                <div className="font-display text-[clamp(3rem,7vw,5rem)] font-bold leading-none text-white">
                  {formatBurnRating(rating)}
                </div>
                <div className="pb-1 text-lg text-white/58">/10 · {burnLabel}</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/56">
                Burn measures felt lip sting and perceived harshness under the lip. It is based on
                structured community reviews and does not map one-to-one with nicotine strength.
              </p>
              <div className="mt-4 max-w-xl">
                <BurnMeter rating={rating} size="md" />
              </div>
            </>
          ) : state === "early" ? (
            <>
              <div className="font-display text-[clamp(2.2rem,5vw,3.2rem)] font-bold leading-none text-white">
                Building burn score
              </div>
              <p className="mt-3 text-sm leading-7 text-white/56">
                This pouch has {formatReviewCount(reviewCount)} so far. PouchBase publishes a formal
                burn score after {MIN_PUBLIC_SCORE_REVIEWS} structured reviews to avoid false precision.
              </p>
            </>
          ) : (
            <>
              <div className="font-display text-[clamp(2.2rem,5vw,3.2rem)] font-bold leading-none text-white">
                No public burn score yet
              </div>
              <p className="mt-3 text-sm leading-7 text-white/56">
                Burn becomes public once a pouch has enough structured review data to say something
                meaningful about felt intensity.
              </p>
            </>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-[24rem] lg:grid-cols-1">
          <div className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
            <div className="inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-white/40">
              <Zap className="h-3.5 w-3.5 text-accent" />
              Nicotine Strength
            </div>
            <div className="mt-2 font-display text-3xl font-bold text-white">{strengthMg}mg</div>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Useful context, but not a burn score. Higher mg can still feel smoother than a harsher recipe.
            </p>
          </div>

          <div className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
            <div className="inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-white/40">
              <MessageSquare className="h-3.5 w-3.5 text-accent" />
              Rating Confidence
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-white">
              {state === "public" ? "Structured score" : state === "early" ? "Early signal" : "Awaiting reviews"}
            </div>
            <p className="mt-2 text-sm leading-6 text-white/50">
              {state === "public"
                ? `${formatReviewCount(reviewCount)} are currently feeding the public burn score.`
                : state === "early"
                  ? `${reviewsNeeded} more ${reviewsNeeded === 1 ? "review" : "reviews"} needed before a public score appears.`
                  : `Needs ${MIN_PUBLIC_SCORE_REVIEWS} structured reviews before burn becomes public.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
