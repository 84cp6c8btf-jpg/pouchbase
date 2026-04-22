import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — PouchBase",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-xl border border-white/8 bg-card p-6 sm:p-8">
        <p className="mb-3 text-sm uppercase tracking-[0.16em] text-accent">Terms</p>
        <h1 className="mb-4 font-display text-3xl font-bold sm:text-4xl">Terms of Use</h1>
        <p className="max-w-3xl leading-relaxed text-white/50">
          This site is intended for adults 18+ in jurisdictions where nicotine pouch information is lawful to access.
          Ratings and reviews reflect user opinion, not medical advice. Nicotine is addictive.
        </p>
      </section>
    </div>
  );
}
