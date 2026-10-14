# Koursea Blog — working notes

Astro static blog for English-language Korea travel guides.
Production origin: `https://blog.koursea.com`.

## Posts

Content lives in `src/content/posts/*.md`, one file per post, with frontmatter
keys `title`, `description`, `pubDate`, `updatedDate`, `tags`, `canonicalUrl`,
`author`.

## Entertainment content — travel-action requirement

New content prioritizes Korean entertainment (K-pop, concerts, dramas, actors,
variety shows) framed as travel behavior, not celebrity news summaries. Every
new entertainment post must cover **at least 2** of:

- Venue, filming location, or fan landmark
- A neighborhood/area good for staying nearby
- Transit, last train, or how to get back late
- Nearby restaurants, cafés, or shopping
- Booking/payment steps a foreign visitor actually needs
- A one-day or overnight itinerary

Before writing a new entertainment post, check for search-intent overlap with
existing posts in `src/content/posts/` (grep by artist, agency, or venue name).
If an existing post already covers the same intent, update that post instead
of creating a new one.

Use official/primary sources for schedules, venues, agencies, and tourism-board
info — ticketing platforms, agency notices, venue or tourism-board sites — not
aggregator/travel-blog roundups. Link to related Koursea place pages
(koursea.com) and existing practical guides as internal links.

## Visual publishing requirement

Every newly published editorial post must include all four cover fields:
`coverImage`, `coverImageAlt`, `coverImageCredit`, and `coverImageSourceUrl`.
Use a real, topic-matched photograph that can be reused: Koursea-owned media,
an official asset with explicit permission, a compatible KOGL asset from
TourAPI, or a Wikimedia Commons file with a compatible license. Do not copy or
rehost search-result images, news-site images, or social-media images.

The cover image is not a social-only decoration. `PostLayout.astro` renders it
in the article body with the visible credit, and the same image is used for OG
and social previews. Write specific alt text, keep the credit/license accurate,
and link `coverImageSourceUrl` to the original asset page rather than to a
search result or copied file.

If an accurate, rights-cleared photograph is not ready, keep the post off
`main`. Do not publish a new post with only the generated text OG card. Legacy
posts without photographs may keep their existing text cards until they are
individually reviewed. `pnpm check:editorial-covers` and the build enforce this
rule for posts published on or after October 14, 2026.

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
