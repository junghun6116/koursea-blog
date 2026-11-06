---
name: koursea-blog-posts
description: Write, update or retire posts in the koursea-blog Astro repository (src/content/posts) - especially Korean entertainment and K-pop trip guides, including checking overlap with existing posts, sourcing event facts, cover photo fields, internal links and AI-mark cleaning. Use when asked to write a blog post, refresh a post's facts, add a cover photo, or fix a post that fails the blog build checks. Not for the main site's guides or the event collector (those live in the koursea repo).
---

# Koursea blog posts

This repo's rules are in `CLAUDE.md` (travel-action requirement, source rules, cover photo rules, AI-mark hygiene, and the minimum principles). Do not restate them here; follow them. If you did not open the shared conventions file linked there, say "shared conventions not read" and work from the minimum principles. Repo-specific decisions and state: `docs/decision-log.md`; where the cover policy and the code differ: `docs/cover-policy-alignment.md`.

## Procedure

1. **Check overlap first.** `grep -ril` the artist, agency and venue names in `src/content/posts/`. If a post already serves the same search intent, update it (set `updatedDate`) instead of adding a new one.
2. **Confirm the facts from primary pages.** Read the official page body (ticket seller, agency notice, venue or tourism board) and note the read date in the post's sources. For a search-result summary or news article, treat it as a lead only. Event dates, venue, price, sale status and ID rules are separate facts; state only what the page says and say when a fact is not stated.
   Tooling to re-verify registered events (collector, source registry, home events) lives in the **koursea** repository (`/koursea-kpop-ops` there). It does not exist in this repository; do not look for it here. If that repository is not attached, read the page directly.
3. **Write for the reader's trip.** Each entertainment post covers at least two of the travel actions listed in `CLAUDE.md`. Link related posts as `/posts/<slug>/` and Koursea place or hub pages on `https://www.koursea.com/`.
4. **Frontmatter.** The schema is `src/content.config.ts`; the required keys are listed in `CLAUDE.md`, and `faq` is used by most posts. Match an existing post's quoting and date style. See `references/post-checklist.md`.
5. **Cover photo.** Prefer a real, rights-cleared photograph: all four cover fields are required for posts published on or after 2026-10-14 (`scripts/check-editorial-cover-policy.mjs`). Put the file under `public/images/` with real alt text, accurate credit and the original asset page. If none is ready, either hold the post, or publish with a documented `coverOmissionReason` and a complete text-led layout (a Koursea-made diagram, route map, comparison table or procedure built from sourced facts is fine). The generated OG card is for social previews only; never place it in the body. Details and the remaining code differences: `docs/cover-policy-alignment.md`.
6. **Clean AI marks.** Run every new or edited post through `/remove-ai-marks`. With the watermarks-remover service running: `node scripts/remove-ai-marks.mjs src/content/posts/<slug>.md --write`, then `pnpm check:ai-marks`. If the service is not running, say the scan did not happen.
7. **Build and verify.** Run the checks in `/koursea-blog-verify`. A post is not done until `pnpm build` passes.

## Do not

- Invent venue photos, dates, prices or sale status. Missing evidence is "not stated on the page".
- Copy search-result, news or social images, or use a title/logo card as the cover.
- Write travel claims (last train times, walking routes) that no official source gave; say "check in a map app" instead.
- Publish, post to social media or merge unless the user has asked for it. A clear request covers the work needed to finish it; do not ask again, and do not require particular words.
