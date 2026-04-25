import Link from "next/link";
import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/6">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="max-w-sm">
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <Flame className="h-4 w-4 text-accent" />
              <span className="font-display text-lg font-bold tracking-tight">
                Pouch<span className="text-accent">Base</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/48">
              Independent nicotine pouch reviews for adults. We don&apos;t sell pouches — we help
              you compare them with honest product data, burn scoring, live price info, and real community reviews where available.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white/60">Explore</h3>
            <ul className="space-y-2 text-sm text-white/48">
              <li><Link href="/pouches" className="transition hover:text-white">All Pouches</Link></li>
              <li><Link href="/brands" className="transition hover:text-white">Brands</Link></li>
              <li><Link href="/top-rated" className="transition hover:text-white">Top Rated</Link></li>
              <li><Link href="/highest-burn" className="transition hover:text-white">Highest Burn</Link></li>
              <li><Link href="/burn-ladder" className="transition hover:text-white">Burn Ladder</Link></li>
              <li><Link href="/burn-vs-mg" className="transition hover:text-white">Burn vs Mg</Link></li>
              <li><Link href="/compare" className="transition hover:text-white">Compare</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white/60">By Flavor</h3>
            <ul className="space-y-2 text-sm text-white/48">
              <li><Link href="/pouches?flavor_family=mint" className="transition hover:text-white">Mint</Link></li>
              <li><Link href="/pouches?flavor_family=fruit" className="transition hover:text-white">Fruit</Link></li>
              <li><Link href="/pouches?flavor_family=coffee" className="transition hover:text-white">Coffee</Link></li>
              <li><Link href="/pouches?flavor_family=tobacco" className="transition hover:text-white">Tobacco</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white/60">About</h3>
            <ul className="space-y-2 text-sm text-white/48">
              <li><Link href="/about" className="transition hover:text-white">About</Link></li>
              <li><Link href="/privacy" className="transition hover:text-white">Privacy</Link></li>
              <li><Link href="/terms" className="transition hover:text-white">Terms</Link></li>
            </ul>
            <p className="mt-5 text-xs text-white/25">
              Adults 18+ only. Nicotine is addictive.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/6 pt-5 text-xs text-white/25">
          <p>&copy; {new Date().getFullYear()} PouchBase</p>
        </div>
      </div>
    </footer>
  );
}
