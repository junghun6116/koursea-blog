# Koursea Blog decision and state log

Repo-specific. Site-wide principles are not repeated here; the minimum principles are in `CLAUDE.md`. Newest first.

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
