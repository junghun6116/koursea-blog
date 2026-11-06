---
name: koursea-blog-verify
description: Verify a koursea-blog change and recover from a failed build or check - which commands to run, what each proves, and how to report unit/build results separately from merge and deployment. Use when asked to test or review a blog change, explain why pnpm build or a verifier failed, fix a SEO, robots, cover or social-image check, or confirm what is actually live. Not for the main site CI.
---

# Koursea blog verify and recover

Conventions shared with the other Koursea repositories: "Project skills and shared conventions" in `CLAUDE.md`. Repo decisions: `docs/decision-log.md`.

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
3. Fix the post, template or generator. Do not edit a verifier or the cover policy to make a post pass; if a check is wrong, change it separately and say why.
4. Rerun the failing command, then `pnpm build`.
5. Repeated cause: add it to `docs/decision-log.md`.

## Specific checks

- `public/robots.txt` and `verify-seo.mjs` are tied: the robots file blocks model-training crawlers and the verifier asserts it. Change both together and only on the user's instruction.
- Editorial goals (how many posts, topics) are not technical errors; report them separately.
