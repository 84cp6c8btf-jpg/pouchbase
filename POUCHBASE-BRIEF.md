# PouchBase — Project Brief

Use this document to onboard a new Claude conversation. It contains everything needed to continue development.

## What is PouchBase?

PouchBase is an independent nicotine pouch review and comparison site — like Fragrantica for perfume, but for snus and nicotine pouches. It is NOT a shop. It's a review index with structured ratings, burn scores, price comparisons, and real community reviews.

**Phase 1 (current):** Credible review authority with SEO traffic and affiliate revenue.
**Phase 2 (future):** Entertainment brand — snus battles, challenge content, etc.

**Live URL:** Deployed on Vercel (no custom domain yet). The Vercel project URL is the stable one to use.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Database/Auth:** Supabase (PostgreSQL) with Google OAuth + magic link auth
- **Styling:** Tailwind CSS v4 with dark theme, orange accent `#ff7a1a`
- **Fonts:** Manrope (body/UI) + Space Grotesk (display/editorial headings)
- **Icons:** lucide-react
- **Hosting:** Vercel
- **Supabase project ID:** `ctzjundazkjwssgrrttn`

### Key Dependencies (package.json)
```json
{
  "next": "16.2.4",
  "react": "19.2.4",
  "@supabase/supabase-js": "^2.104.0",
  "@supabase/ssr": "^0.10.2",
  "lucide-react": "^1.8.0",
  "tailwindcss": "^4"
}
```

---

## Database Schema (Supabase)

### Tables
- **brands** — id, name, slug, country, description, logo_url, website_url
- **products** — id, brand_id (FK→brands), name, slug, flavor, flavor_category, strength_mg, strength_label, format, pouches_per_can, moisture, weight_per_pouch, description, image_url, avg_burn, avg_flavor, avg_longevity, avg_overall, review_count, created_at
- **reviews** — id, product_id (FK→products), user_id (FK→auth.users), burn_rating, flavor_rating, longevity_rating, overall_rating, review_text, helpful_count, created_at. UNIQUE(product_id, user_id)
- **profiles** — id (FK→auth.users), username, display_name, avatar_url, review_count
- **shops** — id, name, slug, website_url, logo_url, shipping_info
- **prices** — id, product_id (FK→products), shop_id (FK→shops), price, pouches_in_can, currency, affiliate_url, in_stock

### Key Triggers
- `handle_new_user()` — auto-creates a profile row when a new auth user signs up. Uses `SECURITY DEFINER` with `SET search_path = public`.
- Review aggregation triggers — when a review is inserted/updated/deleted, automatically recalculates avg_burn, avg_flavor, avg_longevity, avg_overall, and review_count on the product.

### Auth
- Google OAuth (configured in Supabase + Google Cloud Console)
- Magic link email (works, but Supabase free tier SMTP is limited — "Confirm email" is turned off in Email provider settings)
- The Supabase callback URL is `https://ctzjundazkjwssgrrttn.supabase.co/auth/v1/callback`

---

## Current Data

- **19 brands** — ZYN, VELO, Loop, Pablo, Siberia, White Fox, KILLA, XQS, Ace, Nordic Spirit, Helwit, Skruf, Dope, On!, Iceberg, Kurwa, Grant's, Volt, Cuba
- **59 products** across all brands
- **~123 reviews** from 10 demo reviewer accounts
- **Shops/prices** seeded for several products

---

## Design System (globals.css)

Clean, minimal dark theme. NO frosted glass, NO gradient panels, NO glow effects.

### CSS Custom Properties
```css
--background: #0a0a0c;
--foreground: #f0ede8;
--accent: #ff7a1a;
--accent-hover: #ff9547;
--card: #111114;
--card-hover: #19191e;
--border: rgba(255, 255, 255, 0.08);
--border-strong: rgba(255, 255, 255, 0.14);
```

### Utility Classes
- `.pb-panel` — Section container (1rem radius, card bg, subtle border)
- `.pb-card` — Grid item card (0.75rem radius)
- `.pb-tag` — Metadata pill (small rounded rect, 0.375rem radius)
- `.pb-tag-soft` — Softer version of pb-tag
- `.pb-input` — Form input styling
- `.pb-empty` — Empty state dashed border container

