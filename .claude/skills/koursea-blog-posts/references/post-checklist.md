# Post checklist (koursea-blog)

Frontmatter (see `src/content.config.ts` for the schema):

- `title`, `description`, `pubDate`, `updatedDate`, `tags`, `canonicalUrl` (`https://blog.koursea.com/posts/<slug>/`), `author` (`"Koursea Editorial"`)
- Cover (required on or after 2026-10-14): `coverImage` (starts with `/images/`, file exists under `public/images/`), `coverImageAlt`, `coverImageCredit`, `coverImageSourceUrl` (https original asset page)
- Optional: `faq` (list of `question` / `answer`), `coverOmissionReason` (20+ characters, and then no cover fields may remain)

Body habits seen in existing posts:

- A short opening that states the dates and venue; a table of show details; sections for booking and payment, getting there and back, where to stay, a checklist, and "Sources and Check Dates" with the read date.
- Internal links with `/posts/<slug>/`; hub links to `https://www.koursea.com/kpop.html` and the concert calendar.

Before the build:

1. Overlap grep done; existing post updated instead of duplicated where the intent matches.
2. Every fact traceable to a page you read; read date written in Sources.
3. `/remove-ai-marks` run (or the missing scan stated).
4. `pnpm build` passes (it runs the cover policy, social image coverage, SEO, contextual-recommendation and K-pop handoff checks).

Known trap: `scripts/verify-contextual-recommendations.mjs` asserts what the K-pop ticketing post recommends. New posts whose title or tags use the ticket, concert or venue words that post is ranked on can displace its expected links. If that check fails after adding a post, change the new post's title/tags wording; do not loosen the check. (Observed 2026-11-05, recorded in `docs/decision-log.md`.)
