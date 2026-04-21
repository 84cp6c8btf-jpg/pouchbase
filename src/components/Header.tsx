"use client";

import Link from "next/link";
import { Flame, Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/pouches", label: "Browse Pouches" },
  { href: "/brands", label: "Brands" },
  { href: "/top-rated", label: "Top Rated" },
  { href: "/highest-burn", label: "Highest Burn", highlight: true },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const loginHref = useMemo(() => {
    const next = pathname && pathname !== "/login" ? pathname : "/";
    return `/login?next=${encodeURIComponent(next)}`;
  }, [pathname]);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    setMobileOpen(false);
    setSigningOut(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[rgba(10,11,16,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent shadow-[0_0_24px_rgba(255,122,26,0.16)]">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-[1.4rem] font-bold leading-none tracking-[-0.05em]">
              Pouch<span className="text-accent">Base</span>
            </div>
            <div className="text-[0.62rem] uppercase tracking-[0.28em] text-white/38">
              Review Index
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-white/8 text-white"
                    : "text-white/58 hover:bg-white/6 hover:text-white"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {item.highlight && <Flame className="h-4 w-4 text-accent" />}
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/pouches"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/8 bg-white/[0.03] text-white/58 transition hover:border-white/16 hover:text-white"
          >
            <Search className="h-[1.125rem] w-[1.125rem]" />
          </Link>
          {userEmail ? (
            <div className="flex items-center gap-3">
              <span className="max-w-44 truncate text-xs text-white/45">{userEmail}</span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accent-hover disabled:opacity-60"
              >
                {signingOut ? "Signing Out..." : "Sign Out"}
              </button>
            </div>
          ) : (
            <Link
              href={loginHref}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-accent-hover"
            >
              Sign In
            </Link>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-full border border-white/8 bg-white/[0.03] text-white/70 md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/6 bg-[rgba(12,13,18,0.96)] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-4 py-3 text-sm transition ${
                    active ? "bg-white/8 text-white" : "text-white/62"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="inline-flex items-center gap-2">
                    {item.highlight && <Flame className="h-4 w-4 text-accent" />}
                    {item.label}
                  </span>
                </Link>
              );
            })}
            {userEmail ? (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="mt-2 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
              >
                {signingOut ? "Signing Out..." : "Sign Out"}
              </button>
            ) : (
              <Link
                href={loginHref}
                className="mt-2 rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-black"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
