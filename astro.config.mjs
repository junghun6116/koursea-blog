import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkStripDistributionSnippets from './scripts/remark-strip-distribution-snippets.mjs';

export default defineConfig({
  site: 'https://blog.koursea.com',
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/p/pseo-template-preview/') })],
  markdown: { remarkPlugins: [remarkStripDistributionSnippets] },
  trailingSlash: 'always'
});
