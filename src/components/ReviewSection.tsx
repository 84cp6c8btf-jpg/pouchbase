"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Review } from "@/lib/types";
import { BurnMeter } from "./BurnMeter";
import { RatingBadge } from "./RatingBadge";
import { MessageSquare, User, Flame } from "lucide-react";

interface ReviewSectionProps {
  productId: string;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<(Review & { profiles: { display_name: string | null } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  // Review form state
  const [burn, setBurn] = useState(5);
  const [flavor, setFlavor] = useState(5);
  const [longevity, setLongevity] = useState(5);
  const [overall, setOverall] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from("reviews")
        .select("*, profiles(display_name)")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      setReviews((data as typeof reviews) || []);
      setLoading(false);
    }

    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ? { id: user.id } : null);
    }

    fetchReviews();
    checkUser();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      burn_rating: burn,
      flavor_rating: flavor,
      longevity_rating: longevity,
      overall_rating: overall,
      review_text: text || null,
    });

    if (!error) {
      // Refresh reviews
      const { data } = await supabase
        .from("reviews")
        .select("*, profiles(display_name)")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      setReviews((data as typeof reviews) || []);
      setShowForm(false);
      setText("");
    }

    setSubmitting(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          Reviews ({reviews.length})
        </h2>
        {user ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-accent hover:bg-accent-hover text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Write a Review
          </button>
        ) : (
          <a
            href="/login"
            className="bg-accent hover:bg-accent-hover text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Sign In to Review
          </a>
        )}
      </div>

      {/* Review Form */}
      {showForm && user && (
        <form onSubmit={handleSubmit} className="border border-border rounded-xl p-4 mb-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-muted block mb-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-accent" /> Burn
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={burn}
                onChange={(e) => setBurn(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <span className="text-sm font-bold text-center block">{burn}/10</span>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Flavor</label>
              <input
                type="range"
                min="1"
                max="10"
                value={flavor}
                onChange={(e) => setFlavor(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <span className="text-sm font-bold text-center block">{flavor}/10</span>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Longevity</label>
              <input
                type="range"
                min="1"
                max="10"
                value={longevity}
                onChange={(e) => setLongevity(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <span className="text-sm font-bold text-center block">{longevity}/10</span>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Overall</label>
              <input
                type="range"
                min="1"
                max="10"
                value={overall}
                onChange={(e) => setOverall(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <span className="text-sm font-bold text-center block">{overall}/10</span>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts on this pouch... (optional)"
            className="w-full bg-zinc-800 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent resize-none h-24"
          />

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitting}
              className="bg-accent hover:bg-accent-hover text-black font-semibold px-6 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted hover:text-foreground text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border border-border rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <User className="w-5 h-5 text-muted" />
                  <span className="font-medium text-sm">
                    {review.profiles?.display_name || "Anonymous"}
                  </span>
                  <span className="text-xs text-muted">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <BurnMeter rating={review.burn_rating} size="sm" showLabel={false} />
              </div>

              <div className="flex flex-wrap gap-4 mb-3">
                <RatingBadge label="Flavor" value={review.flavor_rating} size="sm" />
                <RatingBadge label="Longevity" value={review.longevity_rating} size="sm" />
                <RatingBadge label="Overall" value={review.overall_rating} size="sm" />
              </div>

              {review.review_text && (
                <p className="text-sm text-muted">{review.review_text}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted text-center py-8">
          No reviews yet. Be the first to share your experience with this pouch.
        </p>
      )}
    </div>
  );
}
