# PouchBase — Current Build Status

## Overview

PouchBase is an editorial/reference site for nicotine pouches. It is not a store. The current product centers on trustworthy product comparison: burn scoring, structured reviews, price context, and discovery surfaces that avoid false certainty.

## Stack

- Next.js 16 App Router
- TypeScript + React 19
- Tailwind CSS v4
- Supabase database + auth
- Lucide React
- Vercel deployment target

## Current App Surface

- Homepage with editorial positioning, catalog stats, burn leader, discovery sections, and weekly poll
- Directory pages for pouches and brands
- Product detail pages with structured review input, price comparison, related comparisons, and burn context
- Ranking/discovery pages:
  - `/top-rated`
  - `/highest-burn`
  - `/burn-ladder`
  - `/burn-vs-mg`
  - `/compare`
- Auth flow with Google OAuth and magic-link sign-in
- SEO surface including metadata, sitemap, robots, JSON-LD, and OG images

## Current Repo Organization

```text
src/app
  route pages, metadata files, API route handlers
  route-private _components colocated where ownership is local

src/components
  layout/     shared chrome and age gate
  burn/       burn visualizations and methodology UI
  catalog/    reusable catalog/product presentation
  common/     reusable page framing and trust messaging
  polls/      shared poll UI
  seo/        JSON-LD helpers

src/lib
  catalog/    burn thresholds, ranking logic, discovery helpers, shared select strings
  polls.ts    weekly poll helpers
  site.ts     site config helpers
  supabase.ts client setup
  types.ts    shared domain types
```

## Cleanup Notes

- Shared components are no longer in one flat folder.
- Route-owned UI now lives beside its route in `_components`.
- Catalog query select strings are centralized in `src/lib/catalog/selects.ts`.
- Unused starter assets were removed.
- The unused `@supabase/ssr` dependency was removed.
- README and handoff docs were refreshed to match the actual repo.

## Verification

- `npm run typecheck` — passes
- `npm run lint` — passes
- `npm run build` — passes
- Automated tests — no test suite is present in the repo right now

## Known Gaps

- No automated test suite is present yet.
- `POUCHBASE-BRIEF.md` remains the main project brief; use this file as a snapshot, not the long-form source of truth.
