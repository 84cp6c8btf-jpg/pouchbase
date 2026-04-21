import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <section className="bg-card border border-border rounded-[2rem] p-8 sm:p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 mb-6">
          <Flame className="w-8 h-8 text-accent" />
        </div>
        <p className="text-sm uppercase tracking-[0.2em] text-accent mb-3">404</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">This pouch slipped out of the can</h1>
        <p className="text-muted max-w-xl mx-auto mb-8">
          The page you tried to open does not exist, may have moved, or has not been added to the database yet.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/pouches"
            className="bg-accent hover:bg-accent-hover text-black font-semibold px-6 py-3 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
          >
            Browse Pouches
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/brands"
            className="border border-border hover:border-accent/40 text-muted hover:text-foreground px-6 py-3 rounded-xl transition-colors"
          >
            Explore Brands
          </Link>
        </div>
      </section>
    </div>
  );
}
