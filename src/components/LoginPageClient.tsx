"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Flame, Mail, CheckCircle2 } from "lucide-react";

export function LoginPageClient() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
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
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for a magic link to sign in.");
      setEmail("");
    }

    setSubmitting(false);
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
      <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 lg:p-10">
        <div className="inline-flex items-center gap-2 text-accent mb-4">
          <Flame className="w-5 h-5" />
          <span className="text-sm uppercase tracking-[0.2em]">PouchBase Account</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Sign in to rate, review, and build your taste profile</h1>
        <p className="text-muted max-w-2xl">
          Create an account to leave burn ratings, compare favorites, and help shape the most honest pouch database on the internet.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            "Rate burn, flavor, and longevity",
            "Track your favorite brands and products",
            "Help other users find the best pouch",
          ].map((item) => (
            <div key={item} className="bg-zinc-900/60 border border-border rounded-xl p-4 text-sm text-muted">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card border border-border rounded-3xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-2">Sign In</h2>
        <p className="text-sm text-muted mb-6">Use Google or get a secure magic link by email.</p>

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold rounded-xl px-4 py-3 hover:bg-zinc-200 transition-colors disabled:opacity-60"
          >
            <Flame className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs uppercase tracking-[0.2em] text-muted">Or</span>
            </div>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-4">
            <label className="block">
              <span className="text-sm text-muted mb-2 block">Email address</span>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-800 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent hover:bg-accent-hover text-black font-semibold rounded-xl px-4 py-3 transition-colors disabled:opacity-60"
            >
              Send Magic Link
            </button>
          </form>

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
