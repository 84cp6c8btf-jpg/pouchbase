import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About PouchBase",
  description: "Learn what PouchBase is building and why independent nicotine pouch reviews matter.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-xl border border-white/8 bg-card p-6 sm:p-8">
        <p className="mb-3 text-sm uppercase tracking-[0.16em] text-accent">About PouchBase</p>
        <h1 className="mb-4 font-display text-3xl font-bold sm:text-4xl">Independent nicotine pouch reviews, rankings, and price tracking</h1>
        <p className="max-w-3xl leading-relaxed text-white/50">
          PouchBase is building an honest, user-driven reference for nicotine pouches. We compare brands,
          collect community ratings, and surface pricing so users can make better choices without relying on shop-owned review content.
        </p>
      </section>
    </div>
  );
}
