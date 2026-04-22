"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BurnMeter } from "@/components/burn/BurnMeter";
import { RatingBadge } from "@/components/catalog/RatingBadge";
import { AlertTriangle, ExternalLink, Pencil, Trash2 } from "lucide-react";

interface ReviewWithProduct {
  id: string;
  product_id: string;
  burn_rating: number;
  flavor_rating: number;
  longevity_rating: number;
  overall_rating: number;
  review_text: string | null;
  created_at: string;
  products: {
    name: string;
    slug: string;
    flavor: string;
    strength_mg: number;
    brands: { name: string } | { name: string }[] | null;
  };
}

function getBrandName(
  brands: { name: string } | { name: string }[] | null
): string {
  if (!brands) return "";
  if (Array.isArray(brands)) return brands[0]?.name ?? "";
  return brands.name;
}

export function MyReviewsClient() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [savedDisplayName, setSavedDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameStatus, setNameStatus] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const fetchReviews = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("reviews")
      .select(
        "id, product_id, burn_rating, flavor_rating, longevity_rating, overall_rating, review_text, created_at, products(name, slug, flavor, strength_mg, brands(name))"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setReviews((data as unknown as ReviewWithProduct[]) || []);
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .single();
    const name = data?.display_name || "";
    setDisplayName(name);
    setSavedDisplayName(name);
  }, []);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id });
        await Promise.all([fetchReviews(user.id), fetchProfile(user.id)]);
      }
      setLoading(false);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchReviews, fetchProfile]);

  async function handleSaveDisplayName() {
    if (!user) return;
    const trimmed = displayName.trim();
    setSavingName(true);
    setNameStatus(null);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed || null })
      .eq("id", user.id);

    if (error) {
      setNameStatus(error.message);
    } else {
      setSavedDisplayName(trimmed);
      setEditingName(false);
      setNameStatus("Display name updated.");
      setTimeout(() => setNameStatus(null), 3000);
    }
    setSavingName(false);
  }

  async function handleDeleteReview(reviewId: string) {
    if (!user) return;
    setDeleting(true);

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (!error) {
      await fetchReviews(user.id);
      router.refresh();
    }
    setConfirmDeleteId(null);
    setDeleting(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-white/6 bg-white/[0.03]"
          />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-white/8 bg-card px-6 py-12 text-center">
        <h2 className="font-display text-2xl font-bold text-white">
          Sign in to see your reviews.
        </h2>
        <p className="mt-2 text-sm text-white/48">
          Your reviewed pouches will appear here once you are logged in.
        </p>
        <Link
          href="/login?next=/my-reviews"
          className="mt-5 inline-block rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-hover"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Display name section */}
      <section className="rounded-xl border border-white/8 bg-card p-5">
        <div className="mb-1 text-[0.66rem] uppercase tracking-[0.18em] text-white/36">
          Public identity
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {editingName ? (
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Choose a display name"
                maxLength={40}
                className="pb-input max-w-xs px-3 py-2 text-sm"
                autoFocus
              />
              <button
                onClick={handleSaveDisplayName}
                disabled={savingName}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accent-hover disabled:opacity-60"
              >
                {savingName ? "..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setDisplayName(savedDisplayName);
                  setEditingName(false);
                }}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-display text-lg font-bold text-white">
                {savedDisplayName || "Anonymous"}
              </span>
              {!savedDisplayName && (
                <span className="text-xs text-white/40">
                  Set a name so your reviews are not anonymous.
                </span>
              )}
              <button
                onClick={() => setEditingName(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:text-white"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            </div>
          )}
        </div>
        {nameStatus && (
          <p className="mt-2 text-sm text-emerald-300">{nameStatus}</p>
        )}
        <p className="mt-3 text-xs leading-5 text-white/38">
          This name appears on all your reviews. Your email address is never
          shown publicly.
        </p>
      </section>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="pb-empty px-6 py-10 text-center">
          <h3 className="font-display text-2xl font-bold text-white">
            No reviews yet.
          </h3>
          <p className="mt-2 text-sm text-white/48">
            Once you review a pouch, it will show up here.
          </p>
          <Link
            href="/pouches"
            className="mt-5 inline-block rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-hover"
          >
            Browse pouches
          </Link>
        </div>
      ) : (
        <section className="space-y-3">
          <div className="text-xs uppercase tracking-[0.14em] text-white/38">
            {reviews.length} reviewed {reviews.length === 1 ? "pouch" : "pouches"}
          </div>
          {reviews.map((review) => {
            const brand = getBrandName(review.products.brands);
            const isConfirming = confirmDeleteId === review.id;

            return (
              <article
                key={review.id}
                className="rounded-xl border border-white/8 bg-card p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[0.68rem] uppercase tracking-[0.16em] text-white/42">
                      {brand}
                    </p>
                    <h3 className="mt-0.5 font-display text-xl font-bold text-white">
                      {review.products.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="pb-tag-soft">
                        {review.products.flavor}
                      </span>
                      <span className="pb-tag-soft">
                        {review.products.strength_mg}mg
                      </span>
                      <span className="text-xs text-white/34">
                        Reviewed{" "}
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <BurnMeter rating={review.burn_rating} size="sm" />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <RatingBadge
                    label="Flavor"
                    value={review.flavor_rating}
                    size="sm"
                  />
                  <RatingBadge
                    label="Longevity"
                    value={review.longevity_rating}
                    size="sm"
                  />
                  <RatingBadge
                    label="Overall"
                    value={review.overall_rating}
                    size="sm"
                  />
                </div>

                {review.review_text && (
                  <p className="mt-3 text-sm leading-7 text-white/55">
                    {review.review_text}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/6 pt-4">
                  <Link
                    href={`/pouches/${review.products.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-white/50 transition hover:text-accent"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View product
                  </Link>
                  <Link
                    href={`/pouches/${review.products.slug}#reviews`}
                    className="inline-flex items-center gap-1.5 text-sm text-white/50 transition hover:text-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit review
                  </Link>

                  {isConfirming ? (
                    <span className="ml-auto inline-flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Delete this review?
                      </span>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deleting}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
                      >
                        {deleting ? "Deleting..." : "Yes, delete"}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:text-white"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(review.id)}
                      className="ml-auto inline-flex items-center gap-1.5 text-sm text-white/30 transition hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