### Design Principles
- **Flat backgrounds, no gradients** — body bg is solid `#0a0a0c`, cards are `#111114`
- **Small border-radius** — 0.75rem for cards, 1rem for panels, 0.375rem for tags
- **Minimal chrome** — no kickers, no stat tiles, no backdrop grids, no glow effects
- **Bold typography** — Space Grotesk display font carries the visual weight
- **Orange accent used sparingly** — links, burn meter, CTA buttons

---

## Scoring System

### Public Score Threshold
Products need `MIN_PUBLIC_SCORE_REVIEWS = 3` reviews before scores are shown publicly. This prevents a single review from establishing a product's rating.

### Score States (from `src/lib/burn.ts`)
- `"none"` — 0 reviews
- `"early"` — 1-2 reviews (shows "early signal" messaging)
- `"public"` — 3+ reviews (full scores visible)

### Burn Scale
- 0–2.4: **Soft** (amber)
- 2.5–4.4: **Warm** (orange)
- 4.5–6.4: **Sharp** (orange)
- 6.5–8.4: **Intense** (red)
- 8.5–10: **Inferno** (red)

### Confidence-Weighted Rankings
Rankings use Bayesian-style smoothing (`src/lib/intelligence.ts`). Products with few reviews get pulled toward the catalog average. Prior review count = 5. This prevents products with 3 five-star reviews from dominating over products with 20 reviews averaging 4.8.

---

## File Structure

### Pages (src/app/)
```
page.tsx                     — Homepage (hero, stats, burn leader, top rated, highest burn)
pouches/page.tsx             — Browse all pouches (client-side filtering/sorting)
pouches/[slug]/page.tsx      — Individual product detail page
pouches/[slug]/opengraph-image.tsx — Dynamic OG image per product
brands/page.tsx              — All brands directory
brands/[slug]/page.tsx       — Individual brand page
top-rated/page.tsx           — Top rated ranking
highest-burn/page.tsx        — Highest burn ranking
burn-ladder/page.tsx         — Burn ladder visualization
burn-vs-mg/page.tsx          — Burn vs nicotine strength scatter
compare/page.tsx             — Head-to-head product comparison
login/page.tsx               — Login page (Google OAuth + magic link)
about/page.tsx, privacy/page.tsx, terms/page.tsx — Static pages
opengraph-image.tsx          — Default site OG image
sitemap.ts, robots.ts        — SEO
```

### Components (src/components/)
```
Header.tsx              — Sticky nav with auth state
Footer.tsx              — Site footer
AgeGate.tsx             — 18+ verification overlay (localStorage)
ProductCard.tsx         — Product grid card with scores
ProductArtwork.tsx      — Colored placeholder artwork for products
BurnMeter.tsx           — Burn score bar with color coding
RatingBadge.tsx         — Score display (flavor/longevity/overall)
BrandArtwork.tsx        — Brand card artwork
PageIntro.tsx           — Reusable page header (eyebrow, title, description, meta)
PouchesPageClient.tsx   — Client-side browse page with filters
ReviewSection.tsx       — Reviews list on product page
PriceComparison.tsx     — Price comparison table on product page
LoginPageClient.tsx     — Login form (Google + magic link)
JsonLd.tsx              — SEO structured data components
BurnMethodology.tsx     — Explains burn scoring methodology
TrustDisclosure.tsx     — Transparency disclosure
BurnLadder.tsx          — Step-through burn visualization
BurnVsStrengthMap.tsx   — Burn vs mg scatter plot
BurnBandLeaders.tsx     — Leaders per burn band
BurnRankSection.tsx     — Ranked section for burn intelligence
ComparePicker.tsx       — Product comparison selector
ProductComparisonTable.tsx — Side-by-side comparison
ProductBurnSummary.tsx  — Burn context on product page
RelatedComparisons.tsx  — Related product suggestions
ReferencePanel.tsx      — Reference/methodology info
```

### Libraries (src/lib/)
```
types.ts         — TypeScript interfaces (Brand, Product, Review, Profile, Shop, Price)
supabase.ts      — Supabase client initialization
site.ts          — getSiteUrl() helper, SITE_NAME, SITE_DESCRIPTION constants
burn.ts          — Burn scale, score states, formatting, public score threshold
discovery.ts     — Product relationships, comparison logic, price summaries
intelligence.ts  — Confidence-weighted rankings, burn-strength analysis
```

