# Building the blog for www.koursea.com/journal/

Decision (owner, 2026-11-15): the blog moves to `/journal/` on the main site. This repository keeps being the source of the posts and the Astro build; only the address changes.

## What exists now (nothing is deployed from it)
- `JOURNAL_BASE=1` makes `astro.config.mjs` use `site: https://www.koursea.com` and `base: /journal`.
- `src/lib/site-url.ts` builds absolute URLs that respect `base`. Templates used `new URL('/path', Astro.site)`, which ignored `base` and would have pointed canonicals, JSON-LD and social images outside `/journal/`.
- `pnpm build:journal` = build into `dist-journal`, `scripts/journal-base/rewrite-dist.mjs` (moves `https://blog.koursea.com` and root-relative links under `/journal`), then `scripts/journal-base/verify-dist.mjs`.
- `verify-dist.mjs` fails on: any `blog.koursea.com` left, a canonical or social meta outside `https://www.koursea.com/journal/`, a local link outside `/journal/`, or a link that does not resolve to a built file.
- The normal build (`pnpm build`) is unchanged: its output differs from before only in the order of a stylesheet `<link>` against inline `<style>` on five pages (no URL or content change).

## Not done yet (separate steps, one change at a time)
1. Serve `dist-journal` under `/journal/` on www.koursea.com (rewrite or copy at deploy).
2. Per-post 301 redirects from `blog.koursea.com/<path>` to `www.koursea.com/journal/<path>`; keep them for at least a year. Keep the `blog.koursea.com` domain and this repository.
3. Move the blog's sitemap into the main site's sitemap index, update Search Console and analytics.
4. Posts whose content overlaps main-site guides: see the owner's sheet tab "블로그 이전 대조(검토 23건)" (canonical or merge decisions).
