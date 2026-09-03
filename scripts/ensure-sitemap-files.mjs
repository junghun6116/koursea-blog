import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDirectory = join(process.cwd(), 'dist');
const sitemapIndex = join(distDirectory, 'sitemap-index.xml');
const sitemapChunk = join(distDirectory, 'sitemap-0.xml');
const sitemapAlias = join(distDirectory, 'sitemap.xml');

if (!existsSync(sitemapChunk)) {
  throw new Error('Astro sitemap output is missing: dist/sitemap-0.xml');
}

if (!existsSync(sitemapIndex)) {
  writeFileSync(
    sitemapIndex,
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      '<sitemap><loc>https://blog.koursea.com/sitemap-0.xml</loc></sitemap>' +
      '</sitemapindex>\n',
    'utf8'
  );
}

const indexContents = readFileSync(sitemapIndex, 'utf8');
if (!indexContents.includes('https://blog.koursea.com/sitemap-0.xml')) {
  throw new Error('Sitemap index does not reference the expected blog sitemap chunk.');
}

copyFileSync(sitemapIndex, sitemapAlias);
console.log('Verified sitemap-index.xml and generated sitemap.xml root alias.');
