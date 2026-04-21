"use client";

import Link from "next/link";
import { Flame, Search, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Flame className="w-7 h-7 text-accent group-hover:text-accent-hover transition-colors" />
            <span className="text-xl font-bold tracking-tight">
              Pouch<span className="text-accent">Base</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/pouches"
              className="text-muted hover:text-foreground transition-colors font-medium"
            >
              Browse Pouches
            </Link>
            <Link
              href="/brands"
              className="text-muted hover:text-foreground transition-colors font-medium"
            >
              Brands
            </Link>
            <Link
              href="/top-rated"
              className="text-muted hover:text-foreground transition-colors font-medium"
            >
              Top Rated
            </Link>
            <Link
              href="/highest-burn"
              className="text-muted hover:text-foreground transition-colors font-medium"
            >
              <span className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-accent" />
                Highest Burn
              </span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/pouches"
              className="text-muted hover:text-foreground transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="bg-accent hover:bg-accent-hover text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            <Link href="/pouches" className="text-muted hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
              Browse Pouches
            </Link>
            <Link href="/brands" className="text-muted hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
              Brands
            </Link>
            <Link href="/top-rated" className="text-muted hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
              Top Rated
            </Link>
            <Link href="/highest-burn" className="text-muted hover:text-foreground py-2 flex items-center gap-1" onClick={() => setMobileOpen(false)}>
              <Flame className="w-4 h-4 text-accent" /> Highest Burn
            </Link>
            <Link
              href="/login"
              className="bg-accent hover:bg-accent-hover text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm text-center mt-2"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