### SQL Files (root)
```
supabase-schema.sql              — Full database schema
supabase-seed.sql                — Initial 14 products + brands + shops + prices
supabase-seed-expansion.sql      — 10 more brands + 45 more products
supabase-seed-reviews.sql        — 3 demo reviewers + 14 reviews (original)
supabase-seed-reviews-expansion.sql — 7 more reviewers + ~110 more reviews
supabase-remove-demo-reviews.sql — Cleanup script for demo data
```

---

## SEO Implementation

- **JSON-LD structured data** — Product (with AggregateRating, AggregateOffer), Organization, WebSite (with SearchAction), BreadcrumbList
- **Dynamic OG images** — Per-product using Next.js `ImageResponse` (edge runtime), plus default site-wide OG image
- **Canonical URLs** — Set on every page
- **Sitemap + robots.txt** — Auto-generated

---

## What's Been Done (in order)

1. Full Next.js project scaffolded with all core pages and components
2. Supabase schema created with brands, products, reviews, profiles, shops, prices
3. Database triggers for auto-profile creation and rating aggregation
4. Initial seed data (14 products, 9 brands)
5. Google OAuth + magic link auth working end-to-end
6. Age gate (18+ overlay)
7. Product catalog expansion to 59 products across 19 brands
8. Reviews seeded (~123 across all products from 10 demo accounts)
9. SEO: JSON-LD, dynamic OG images, sitemap, robots.txt
10. Complete copy rewrite — removed all AI-sounding language
11. Complete visual overhaul — stripped all frosted glass, gradient panels, glow effects, kicker badges, grid backdrops. Replaced with flat dark minimal design.
12. Public score threshold system (MIN_PUBLIC_SCORE_REVIEWS = 3)
13. Confidence-weighted rankings (Bayesian smoothing)
14. Burn intelligence modules (burn-above-strength, smooth-for-mg, etc.)
15. Burn vs Strength scatter plot page
16. Burn Ladder visualization
17. Head-to-head product comparison page
18. Related product discovery (same flavor higher/lower burn, similar burn better rating, etc.)
19. BurnMethodology and TrustDisclosure components
20. PageIntro reusable component
21. Brand cards with aggregated stats (avg overall, avg burn, strongest product, best rated)

---

## What's Left Before Launch

### Must-have
- **Custom domain** — Last thing before launch (not yet purchased)
- **More product data** — User wants "almost every mainstream snus and nicotine pouch" beyond current 59

### Post-launch
- **Affiliate links** — Add real affiliate URLs to price comparison
- **Blog/content section** — About 1 month after launch
- **Phase 2 entertainment** — Snus battles, challenge content

### Nice-to-have / Polish
- Real product images (currently using generated artwork placeholders)
- Email notifications for new reviews
- User profile pages
- Review voting (helpful/not helpful)
- More shops in price comparison

---

## Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL=https://ctzjundazkjwssgrrttn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon key>
NEXT_PUBLIC_SITE_URL=<production URL once custom domain is set>
```

---

## Important Gotchas

1. **Supabase auth trigger search_path** — The `handle_new_user()` function must use `SET search_path = public` and reference `public.profiles` explicitly, otherwise it can't find the profiles table when called from the auth schema.
2. **Vercel deployment URLs change** — Use the stable project URL, not deployment-specific URLs, in Supabase URL Configuration.
3. **Next.js 16 params are Promises** — `params` in page components must be awaited: `const { slug } = await params;`
4. **Supabase free tier SMTP** — Magic link emails may not arrive. "Confirm email" is turned off in Supabase Email provider settings.
5. **Edge runtime warning** — OG image routes show "Using edge runtime on a page currently disables static generation" — this is expected/normal.
6. **The `.next` folder** — May have macOS `.DS_Store` files that cause build issues. Delete `.next` before rebuilding if you hit EPERM errors.

---

## Owner

Cas (6hbp9y2w67@privaterelay.appleid.com)
Project folder: `~/Downloads/pouchbase`
