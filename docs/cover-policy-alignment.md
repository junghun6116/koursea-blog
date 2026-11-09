# Cover and no-photo policy: where the layers agree and differ

Checked 2026-11-06 against this repository. Direction set by the owner: a real photograph first; when none is available, an evidence-based alternative visual or a complete text-led layout is allowed; the generated OG card is never forced into the article body. No post or public page was changed to produce this note.

| Layer | What it does today | Matches the direction? |
| --- | --- | --- |
| `CLAUDE.md` | Updated in this PR: photo first, documented omission or unpublished otherwise, OG card is social-only, no fake photos | Yes (was the only layer that said "keep off main" without exception) |
| `src/content.config.ts` | After 2026-10-14: four cover fields, or `coverOmissionReason` (20+ characters) with no cover/thumbnail fields | Yes |
| `src/layouts/PostLayout.astro` | Renders the cover figure with credit only when `coverImage` exists; with an omission it renders no figure | Yes (OG card is not inserted in the body) |
| `src/pages/posts/[...slug].astro`, `Layout.astro` | Social image = cover, else thumbnail, else the generated `/og/posts/<id>.png` (meta tags only) | Yes |
| `scripts/generate-post-og-images.mjs`, `check-social-image-coverage.mjs` | Generates text OG cards for posts without a cover; fails if a licensed cover and a stale card coexist | Yes |
| `scripts/check-editorial-cover-policy.mjs` | Accepts the four fields or an omission reason; since 2026-11-09 its failure text offers both fixes (photograph, or documented omission) | Yes |
| `scripts/test-event-cover-omission.mjs` | Since 2026-11-09: writes fixture posts to a temporary folder and runs the cover check on them (valid omission, leftover image fields, short reason, bare post, pre-policy post). Runs in `prebuild` | Yes |
| Live posts | No post currently uses `coverOmissionReason` | n/a |

## What is not supported by code (implementation scope, not done here)

1. **Alternative visuals are not a first-class thing.** A diagram, route map or table can be written in the post body, but nothing records its basis or checks it. If wanted: an optional frontmatter field (for example `bodyVisualBasis`) naming the sources the visual is built from, validated in `src/content.config.ts` and reported by `check-editorial-cover-policy.mjs`. Needs an owner decision on the field.
2. ~~**Check message**~~ Done 2026-11-09: the failure text offers both options.
3. ~~**Stale test**~~ Done 2026-11-09: rewritten against fixture posts and added to `prebuild` (offline, no build output needed). It tests the check script only; the schema in `src/content.config.ts` is still covered by `astro check`.
4. **Home featured slot** (`src/components/BlogHome.astro`) hard-codes the KGMA/MMA post as the featured item and falls back to the first post with a cover. An omission post would never be featured by the fallback. Decide whether that is intended.
5. **Reader-facing note.** An omission post shows no explanation. Whether to show "no photograph available" is a presentation decision for the layout owner; none was made here.
