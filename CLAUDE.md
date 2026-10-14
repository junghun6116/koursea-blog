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

## Daily editorial runbook

When asked to run the daily editorial routine, handle **at most one** focused
content opportunity for the current Korea date. This is a quality ceiling, not
a publishing quota. The valid outcomes are:

1. Draft one new post when a distinct search intent and enough primary evidence
   exist.
2. Update one existing post when it already owns the intent.
3. Skip the day and report why when neither option clears the quality gates.

### 1. Start safely

- Fetch `origin/main` and work from its latest commit.
- Never edit, commit, or push directly on `main`.
- Never reuse a branch from an older daily run.
- Use `draft/blog-YYYY-MM-DD-<topic-slug>` for a new branch.
- If the checkout contains unrelated changes, do not overwrite, stash, or
  absorb them. Stop and use a clean worktree or fresh clone.
- Do not read, print, stage, or commit `.env*`, API keys, credentials, private
  source material, or personal data.

### 2. Choose the opportunity

Inventory `src/content/posts/` before researching. Search by the artist, event,
series, agency, venue, neighborhood, and primary travel problem. Prefer a topic
that turns entertainment interest into an action a visitor can take:

- venue arrival and late return;
- where to stay near the event or filming area;
- a fan landmark or filming-location route;
- foreigner booking or payment steps;
- nearby food, shopping, or a one-day/overnight itinerary.

Do not publish a celebrity-news recap, rumor, unconfirmed schedule, private
location, stalking route, or a rewritten version of another article. If an
existing Koursea post satisfies the same search intent, update it instead. If a
new official announcement only changes a date, venue, rule, or booking detail,
prefer a sourced update over a new URL.

### 3. Pass the evidence gate

Before drafting, collect at least two relevant primary or official sources when
the topic reasonably permits it. Suitable sources include an agency or artist
notice, venue, official ticket seller, transport operator, local government, or
tourism board. One source may be sufficient only for a fact controlled solely
by that source; identify that limitation in the PR.

- Open each source and verify that it supports the exact claim being made.
- Record the source URL, publisher, and checked date in the post or PR notes.
- Separate confirmed facts from editorial route suggestions.
- Give dates with a year and timezone where timing matters.
- Do not infer prices, sale times, transport service, entry rules, or availability.
- Mark change-sensitive details clearly and tell readers where to recheck them.

### 4. Draft for a fan journey

Keep the post useful after the news cycle. New entertainment posts must retain
the travel-action requirement above and should normally include:

- a concise answer near the top;
- the confirmed event/place facts and reviewed date;
- an actionable route, lodging-area comparison, or visit sequence;
- late-return or booking fallback where relevant;
- links to two to four relevant Koursea main-site places or practical guides;
- descriptive title, description, tags, canonical URL, author, and dates that
  follow the frontmatter conventions of existing posts.

Do not invent testimonials, first-person experience, social proof, or images.
Use only Koursea-owned media, clearly reusable licensed media with attribution,
or a normal embed of a relevant official public post. Never copy or rehost an
image from search results, news sites, fan accounts, Instagram, Threads, or X.

### 5. Review before committing

Review the rendered article as an editor, not merely as its author. Confirm:

- the title and intent are not cannibalizing an existing Koursea URL;
- every time-sensitive claim has a primary source and checked date;
- internal and external links resolve to the intended destination;
- the article still answers a travel decision rather than becoming fan news;
- mobile headings, tables, images, captions, and long links do not overflow;
- image rights, alt text, attribution, and social preview are valid;
- no unsupported medical, legal, safety, price, or schedule claim was added.

Run the required AI-mark process for every changed post, then run:

```sh
node scripts/remove-ai-marks.mjs src/content/posts/<slug>.md --write
pnpm check:ai-marks
pnpm build
pnpm audit:seo
git diff --check
```

If the watermark service, dependencies, build, or a required source is
unavailable, do not bypass the gate. Leave the work uncommitted and report the
blocker; never open a PR or present the draft as publish-ready.

### 6. Commit and hand off

- Stage only the post and directly related assets by explicit path. Never use
  `git add .` or `git add -A` for a daily editorial run.
- Use a focused message such as `draft(blog): add <topic> fan travel guide` or
  `content(blog): refresh <topic> travel details`.
- Push only the daily branch and open a **Draft PR** against `main`.
- Do not mark the PR ready, merge it, or deploy it. Codex performs the separate
  source, duplication, rights, rendering, metadata, and CI review.

The final handoff must list the selected outcome (new/update/skip), branch,
commit SHA, Draft PR URL, changed files, primary sources, duplicate-intent check,
travel actions covered, commands run, and any unresolved risk. Do not claim a
check passed unless its command actually completed successfully.

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
