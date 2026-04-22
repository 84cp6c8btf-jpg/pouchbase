# Catalog Import Workflow

PouchBase now has a typed catalog import path intended for large-scale brand and product expansion without hand-editing long SQL seed blocks.

## Commands

```bash
npm run catalog:check
npm run catalog:import -- --source data/catalog/sample-import.json
npm run catalog:import -- --source data/catalog --write
```

`catalog:import` defaults to dry-run mode. Add `--write` to apply changes.

## Source Formats

Use either:

- A single JSON file with `brands` and `products` arrays
- A directory containing `brands.csv` and `products.csv`

Canonical fields:

- `brands`: `name`, `slug`, `country`, `description`, `websiteUrl`, `logoUrl`
- `products`: `brandSlug`, `name`, `slug`, `flavor`, `flavorCategory`, `strengthMg`, `strengthLabel`, `format`, `pouchesPerCan`, `moisture`, `weightPerPouch`, `description`, `imageUrl`

## Validation Rules

- Brand and product slugs are normalized to lowercase kebab-case.
- Brand websites are normalized to `https://` when a scheme is missing.
- Invalid website URLs fail the import.
- Flavor family values are limited to the app's current taxonomy:
  `mint`, `fruit`, `coffee`, `tobacco`, `other`
- Product formats are normalized conservatively:
  `slim`, `mini`, `regular`, `large`
- Nicotine strength accepts numeric values or strings like `6mg`.
- Strength labels default deterministically from strength when omitted.
- Duplicate slugs inside the import source fail clearly.

## Write Safety

- Brands upsert on `slug`
- Products upsert on `slug`
- Re-running the same import updates matching rows instead of creating duplicates
- `--write` requires `SUPABASE_SERVICE_ROLE_KEY`

## Integrity Reporting

`npm run catalog:check` flags weak catalog records, including:

- missing brand logo
- missing or invalid official website
- missing product description
- missing or unsupported flavor family
- missing or invalid nicotine strength
- broken brand references
- duplicate canonical slugs
- duplicate brand/name/strength combinations

## Notes

- Website validation is syntactic and conservative. It normalizes and validates HTTP(S) URLs, but it does not guarantee that the remote site is live.
- The public UI already hides invalid or missing brand websites; these tools make that easier to maintain upstream.

