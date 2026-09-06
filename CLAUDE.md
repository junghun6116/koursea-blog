# Koursea Blog — working notes

Astro static blog for English-language Korea travel guides.
Production origin: `https://blog.koursea.com`.

## Posts

Content lives in `src/content/posts/*.md`, one file per post, with frontmatter
keys `title`, `description`, `pubDate`, `updatedDate`, `tags`, `canonicalUrl`,
`author`.

## AI mark hygiene — required for every post

**Every new or edited file under `src/content/posts/` goes through
`/remove-ai-marks` before it is committed.** No exceptions: invisible Unicode
and provenance metadata survive copy-paste, and a published post is the one
place they are hardest to take back.

The skill lives in `.claude/skills/remove-ai-marks/` and is a thin client for
the watermarks-remover HTTP service — it never cleans locally.

Start the service first (it is not part of this repo):

```sh
# in a watermarks-remover checkout
python3 service/scripts/server.py --host 127.0.0.1 --port 8765
# or: docker compose up -d
```

Point `WATERMARKS_SERVICE_URL` elsewhere if it is not on the default
`http://127.0.0.1:8765`, and set `WATERMARKS_SERVICE_API_KEY` if the service
requires a bearer token.

Then, for the deterministic pass (invisible Unicode + metadata):

```sh
pnpm check:ai-marks    # report on all posts; exits 1 if anything is marked
pnpm clean:ai-marks    # clean all posts in place
node scripts/remove-ai-marks.mjs src/content/posts/<slug>.md --write
```

`scripts/remove-ai-marks.mjs` only covers what is deterministic. The Layer B
statistical rewrite needs judgment about the prose, so run the
`/remove-ai-marks` skill for that rather than scripting it.

`.github/workflows/ai-marks-check.yml` runs the same dry-run check in CI on
any PR touching `src/content/posts/`: it clones watermarks-remover, starts
the service, and runs `pnpm check:ai-marks` (or the equivalent `node`
invocation) — it does not need the service running anywhere else.

## Build

`pnpm build` runs `astro check` then the Astro build; `prebuild` regenerates
the llms files and OG images, `postbuild` writes sitemap files, distribution
snippets, and runs the SEO verifier. Static output lands in `dist/`.
