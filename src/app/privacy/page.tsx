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
    <div className="max-w-4xl mx-auto space-y-6">
      <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-accent mb-3">Privacy</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted">
          PouchBase stores basic account and review data needed to operate the service. We do not sell personal
          information, and we use third-party providers such as Supabase and Vercel to host the app.
        </p>
      </section>
    </div>
  );
}
