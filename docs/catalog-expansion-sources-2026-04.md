# Catalog Expansion Sources — 2026-04

This file documents the official or brand-operated sources used for the mainstream catalog expansion dataset in [data/catalog/mainstream-expansion-2026-04.json](/Users/cb/Downloads/pouchbase/data/catalog/mainstream-expansion-2026-04.json).

## Brand metadata

- ZYN:
  - https://www.zyn.com/gb/en/discover-zyn.html
  - https://www.zyn.com/hr/hr/otkrij-zyn/svi-okusi/zyn-cool-mint-mini-3-mg.html
- VELO:
  - https://www.velo.com/gb/en/
  - https://www.velo.com/gb/en/our-products
- LOOP:
  - https://loopnicotinepouches.com/
- Nordic Spirit:
  - https://www.nordicspirit.com/fr-fr
- Helwit:
  - https://helwit.co.uk/
- XQS:
  - https://xqs.com/
- on!:
  - https://www.onnicotine.com/
- KILLA:
  - https://killapods.eu/
- Siberia:
  - https://siberia.de/en
- Après:
  - https://apres.se/en
  - https://apres.se/en/pages/about-apres
- Übbs:
  - https://ubbspouches.com/
  - https://ubbspouches.com/pages/about-us

## Product sourcing approach

- VELO products were expanded from the official UK product listing and selected official product pages where flavor, strength, and size were explicit.
- LOOP products were added from official product pages with explicit nicotine-per-pouch, pouch count, and flavor descriptions.
- Helwit products were added or corrected from official product pages on `helwit.co.uk` with explicit nicotine-per-pouch, pouch count, and format details.
- Après and Übbs were added at the brand level from official brand-operated sites, but no product rows were added for formats where pouch-level nicotine or size mapping was not explicit enough for conservative import.

## Curation rules used

- Only official or brand-operated domains were used.
- Only products with sufficiently explicit flavor, strength, and format details were added.
- If product sizing or nicotine-per-pouch mapping was ambiguous, the row was omitted rather than guessed.
- Existing routes and slugs were preserved unless a current row could be safely corrected without breaking public path structure.
