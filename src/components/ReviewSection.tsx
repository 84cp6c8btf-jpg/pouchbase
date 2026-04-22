"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Review } from "@/lib/types";
import { BurnMeter } from "./BurnMeter";
import { RatingBadge } from "./RatingBadge";
import { MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MIN_PUBLIC_SCORE_REVIEWS,
  getBurnLabel,
} from "@/lib/burn";

interface ReviewSectionProps {
  productId: string;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<(Review & { profiles: { display_name: string | null } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [burn, setBurn] = useState(5);
  const [flavor, setFlavor] = useState(5);
  const [longevity, setLongevity] = useState(5);
  const [overall, setOverall] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const loginHref = `/login?next=${encodeURIComponent(pathname || `/pouches/${productId}`)}`;
  const existingReview = user ? reviews.find((review) => review.user_id === user.id) || null : null;

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*, profiles(display_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews((data as typeof reviews) || []);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ? { id: user.id } : null);
      await fetchReviews();
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id } : null);
    });

    return () => subscription.unsubscribe();
  }, [fetchReviews]);

  function prepareForm() {
    if (existingReview) {
      setBurn(existingReview.burn_rating);
      setFlavor(existingReview.flavor_rating);
      setLongevity(existingReview.longevity_rating);
      setOverall(existingReview.overall_rating);
      setText(existingReview.review_text || "");
      return;
    }

    setBurn(5);
    setFlavor(5);
    setLongevity(5);
    setOverall(5);
    setText("");
  }

  function toggleForm() {
    if (showForm) {
      setShowForm(false);
      return;
    }

    prepareForm();
    setShowForm(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const { error } = await supabase.from("reviews").upsert(
      {
        product_id: productId,
        user_id: user.id,
        burn_rating: burn,
        flavor_rating: flavor,
        longevity_rating: longevity,
        overall_rating: overall,
        review_text: text || null,
      },
      {
        onConflict: "product_id,user_id",
      }
    );

    if (!error) {
      await fetchReviews();
      router.refresh();
      setShowForm(false);
      setStatusMessage(existingReview ? "Your review was updated." : "Your review was published.");
    } else {
      setErrorMessage(error.message);
    }

    setSubmitting(false);
  };

  return (
    <section className="rounded-xl border border-white/8 bg-card p-6 sm:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 text-[0.66rem] uppercase tracking-[0.18em] text-white/36">Community</div>
          <h2 className="font-display text-3xl font-bold text-white">Structured reviews ({reviews.length})</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
            Public product scores appear after {MIN_PUBLIC_SCORE_REVIEWS} structured reviews, so early feedback
            can build without pretending to be settled consensus.
          </p>
        </div>
        {user ? (
          <button
            onClick={toggleForm}
            className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-hover"
          >
            {existingReview ? "Edit Your Review" : "Write a Review"}
          </button>
        ) : (
          <Link
            href={loginHref}
            className="rounded-lg bg-accent px-5 py-3 text-center text-sm font-semibold text-black transition hover:bg-accent-hover"
          >
            Sign In to Review
          </Link>
        )}
      </div>

      {existingReview && !showForm && (
        <p className="mb-4 text-sm text-white/54">
          You already reviewed this pouch. Update it anytime if your opinion changes.
        </p>
      )}
      {statusMessage && <p className="mb-4 text-sm text-emerald-300">{statusMessage}</p>}
      {errorMessage && <p className="mb-4 text-sm text-red-300">{errorMessage}</p>}

      {showForm && user && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
          <div className="mb-4 grid gap-3 rounded-lg border border-white/8 bg-black/15 p-4 sm:grid-cols-2">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-white/40">Structured rating</div>
              <p className="mt-2 text-sm leading-6 text-white/52">
                Burn, flavor, longevity, and overall are the fields that power public scores and rankings.
              </p>
            </div>
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-white/40">Optional notes</div>
              <p className="mt-2 text-sm leading-6 text-white/52">
                Add free text if you want context, but the form works even if you just leave structured ratings.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Burn",
                value: burn,
                setter: setBurn,
                helper: `${getBurnLabel(burn)} · felt lip sting and harshness under the lip`,
              },
              {
                label: "Flavor",
                value: flavor,
                setter: setFlavor,
                helper: "How accurate, satisfying, and usable the flavor feels",
              },
              {
                label: "Longevity",
                value: longevity,
                setter: setLongevity,
                helper: "How long the pouch stays good before dropping off",
              },
              {
                label: "Overall",
                value: overall,
                setter: setOverall,
                helper: "Your combined take after use, independent of brand reputation",
              },
            ].map((field) => (
              <label key={field.label} className="rounded-lg border border-white/8 bg-black/15 p-3.5">
                <span className="block text-[0.66rem] uppercase tracking-[0.18em] text-white/38">
                  {field.label}
                </span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={field.value}
                  onChange={(event) => field.setter(Number(event.target.value))}
                  className="mt-3 w-full accent-orange-500"
                />
                <span className="mt-2 block font-display text-3xl font-bold text-white">{field.value}</span>
                <span className="mt-1 block text-sm leading-6 text-white/48">{field.helper}</span>
              </label>
            ))}
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/40">
              Notes (optional)
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Anything worth adding beyond the structured scores? Flavor edge, throat feel, staying power, buy-again verdict..."
              className="pb-input h-28 resize-none px-4 py-3 text-sm"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-hover disabled:opacity-60"
            >
              {submitting ? "Saving..." : existingReview ? "Update Review" : "Publish Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-white/10 px-5 py-3 text-sm text-white/66 transition hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-[1.5rem] border border-white/6 bg-white/[0.03]" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/20 text-white/54">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {review.profiles?.display_name || "Anonymous"}
                      </div>
                      <div className="text-xs uppercase tracking-[0.16em] text-white/34">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <BurnMeter rating={review.burn_rating} size="sm" />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <RatingBadge label="Flavor" value={review.flavor_rating} size="sm" />
                <RatingBadge label="Longevity" value={review.longevity_rating} size="sm" />
                <RatingBadge label="Overall" value={review.overall_rating} size="sm" />
              </div>

              {review.review_text && (
                <p className="mt-4 text-sm leading-7 text-white/60">{review.review_text}</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="pb-empty px-6 py-10 text-center">
          <div className="mx-auto max-w-lg">
            <div className="mb-4 inline-flex items-center gap-2 text-sm text-white/38">
              <MessageSquare className="h-4 w-4 text-accent" />
              No reviews yet
            </div>
            <h3 className="font-display text-3xl font-bold text-white">Be the first to rate it.</h3>
            <p className="mt-4 text-sm leading-7 text-white/58">
              Add burn, flavor, longevity, and overall score to get this pouch onto the board.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
