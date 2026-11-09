# Koursea Blog decision and state log

Repo-specific. Site-wide principles are not repeated here; the minimum principles are in `CLAUDE.md`. Newest first.

## Follow-ups (recorded 2026-11-06, intentionally not part of the skills PR)

Not done here and not conditions for merging the skills PRs. Each needs its own change:

1. ~~**Main-repo approval wording.**~~ Already done in the main repository (its working agreements now say a clear approval covers its whole scope and no phrase or PR number is required; checked 2026-11-09). the working-agreements file in the main repository (junghun6116/koursea, docs folder) still says actions need "that exact action" and that a merge request names the PR. Reword it to match the minimum principles in this repo's `CLAUDE.md` (a clear request covers its scope; no required phrases; platform approvals stay). Work in the main repository.
2. ~~**Stale cover-omission test.**~~ Done 2026-11-09 (fixture test, runs in `prebuild`). Rewrite `scripts/test-event-cover-omission.mjs` against a fixture post, or delete it; decide whether `pnpm build` should run it (`docs/cover-policy-alignment.md`, item 3).
3. ~~**Cover-policy check message.**~~ Done 2026-11-09 (offers both options). `scripts/check-editorial-cover-policy.mjs` should offer both options (photo, or documented omission) instead of only "keep the post off main" (`docs/cover-policy-alignment.md`, item 2).

Also open in `docs/cover-policy-alignment.md`: a field/check for alternative body visuals, the home featured slot, and a reader-facing note for posts without a photograph.

## 2026-11-06 — Cover and no-photo direction (owner decision)

- A real photograph comes first. Without one, a documented cover omission with a complete text-led layout, or an evidence-based visual made from sourced facts, is allowed. The OG card is a social preview and is never inserted into the body. No fake place photos.
- `CLAUDE.md` was the only layer that said "keep off `main`" without exception; it now matches the schema, layout and cover-policy check. Remaining code differences and the not-done implementation scope: `docs/cover-policy-alignment.md`.
- Correction: an earlier version of this log said one live post uses `coverOmissionReason`. That was wrong. No post uses it now (the KGMA/MMA guide gained a Commons cover in PR #131), and `scripts/test-event-cover-omission.mjs` is stale because of that.

## 2026-11-06 — Skills installed for this repository

- Project skills apply per repository. This repo has `koursea-blog-posts` and `koursea-blog-verify` (plus the existing `remove-ai-marks`). The collector, admin and community tooling are in the koursea repository and are not available here.

## 2026-11-05 — Related-recommendation check failed on new K-pop posts

- New K-pop event posts whose titles and tags used ticket/concert wording (for example a `concert-tickets` tag) failed `verify-contextual-recommendations`. The fix at the time was to reword those titles and tags; the check was not changed.
- What was not recorded: whether the wording was misleading (content), the resulting list was poor (output), the scoring over-rewarded those words (logic), or the pinned expectation was stale. Treat the reword as unexplained, not as proof the posts were wrong. Next time follow "When a recommendation or SEO check fails" in `koursea-blog-verify`.
- Suspected, not verified: the K-pop scoring gives a fixed bonus to candidate titles with ticket/venue/concert words, which new event posts match.

## 2026-11-05 — Robots policy (PR #153)

- `public/robots.txt` blocks model-training crawlers while leaving search and AI retrieval crawlers allowed; `scripts/verify-seo.mjs` asserts it.
