import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — PouchBase",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-xl border border-white/8 bg-card p-6 sm:p-8">
        <p className="mb-3 text-sm uppercase tracking-[0.16em] text-accent">Privacy</p>
        <h1 className="mb-4 font-display text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
        <p className="max-w-3xl leading-relaxed text-white/50">
          PouchBase stores basic account and review data needed to operate the service. We do not sell personal
          information, and we use third-party providers such as Supabase and Vercel to host the app.
        </p>
      </section>
    </div>
  );
}
