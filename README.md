# Koursea Blog

Independent Astro static blog for English-language Korea travel guides.

## Local development

```sh
pnpm install
pnpm dev
```

## Production build

```sh
pnpm build
```

The static site is generated in `dist/`. The canonical production origin is
`https://blog.koursea.com`, and `@astrojs/sitemap` generates sitemap files
during the production build.

## AI mark hygiene

Every post in `src/content/posts/` is run through the `/remove-ai-marks` skill
(`.claude/skills/remove-ai-marks/`) before it is committed. The skill and the
`scripts/remove-ai-marks.mjs` helper are thin clients for the
[watermarks-remover](https://github.com/guillaumemeyer/watermarks-remover)
HTTP service, which must be running first:

```sh
# in a watermarks-remover checkout
python3 service/scripts/server.py --host 127.0.0.1 --port 8765
```

Then:

```sh
pnpm check:ai-marks   # report on every post; exits 1 if any marks remain
pnpm clean:ai-marks   # strip invisible Unicode and metadata in place
```

Set `WATERMARKS_SERVICE_URL` to point at a different instance, and
`WATERMARKS_SERVICE_API_KEY` if it requires a bearer token.
