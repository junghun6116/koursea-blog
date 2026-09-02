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
