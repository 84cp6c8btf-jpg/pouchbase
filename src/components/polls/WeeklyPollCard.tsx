"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Flame, LockKeyhole, Swords } from "lucide-react";
import { usePathname } from "next/navigation";
import { ProductArtwork } from "@/components/catalog/ProductArtwork";
import {
  getPollCompareHref,
  getPollEyebrow,
  getPollOptionSubtitle,
  getPollOptionTitle,
  getPollResults,
  type PollResults,
  type WeeklyPoll,
} from "@/lib/polls";
import { getBrand } from "@/lib/catalog/discovery";
import { supabase } from "@/lib/supabase";

interface WeeklyPollCardProps {
  poll: WeeklyPoll;
}

type ViewerState = {
  selectedOptionId: string | null;
  source: "authenticated" | "anonymous" | null;
};

async function fetchViewerVote(pollId: string): Promise<ViewerState> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("poll_votes")
      .select("poll_option_id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .maybeSingle<{ poll_option_id: string }>();

    return {
      selectedOptionId: data?.poll_option_id ?? null,
      source: "authenticated",
    };
  }

  const response = await fetch(`/api/polls/${pollId}/vote`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return { selectedOptionId: null, source: null };
  }

  const payload = (await response.json()) as { selectedOptionId: string | null };
  return {
    selectedOptionId: payload.selectedOptionId ?? null,
    source: "anonymous",
  };
}

async function fetchResults(pollId: string) {
  const { data } = await supabase
    .from("poll_options")
    .select("id, vote_count")
    .eq("poll_id", pollId);

  return getPollResults(
    (data || []).map((row) => ({
      id: row.id,
      voteCount: row.vote_count,
    }))
  );
}

export function WeeklyPollCard({ poll }: WeeklyPollCardProps) {
  const pathname = usePathname();
  const compareHref = useMemo(() => getPollCompareHref(poll), [poll]);
  const loginHref = useMemo(() => {
    const next = pathname && pathname !== "/login" ? pathname : "/";
    return `/login?next=${encodeURIComponent(next)}`;
  }, [pathname]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [results, setResults] = useState<PollResults>({ totalVotes: 0, options: {} });
  const [viewerSource, setViewerSource] = useState<ViewerState["source"]>(null);
  const [loadingViewer, setLoadingViewer] = useState(true);
  const [submittingOptionId, setSubmittingOptionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasVoted = Boolean(selectedOptionId);

  useEffect(() => {
    let mounted = true;

    async function loadViewerState() {
      setLoadingViewer(true);
      const viewer = await fetchViewerVote(poll.id);

      if (!mounted) return;

      setSelectedOptionId(viewer.selectedOptionId);
      setViewerSource(viewer.source);

      if (viewer.selectedOptionId) {
        const nextResults = await fetchResults(poll.id);
        if (mounted) {
          setResults(nextResults);
        }
      }

      if (mounted) {
        setLoadingViewer(false);
      }
    }

    loadViewerState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadViewerState();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [poll.id]);

  async function revealExistingVote() {
    const viewer = await fetchViewerVote(poll.id);
    setSelectedOptionId(viewer.selectedOptionId);
    setViewerSource(viewer.source);
    setResults(await fetchResults(poll.id));
  }

  async function handleVote(optionId: string) {
    if (hasVoted || submittingOptionId) return;

    setSubmittingOptionId(optionId);
    setErrorMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from("poll_votes").insert({
        poll_id: poll.id,
        poll_option_id: optionId,
        user_id: user.id,
      });

      if (error) {
        if (error.code === "23505") {
          await revealExistingVote();
        } else {
          setErrorMessage(error.message);
        }
        setSubmittingOptionId(null);
        return;
      }

      setSelectedOptionId(optionId);
      setViewerSource("authenticated");
      setResults(await fetchResults(poll.id));
      setSubmittingOptionId(null);
      return;
    }

    const response = await fetch(`/api/polls/${poll.id}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ optionId }),
    });

    const payload = (await response.json()) as {
      error?: string;
      selectedOptionId?: string | null;
      results?: PollResults;
    };

    if (!response.ok) {
      if (payload.selectedOptionId) {
        setSelectedOptionId(payload.selectedOptionId);
      }
      if (payload.results) {
        setResults(payload.results);
      }
      setViewerSource("anonymous");
      setErrorMessage(payload.error || "Vote could not be recorded.");
      setSubmittingOptionId(null);
      return;
    }

    setSelectedOptionId(payload.selectedOptionId ?? optionId);
    setViewerSource("anonymous");
    setResults(payload.results ?? results);
    setSubmittingOptionId(null);
  }

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
          const isSelected = option.id === selectedOptionId;
          const optionResults = results.options[option.id] || { percentage: 0, voteCount: 0 };
          const submitting = submittingOptionId === option.id;
          const brand = option.product ? getBrand(option.product) : null;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleVote(option.id)}
              disabled={hasVoted || Boolean(submittingOptionId) || loadingViewer}
              className={`group relative overflow-hidden rounded-xl border text-left transition ${
                isSelected
                  ? "border-accent/70 bg-accent/[0.08]"
                  : "border-white/8 bg-white/[0.02] hover:border-white/18"
              } ${hasVoted ? "cursor-default" : "cursor-pointer"}`}
            >
              {hasVoted && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    isSelected ? "bg-accent/18" : "bg-white/[0.03]"
                  }`}
                  style={{ width: `${optionResults.percentage}%` }}
                />
              )}

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
                    {hasVoted && (
                      <div className={`text-right ${isSelected ? "text-accent" : "text-white/62"}`}>
                        <div className="font-display text-2xl font-bold">{optionResults.percentage}%</div>
                        <div className="text-[0.68rem] uppercase tracking-[0.16em]">
                          {optionResults.voteCount} votes
                        </div>
                      </div>
                    )}
                  </div>

                  {hasVoted ? (
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/6">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSelected ? "bg-accent" : "bg-white/30"
                        }`}
                        style={{ width: `${optionResults.percentage}%` }}
                      />
                    </div>
                  ) : (
                    <div className="mt-4 text-xs uppercase tracking-[0.16em] text-white/42">
                      {submitting ? "Casting vote..." : "Tap to vote"}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/8 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {hasVoted ? (
          <div className="text-white/52">
            <span className="font-semibold text-white">{results.totalVotes}</span> total votes
            {viewerSource === "anonymous" && " / signed-out votes are stored per browser"}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 text-white/44">
            <span className="inline-flex items-center gap-2">
              <LockKeyhole className="h-3.5 w-3.5" />
              Results unlock after your vote
            </span>
            <Link href={loginHref} className="text-accent transition hover:text-accent-hover">
              Sign in for account-based vote locking
            </Link>
          </div>
        )}

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

      {errorMessage && (
        <div className="border-t border-red-500/20 bg-red-500/8 px-5 py-3 text-sm text-red-200 sm:px-6">
          {errorMessage}
        </div>
      )}
    </section>
  );
}
