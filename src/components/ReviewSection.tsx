"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Review } from "@/lib/types";
import { BurnMeter } from "./BurnMeter";
import { RatingBadge } from "./RatingBadge";
import { MessageSquare, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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

  async function fetchReviews() {
    const { data } = await supabase
      .from("reviews")
      .select("*, profiles(display_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews((data as typeof reviews) || []);
    setLoading(false);
  }

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
  }, [productId]);

  useEffect(() => {
    if (existingReview) {
      setBurn(existingReview.burn_rating);
      setFlavor(existingReview.flavor_rating);
      setLongevity(existingReview.longevity_rating);
      setOverall(existingReview.overall_rating);
      setText(existingReview.review_text || "");
    } else {
      setBurn(5);
      setFlavor(5);
      setLongevity(5);
      setOverall(5);
      setText("");
    }
  }, [existingReview]);

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
    <section className="pb-data-panel p-6 sm:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 text-[0.66rem] uppercase tracking-[0.22em] text-white/36">Review Layer</div>
          <h2 className="font-display text-3xl font-bold text-white">Reviews ({reviews.length})</h2>
        </div>
        {user ? (
          <button
            onClick={() => setShowForm((open) => !open)}
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-hover"
          >
            {existingReview ? "Edit Your Review" : "Write a Review"}
          </button>
        ) : (
          <Link
            href={loginHref}
            className="rounded-full bg-accent px-5 py-3 text-center text-sm font-semibold text-black transition hover:bg-accent-hover"
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
        <form onSubmit={handleSubmit} className="mb-6 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 sm:p-5">
          <div className="mb-4">
            <div className="pb-kicker">
              <Sparkles className="h-3.5 w-3.5" />
              Structured Review
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Burn", value: burn, setter: setBurn },
              { label: "Flavor", value: flavor, setter: setFlavor },
              { label: "Longevity", value: longevity, setter: setLongevity },
              { label: "Overall", value: overall, setter: setOverall },
            ].map((field) => (
              <label key={field.label} className="rounded-2xl border border-white/8 bg-black/15 p-3.5">
                <span className="block text-[0.66rem] uppercase tracking-[0.22em] text-white/38">
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
              </label>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How did it hit, how long did it last, and would you buy it again?"
            className="mt-4 h-28 w-full resize-none rounded-[1.3rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/35"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-hover disabled:opacity-60"
            >
              {submitting ? "Saving..." : existingReview ? "Update Review" : "Publish Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-white/10 px-5 py-3 text-sm text-white/66 transition hover:text-white"
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
            <article key={review.id} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 sm:p-5">
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
                      <div className="text-xs uppercase tracking-[0.18em] text-white/34">
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
        <div className="pb-editorial-panel px-6 py-10 text-center">
          <div className="relative z-10 mx-auto max-w-lg">
            <div className="pb-kicker mb-5">
              <MessageSquare className="h-3.5 w-3.5" />
              Empty Review Layer
            </div>
            <h3 className="font-display text-4xl font-bold text-white">No reviews yet.</h3>
            <p className="mt-4 text-sm leading-7 text-white/58">
              This entry is ready for the first structured review. Add burn, flavor, longevity, and
              overall score to start shaping the ranking.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
