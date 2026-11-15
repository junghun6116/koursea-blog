import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkStripDistributionSnippets from './scripts/remark-strip-distribution-snippets.mjs';

// JOURNAL_BASE=1 builds the same site for www.koursea.com/journal/ (see docs/journal-base.md).
const journal = process.env.JOURNAL_BASE === '1';

export default defineConfig({
  site: journal ? 'https://www.koursea.com' : 'https://blog.koursea.com',
  ...(journal ? { base: '/journal' } : {}),
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/p/pseo-template-preview/') })],
  markdown: {
    processor: unified({ remarkPlugins: [remarkStripDistributionSnippets] })
  },
  trailingSlash: 'always'
});
