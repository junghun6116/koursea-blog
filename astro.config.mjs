import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://blog.koursea.com',
  output: 'static',
  integrations: [sitemap()],
  trailingSlash: 'always'
});
