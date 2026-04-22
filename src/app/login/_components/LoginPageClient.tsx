"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Flame, Mail, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginPageClientProps {
  returnTo?: string;
}

function normalizeReturnTo(value?: string) {
  if (!value || !value.startsWith("/")) return "/";
  return value;
}

export function LoginPageClient({ returnTo }: LoginPageClientProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();
  const nextPath = useMemo(() => normalizeReturnTo(returnTo), [returnTo]);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;
      if (user) {
        router.replace(nextPath);
        router.refresh();
        return;
      }
      setCheckingSession(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace(nextPath);
        router.refresh();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [nextPath, router]);

  async function handleGoogleSignIn() {
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your inbox and open the magic link on this same device and browser to finish signing in.");
      setEmail("");
    }

    setSubmitting(false);
  }

  if (checkingSession) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-white/8 bg-card p-8 text-center sm:p-10">
        <p className="mb-3 text-sm uppercase tracking-[0.16em] text-accent">PouchBase Account</p>
        <h1 className="mb-3 font-display text-3xl font-bold">Checking your sign-in session...</h1>
        <p className="text-white/50">If you just used Google or opened a magic link on this device, we’ll send you back automatically.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-xl border border-white/8 bg-card p-6 sm:p-8 lg:p-10">
        <div className="mb-4 inline-flex items-center gap-2 text-accent">
          <Flame className="w-5 h-5" />
          <span className="text-sm uppercase tracking-[0.16em]">PouchBase Account</span>
        </div>
        <h1 className="mb-4 font-display text-3xl font-bold sm:text-4xl">Sign in to rate, review, and add trusted signal to the catalog</h1>
        <p className="max-w-2xl text-white/50">
          PouchBase keeps scoring trust-first. Signing in lets you leave structured reviews, compare favorites, and help build public scores only when enough real data exists.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            "Rate burn, flavor, and longevity",
            "Compare products with your own logged experience",
            "Help public scores earn credibility over time",
          ].map((item) => (
            <div key={item} className="rounded-lg border border-white/8 bg-black/20 p-4 text-sm text-white/45">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/8 bg-card p-6 sm:p-8">
        <h2 className="mb-2 font-display text-2xl font-bold">Sign In</h2>
        <p className="mb-6 text-sm text-white/45">Google is the fastest path. Email remains available as a slower fallback.</p>
        {nextPath !== "/" && (
          <p className="mb-4 text-xs text-white/40">
            You’ll be sent back to <span className="text-white">{nextPath}</span> after sign-in.
          </p>
        )}

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-accent">Recommended</p>
                <h3 className="mt-1 font-display text-xl font-bold text-white">Continue with Google</h3>
                <p className="mt-1 text-sm text-white/45">Faster sign-in, fewer steps, and the smoothest return to your review flow.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-black transition-colors hover:bg-zinc-200 disabled:opacity-60"
            >
              <Flame className="h-5 w-5" />
              Continue with Google
            </button>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs uppercase tracking-[0.16em] text-white/40">Email fallback</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-black/10 p-4">
            <p className="text-sm font-medium text-white/72">Use a magic link instead</p>
            <p className="mt-1 text-sm leading-6 text-white/42">
              Best if you open the email on this same device and browser. Cross-device opens can interrupt the return flow.
            </p>

            <form onSubmit={handleMagicLink} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-white/45">Email address</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pb-input pl-10 pr-4 py-3 text-sm"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl border border-white/10 bg-accent px-4 py-3 font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                Send Magic Link
              </button>
            </form>
          </div>

          {message && (
            <p className="text-sm text-green-400 inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {message}
            </p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </section>
    </div>
  );
}
