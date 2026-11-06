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
`coverImage`, `coverImageAlt`, `coverImageCredit`, and `coverImageSourceUrl`
(or the documented omission described below).
Use a real, topic-matched photograph that can be reused: Koursea-owned media,
an official asset with explicit permission, a compatible KOGL asset from
TourAPI, or a Wikimedia Commons file with a compatible license. Do not copy or
rehost search-result images, news-site images, or social-media images.

The cover image is not a social-only decoration. `PostLayout.astro` renders it
in the article body with the visible credit, and the same image is used for OG
and social previews. Write specific alt text, keep the credit/license accurate,
and link `coverImageSourceUrl` to the original asset page rather than to a
search result or copied file.

A real, rights-cleared photograph is the first choice. If none is ready, do not
use a lookalike, a search-result image, or a title/logo card as the cover. Two
honest options remain:

- keep the post unpublished until a photograph is ready; or
- publish with a documented cover omission (`coverOmissionReason`, 20+
  characters, and no cover image fields) and a complete text-led layout. A
  diagram, route map, comparison table or step-by-step block made by Koursea
  from sourced facts may carry the page; any outside image in the body needs
  confirmed reuse rights, a visible credit and its original source page.

The generated text OG card is a social-preview fallback only. It is never put
into the article body as if it were the cover. Never fake exterior or interior
photos of a real place. Legacy posts without photographs may keep their existing
text cards until they are individually reviewed. `pnpm check:editorial-covers`
and the build enforce the four cover fields or a documented omission for posts
published on or after October 14, 2026. Where code and this text still differ,
see `docs/cover-policy-alignment.md`.

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

## Project skills and shared conventions

Project skills live in `.claude/skills/` and apply to **this repository only**;
a session opened in another Koursea repository does not see them.
Here: `koursea-blog-posts` (writing and refreshing posts),
`koursea-blog-verify` (build checks and failure recovery), and the existing
`remove-ai-marks`. Invoke with `/<name>`. A skill carries instructions only: it
grants no permission and starts nothing.

Site-wide conventions are kept once, in the main repository:
<https://github.com/junghun6116/koursea/blob/main/docs/koursea-working-agreements.md>.
Say whether you actually opened it in this session. If you could not (the
repository is not attached, the link fails), report "shared conventions not
read" and work from the minimum principles below; do not describe the file's
contents from memory.

### Minimum principles (always apply, even when the shared file is unread)

- No secrets (keys, tokens, cookies, passwords) in files, commits, PRs or reports.
- Stay inside the scope the user approved. A clear request covers the steps
  needed to finish it (checks, commit, updating the PR); do not ask again for the
  same scope and do not require particular words. Ask only for something new: a
  cost, access, production data, an external post, or a product decision.
  Approvals the platform requires (permission prompts, environment or network
  changes, review or branch protection) stay in force.
- Production or database changes, merges, deploys and external posts happen only
  when the user has asked for them.
- Do not weaken or disable a check, or lower a product standard, to pass. When a
  check fails, first decide whether the content, the output, the logic or the
  expectation is wrong; change a check only openly, in its own commit, with the
  reason.
- No invented facts; missing evidence is "not stated".
- Report local check, CI, merge and live status separately.

Repo-specific decisions and state: `docs/decision-log.md`.

Which repository does the work:

| Work | Repository |
| --- | --- |
| English blog posts (this repo), incl. K-pop trip posts | `junghun6116/koursea-blog` (blog.koursea.com) |
| Guides, places, admin, community, event data and the schedule collector | `junghun6116/koursea` (www.koursea.com) |
| Q guides (medical/beauty/culture) | `junghun6116/q-koursea` (q.koursea.com) |

For event schedule re-verification or discovery, work in the main repository
(`/koursea-kpop-ops` there); this repository only holds the posts that use it.

```sh
pnpm check:skills   # offline: frontmatter, links, mentioned commands and paths exist here
```
