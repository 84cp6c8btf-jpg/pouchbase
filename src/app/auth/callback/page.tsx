"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Flame } from "lucide-react";

function normalizeNext(value: string | null): string {
  if (!value || !value.startsWith("/")) return "/";
  return value;
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleCallback() {
      const next = normalizeNext(searchParams.get("next"));
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as
        | "email"
        | "recovery"
        | "invite"
        | "magiclink"
        | "email_change"
        | null;

      if (code) {
        // OAuth (Google) — PKCE code exchange
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Auth callback error:", error.message);
          router.replace("/login");
          return;
        }
      } else if (tokenHash && type) {
        // Magic link / OTP
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (error) {
          console.error("OTP verification error:", error.message);
          router.replace("/login");
          return;
        }
      }

      router.replace(next);
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-white/8 bg-card p-8 text-center sm:p-10">
      <div className="mb-4 inline-flex items-center gap-2 text-accent">
        <Flame className="w-5 h-5" />
        <span className="text-sm uppercase tracking-[0.16em]">PouchCompare Account</span>
      </div>
      <h1 className="mb-3 font-display text-3xl font-bold">Signing you in…</h1>
      <p className="text-white/50">
        Just a moment while we complete your sign-in.
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl rounded-xl border border-white/8 bg-card p-8 text-center sm:p-10">
          <h1 className="font-display text-3xl font-bold">Signing you in…</h1>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
