# PouchBase — Build Status & Codex Handoff

## What This Project Is
An independent nicotine pouch encyclopedia + comparison site. Think Fragrantica for snus. Users browse, rate, and review pouches. Unique feature: BURN RATING (1-10 scale). Price comparison via affiliate links.

See PROJECT_BRIEF.md (one level up) for the full vision including the entertainment/content layer.

## Tech Stack
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS (dark theme, orange accent #f97316)
- **Database:** Supabase (PostgreSQL) — project: ctzjundazkjwssgrrttn
- **Auth:** Supabase Auth (Google + email)
- **Hosting:** Vercel (not yet deployed)
- **Icons:** lucide-react

## What's Done

### Infrastructure
- [x] Next.js project initialized with TypeScript + Tailwind
- [x] Supabase client configured (`src/lib/supabase.ts`)
- [x] Environment variables set (`.env.local`)
- [x] Type definitions (`src/lib/types.ts`)
- [x] Database schema SQL ready (`supabase-schema.sql`) — **NOT YET RUN**

### Components Built
- [x] `Header.tsx` — sticky nav with logo, links, mobile menu, sign in button
- [x] `Footer.tsx` — links, categories, legal disclaimer
- [x] `BurnMeter.tsx` — the signature burn rating display (color-coded, 1-10 scale with labels: Mild/Moderate/Spicy/Intense/Inferno)
- [x] `RatingBadge.tsx` — small rating display for flavor/longevity/overall
- [x] `ProductCard.tsx` — card for product listings (shows brand, name, tags, burn meter, ratings)
- [x] `PriceComparison.tsx` — price table with affiliate links, "Best Price" badge
- [x] `ReviewSection.tsx` — full review system with rating sliders (burn/flavor/longevity/overall), text review, review list

### Pages Built
- [x] `/` (homepage) — hero, stats, top rated section, highest burn section, CTA
- [x] `/pouches` — browse page with search, filters (brand, flavor category, burn min), sort options
- [x] `/pouches/[slug]` — individual product page with full details, price comparison, reviews

## What Still Needs To Be Done

### Critical (Before Launch)
1. **Run the database schema** — Go to Supabase Dashboard > SQL Editor > paste `supabase-schema.sql` > Run
2. **Seed the database** — Add 30-50 real products (brands + products). Create a seed script or do it via Supabase dashboard. Top brands to add: ZYN, VELO, LOOP, Pablo, Siberia, White Fox, KILLA, XQS, ACE, CUBA
3. **Login page** — `/login` page with Supabase auth (Google + email signup). Need to enable Google auth provider in Supabase dashboard > Authentication > Providers
4. **Deploy to Vercel** — Push to GitHub, connect repo in Vercel dashboard, add env vars there too
5. **Connect custom domain** — when purchased

### Important (Week 1)
6. **Brands page** — `/brands` listing all brands with product counts
7. **Brand detail page** — `/brands/[slug]` showing all products from a brand
8. **Top Rated page** — `/top-rated` sorted by avg_overall
9. **Highest Burn page** — `/highest-burn` sorted by avg_burn (the signature page)
10. **SEO** — add sitemap.xml, robots.txt, structured data (JSON-LD) for products
11. **OG images** — dynamic OG images for product pages
12. **Mobile polish** — test all pages on mobile, fix any layout issues
13. **Age gate** — 18+ verification interstitial on first visit

### Nice to Have (Week 2+)
14. User profile pages (`/users/[id]`)
15. "Add to my shelf" (favorites/collection)
16. Head-to-head comparison tool
17. Newsletter signup
18. Blog/content section for SEO articles
19. Price alerts
20. Seed data script with real product data

## File Structure
```
src/
  app/
    layout.tsx          — root layout with Header/Footer
    page.tsx            — homepage
    globals.css         — Tailwind + CSS variables (dark theme)
    pouches/
      page.tsx          — browse/search page
      [slug]/
        page.tsx        — individual product page
  components/
    Header.tsx          — site header + nav
    Footer.tsx          — site footer
    BurnMeter.tsx       — burn rating display component
    RatingBadge.tsx     — small rating display
    ProductCard.tsx     — product listing card
    PriceComparison.tsx — price comparison table
    ReviewSection.tsx   — reviews + review form
  lib/
    supabase.ts         — Supabase client
    types.ts            — TypeScript type definitions
```

## Design System
- **Background:** #09090b (zinc-950)
- **Card:** #18181b (zinc-900)
- **Border:** #3f3f46 (zinc-700)
- **Accent:** #f97316 (orange-500)
- **Text:** #fafafa (zinc-50)
- **Muted text:** #a1a1aa (zinc-400)
- **Font:** Inter

## Database Tables
- `brands` — name, slug, country, description, logo
- `products` — name, slug, flavor, flavor_category, strength_mg, format, moisture, avg ratings (auto-updated via trigger)
- `profiles` — extends auth.users, auto-created on signup
- `reviews` — burn/flavor/longevity/overall ratings (1-10), review text, one per user per product
- `shops` — name, website, affiliate URL template
- `prices` — product + shop + price + affiliate link

## Affiliate Partners to Sign Up For
- Swenico (10% commission)
- Snusmania
- Snuscore
- Nicopods UK (10%)

## Key Notes for Codex
- The homepage uses server components and fetches from Supabase directly
- The browse page (`/pouches`) is a client component with client-side filtering
- The product page (`/pouches/[slug]`) is a server component, but PriceComparison and ReviewSection are client components
- The BurnMeter is the signature UI element — it should be prominent everywhere
- All database writes go through Supabase client with RLS policies enforcing auth
- The review trigger automatically recalculates product averages on insert/update/delete
