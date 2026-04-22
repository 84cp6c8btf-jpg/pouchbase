# PouchBase

PouchBase is an editorial/reference site for nicotine pouches. It is not a store. The product is built around trust-first comparison: structured reviews, public-score thresholds, burn analysis, and retailer pricing kept separate from rankings.

## Stack

- Next.js 16 App Router
- TypeScript + React 19
- Tailwind CSS v4
- Supabase for database and auth
- Lucide React for icons

## Local Development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Repo Guide

- `src/app` — routes, metadata files, route handlers, and route-private `_components`
- `src/components` — shared UI grouped by concern (`layout`, `burn`, `catalog`, `common`, `polls`, `seo`)
- `src/lib` — shared utilities and domain logic
- `src/lib/catalog` — burn thresholds, catalog discovery helpers, ranking logic, and shared select strings
- `public` — public assets only when actually used
- `supabase-*.sql` — schema, seed, migration, and cleanup SQL

## Project Docs

- [POUCHBASE-BRIEF.md](./POUCHBASE-BRIEF.md) — primary project brief and source of truth
- [BUILD_STATUS.md](./BUILD_STATUS.md) — current implementation/status snapshot
- [AGENTS.md](./AGENTS.md) — repo-specific guidance for coding agents

## Notes

- Public scores only appear after enough structured reviews exist.
- Rankings use confidence weighting, not raw averages alone.
- No automated test suite is currently present in the repo.
