# Koursea Blog decision and state log

Repo-specific. Site-wide principles are not repeated here; see "Project skills and shared conventions" in `CLAUDE.md`. Newest first.

## 2026-11-06 — Skills installed for this repository

- Project skills apply per repository. This repo has `koursea-blog-posts` and `koursea-blog-verify` (plus the existing `remove-ai-marks`). The collector, admin and community tooling are in the koursea repository and are not available here.

## 2026-11-05 — Related-recommendation verifier vs new K-pop posts

- New K-pop event posts whose titles and tags used ticket/concert wording (for example a `concert-tickets` tag) failed `verify-contextual-recommendations`, which asserts what the K-pop ticketing post recommends. The fix was to reword the new posts' titles and tags. The verifier was not changed.

## 2026-11-05 — Robots policy (PR #153)

- `public/robots.txt` blocks model-training crawlers while leaving search and AI retrieval crawlers allowed; `scripts/verify-seo.mjs` asserts it.

## Open conflict (decide before relying on it)

- `CLAUDE.md` says a new post without a rights-cleared photograph stays off `main`, but `src/content.config.ts` and `scripts/check-editorial-cover-policy.mjs` accept a documented `coverOmissionReason` (one post, `kgma-mma-2026-gocheok-sky-dome-seoul-trip-guide`, uses it). Until the owner decides, follow `CLAUDE.md`.
