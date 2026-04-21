import Link from "next/link";
import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/6 bg-[linear-gradient(180deg,rgba(16,17,22,0.92),rgba(10,11,15,0.98))]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="max-w-md">
            <Link href="/" className="mb-5 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold tracking-[-0.05em]">
                  Pouch<span className="text-accent">Base</span>
                </div>
                <div className="text-[0.62rem] uppercase tracking-[0.28em] text-white/38">
                  Encyclopedia Layer
                </div>
              </div>
            </Link>
            <p className="text-sm leading-7 text-white/56">
              Independent nicotine pouch discovery for adults who want something more useful than
              shop-owned rankings. Real reviews, structured scores, burn signal, and price context.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-bold">Explore</h3>
            <ul className="space-y-3 text-sm text-white/56">
              <li><Link href="/pouches" className="transition hover:text-white">All Pouches</Link></li>
              <li><Link href="/brands" className="transition hover:text-white">Brands</Link></li>
              <li><Link href="/top-rated" className="transition hover:text-white">Top Rated</Link></li>
              <li><Link href="/highest-burn" className="transition hover:text-white">Highest Burn</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-bold">Flavor Worlds</h3>
            <ul className="space-y-3 text-sm text-white/56">
              <li><Link href="/pouches?category=mint" className="transition hover:text-white">Mint</Link></li>
              <li><Link href="/pouches?category=fruit" className="transition hover:text-white">Fruit</Link></li>
              <li><Link href="/pouches?category=coffee" className="transition hover:text-white">Coffee</Link></li>
              <li><Link href="/pouches?category=tobacco" className="transition hover:text-white">Tobacco</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-bold">House Rules</h3>
            <ul className="space-y-3 text-sm text-white/56">
              <li><Link href="/about" className="transition hover:text-white">About</Link></li>
              <li><Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="transition hover:text-white">Terms of Use</Link></li>
            </ul>
            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-white/36">
              Adults 18+ only. Nicotine is addictive.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/6 pt-6 text-xs text-white/38 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} PouchBase. Independent reviews, not brand-owned hype.</p>
          <p>Built for scanability, comparison, and actual product discovery.</p>
        </div>
      </div>
    </footer>
  );
}
