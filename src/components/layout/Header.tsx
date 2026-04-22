"use client";

import Link from "next/link";
import { Flame, Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/pouches", label: "Browse" },
  { href: "/brands", label: "Brands" },
  { href: "/top-rated", label: "Top Rated" },
  { href: "/highest-burn", label: "Burn", highlight: true },
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
    <header className="sticky top-0 z-50 border-b border-white/6 bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Flame className="h-5 w-5 text-accent" />
          <span className="font-display text-xl font-bold tracking-tight">
            Pouch<span className="text-accent">Base</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white/8 text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {item.highlight && <Flame className="h-3.5 w-3.5 text-accent" />}
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/pouches"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/8 text-white/50 transition hover:text-white"
          >
            <Search className="h-4 w-4" />
          </Link>
          {userEmail ? (
            <div className="flex items-center gap-3">
              <span className="max-w-40 truncate text-xs text-white/40">{userEmail}</span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-black transition hover:bg-accent-hover disabled:opacity-60"
              >
                {signingOut ? "..." : "Sign Out"}
              </button>
            </div>
          ) : (
            <Link
              href={loginHref}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accent-hover"
            >
              Sign In
            </Link>
          )}
        </div>

        <button
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/8 text-white/60 md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/6 bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2.5 text-sm transition ${
                    active ? "bg-white/8 text-white" : "text-white/55"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="inline-flex items-center gap-2">
                    {item.highlight && <Flame className="h-3.5 w-3.5 text-accent" />}
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
                className="mt-2 rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
              >
                {signingOut ? "..." : "Sign Out"}
              </button>
            ) : (
              <Link
                href={loginHref}
                className="mt-2 rounded-lg bg-accent px-3 py-2.5 text-center text-sm font-semibold text-black"
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
