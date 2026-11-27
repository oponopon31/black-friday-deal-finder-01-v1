[![Black Friday deal finder](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/oponopon31/black-friday-deal-finder-01-v1/rank.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/oponopon31/black-friday-deal-finder-01-v1/reward.svg)](https://make.fun/c/black-friday-deal-finder-01)

# FridayFinder — Black Friday Deal Finder

A static deal-finder site for Black Friday and Cyber Monday 2026. It lists
48 real deals, each with its product, store, link to the product at that
store, sale price, usual price, discount, a verdict on whether it is really
a deal, and the time and source of the price check.

- [Black Friday deal finder competition](https://make.fun/c/black-friday-deal-finder-01)

## How it works

Every price was read on 27 Nov 2026 at the named store or in a named deals
roundup — see `DEAL-CHECK-LOG.md` for the per-deal check log. The site is
plain static files under `app/` with no build step and no network request
at runtime: open `app/index.html` from any static server.

- Search across product, store, category and verdict.
- Filter by category, store, discount band and verdict.
- Sort by biggest discount %, biggest saving $, lowest price, or newest check.
- Every deal carries a verdict: **ALL-TIME LOW** (the source named it a
  record / lowest-ever price), **STRONG DEAL** (25% or more off), or
  **ROUTINE SALE** (under 25% off — a real cut, but a small one), with the
  evidence shown on the deal page.
- Deal detail pages on hash routes (`#/deal/<id>`), including a
  same-product comparison when another store sells it cheaper or dearer.

## Files

- `app/index.html`, `app/style.css` — page shell and styling.
- `app/data.js` — the 48 checked deals.
- `app/filters.js` — search, filter and sort rules.
- `app/views.js` — list and detail page HTML.
- `app/main.js` — boot and hash routing.
- `main.ts` — hand-in program: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json`.
- `screenshots/` — renders of the site in a browser.

## Run locally

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser.
