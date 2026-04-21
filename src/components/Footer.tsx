import Link from "next/link";
import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Flame className="w-6 h-6 text-accent" />
              <span className="text-lg font-bold">
                Pouch<span className="text-accent">Base</span>
              </span>
            </Link>
            <p className="text-muted text-sm">
              The independent encyclopedia for nicotine pouches. Real reviews. Real burn ratings. Best prices.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Browse</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/pouches" className="hover:text-foreground transition-colors">All Pouches</Link></li>
              <li><Link href="/brands" className="hover:text-foreground transition-colors">Brands</Link></li>
              <li><Link href="/top-rated" className="hover:text-foreground transition-colors">Top Rated</Link></li>
              <li><Link href="/highest-burn" className="hover:text-foreground transition-colors">Highest Burn</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Categories</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/pouches?category=mint" className="hover:text-foreground transition-colors">Mint</Link></li>
              <li><Link href="/pouches?category=fruit" className="hover:text-foreground transition-colors">Fruit</Link></li>
              <li><Link href="/pouches?category=coffee" className="hover:text-foreground transition-colors">Coffee</Link></li>
              <li><Link href="/pouches?category=tobacco" className="hover:text-foreground transition-colors">Tobacco</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link></li>
            </ul>
            <p className="text-xs text-muted mt-4">
              Nicotine is addictive. This site is for adults 18+ only.
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} PouchBase. Independent reviews — not affiliated with any brand or shop.
        </div>
      </div>
    </footer>
  );
}
