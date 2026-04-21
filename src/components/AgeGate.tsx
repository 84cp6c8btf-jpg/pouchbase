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
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-[2rem] border border-border bg-card shadow-2xl overflow-hidden">
        <div className="px-6 py-10 sm:px-10 sm:py-12 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_55%)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-accent mb-6">
            <ShieldAlert className="w-3.5 h-3.5" />
            Adults Only
          </div>

          <div className="flex items-center gap-3 mb-5">
            <Flame className="w-8 h-8 text-accent" />
            <h1 className="text-3xl sm:text-4xl font-bold">Age Verification</h1>
          </div>

          <p className="text-muted leading-relaxed mb-8">
            PouchBase covers nicotine pouches and is intended for adults of legal age only. By entering,
            you confirm that you are 18+ and that viewing nicotine-related content is lawful where you are.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleEnter}
              className="bg-accent hover:bg-accent-hover text-black font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              I am 18+ Enter Site
            </button>
            <a
              href="https://google.com"
              className="border border-border hover:border-accent/40 text-muted hover:text-foreground px-6 py-3 rounded-xl transition-colors text-center"
            >
              Leave
            </a>
          </div>

          <p className="text-xs text-muted mt-5">
            Nicotine is addictive. Reviews on this site are user opinions, not medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
