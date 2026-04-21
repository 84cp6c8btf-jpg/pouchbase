export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-accent mb-3">About PouchBase</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Independent nicotine pouch reviews, rankings, and price tracking</h1>
        <p className="text-muted">
          PouchBase is building an honest, user-driven reference for nicotine pouches. We compare brands,
          collect community ratings, and surface pricing so users can make better choices without relying on shop-owned review content.
        </p>
      </section>
    </div>
  );
}
