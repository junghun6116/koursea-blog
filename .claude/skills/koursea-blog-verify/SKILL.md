---
name: koursea-blog-verify
description: Verify a koursea-blog change and recover from a failed build or check - which commands to run, what each proves, and how to report unit/build results separately from merge and deployment. Use when asked to test or review a blog change, explain why pnpm build or a verifier failed, fix a SEO, robots, cover or social-image check, or confirm what is actually live. Not for the main site CI.
---

# Koursea blog verify and recover

Minimum principles and the repo map: "Project skills and shared conventions" in `CLAUDE.md` (say "shared conventions not read" if you did not open the linked file). Repo decisions: `docs/decision-log.md`.

## Commands (all from `package.json` and `scripts/`)

```sh
pnpm install --frozen-lockfile     # as CI does (.github/workflows/build.yml)
pnpm build                         # astro check, prebuild checks, astro build, postbuild checks
pnpm check:editorial-covers        # cover fields for posts on or after 2026-10-14
pnpm check:social-images
pnpm verify:seo                    # needs dist/ from a build
pnpm verify:kpop-handoff
pnpm audit:seo
pnpm check:ai-marks                # needs the watermarks-remover service running
node scripts/verify-contextual-recommendations.mjs   # needs dist/
node scripts/test-event-cover-omission.mjs           # needs dist/; not part of pnpm build
```

What `pnpm build` runs in order: `prebuild` (cover policy, llms files, post OG images, social image coverage), `astro check && astro build`, `postbuild` (sitemap files, distribution snippets, `verify-seo`, `verify-contextual-recommendations`, `verify-kpop-handoff`). CI runs `pnpm build` on pull requests and pushes to `main` (`build.yml`) and the AI-marks check on pull requests that touch posts (`ai-marks-check.yml`, it clones watermarks-remover itself).

## Keep claims apart

| Claim | Evidence |
| --- | --- |
| Check passed locally | the command and its output |
| Build passed in CI | the check run for the PR head commit |
| Merged | the merge result |
| Live | the Vercel deployment status for the merge commit, or a request to the public URL (`vercel.json` is present; do not infer deployment from CI) |

A content change that is not rebuilt is not verified. `dist/` is ignored by git, so a stale `dist/` can make `verify:*` pass or fail wrongly; rebuild first.

## Recovering a failure

1. Read the first real error, not the last line. Reproduce with the same command.
2. Classify: schema or frontmatter (`src/content.config.ts`), cover policy, generated file, recommendation or SEO assertion, environment (service not running, missing key), or a transient fetch.
3. Decide what is wrong before changing anything (see "When a recommendation or SEO check fails"). Fix the post, template or generator when that is the cause. Never loosen a check just to turn it green; if the check or its expectation is the faulty part, change it in its own commit and say why.
4. Rerun the failing command, then `pnpm build`.
5. Repeated cause: add it to `docs/decision-log.md`.

## When a recommendation or SEO check fails

Work out which of four things is wrong, in this order, and write down the answer:

1. **Content.** Do the post's title, tags and description describe what the post really says? If a word is misleading, fix it for accuracy. Do not drop an accurate term only to change a score.
2. **Output.** Is the result bad for a reader? Read the rendered list or tag (`dist/posts/<slug>/index.html`, the `related-pseo` aside). For related posts, the list comes from `src/pages/posts/[...slug].astro`: curated entries in `src/data/post-related-pseo.json`, otherwise a score from shared tags and title words, and for K-pop posts a bonus for candidate titles with ticket, venue or concert words, newest first on ties.
3. **Logic.** Does the scoring rule rank for the wrong reason (for example a generic word in an event title earning the same bonus as a practical guide)? Then the rule is the defect.
4. **Expectation.** Does the check pin slugs or counts that a newer, equally relevant guide now legitimately displaces? Then the expectation is stale.

Only after that choose the fix: metadata accuracy (1), a curated entry or the scoring (2, 3), or the expectation with a stated reason (4). Whichever you change, say which of the four it was.

## Specific checks

- `public/robots.txt` and `verify-seo.mjs` are tied: the robots file blocks model-training crawlers and the verifier asserts it. Change both together and only on the user's instruction.
- Editorial goals (how many posts, topics) are not technical errors; report them separately.
