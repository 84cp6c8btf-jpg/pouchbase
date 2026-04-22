"use client";

import { useEffect, useState } from "react";
import { Flame, ShieldAlert } from "lucide-react";

const STORAGE_KEY = "pouchbase_age_gate_accepted_v1";

export function AgeGate() {
  const [isReady, setIsReady] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setIsAccepted(stored === "true");
    } finally {
      setIsReady(true);
    }
  }, []);

  function handleEnter() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setIsAccepted(true);
  }

  if (!isReady || isAccepted) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/88 px-4 py-8">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-card">
        <div className="px-6 py-10 sm:px-10 sm:py-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-accent">
            <ShieldAlert className="w-3.5 h-3.5" />
            Adults Only
          </div>

          <div className="mb-5 flex items-center gap-3">
            <Flame className="w-8 h-8 text-accent" />
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Age Verification</h1>
          </div>

          <p className="mb-8 max-w-lg leading-relaxed text-white/55">
            PouchBase covers nicotine pouches and is intended for adults of legal age only. By entering,
            you confirm that you are 18+ and that viewing nicotine-related content is lawful where you are.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleEnter}
              className="rounded-lg bg-accent px-6 py-3 font-semibold text-black transition-colors hover:bg-accent-hover"
            >
              I am 18+ Enter Site
            </button>
            <a
              href="https://google.com"
              className="rounded-lg border border-white/10 px-6 py-3 text-center text-white/55 transition-colors hover:border-white/20 hover:text-white"
            >
              Leave
            </a>
          </div>

          <p className="mt-5 text-xs text-white/38">
            Nicotine is addictive. Reviews on this site are user opinions, not medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
