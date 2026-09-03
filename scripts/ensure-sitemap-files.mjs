import { copyFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDirectory = join(process.cwd(), 'dist');
const sitemapIndex = join(distDirectory, 'sitemap-index.xml');
const sitemapChunk = join(distDirectory, 'sitemap-0.xml');
const sitemapAlias = join(distDirectory, 'sitemap.xml');
const site = 'https://blog.koursea.com';

const xmlEscape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const normalizeDate = (value, label) => {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) throw new Error(`Invalid sitemap date for ${label}: ${value}`);
  return date.toISOString();
};

function postLastmodEntries() {
  const postsDirectory = join(process.cwd(), 'src/content/posts');
  return readdirSync(postsDirectory)
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const source = readFileSync(join(postsDirectory, filename), 'utf8');
      const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? '';
      const valueFor = (key) => frontmatter.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)`, 'm'))?.[1]?.trim();
      const slug = filename.replace(/\.md$/, '');
      const canonical = valueFor('canonicalUrl') ?? `${site}/posts/${slug}/`;
      const lastmod = valueFor('updatedDate') ?? valueFor('pubDate');
      if (!lastmod) throw new Error(`Missing pubDate for sitemap entry: ${filename}`);
      return [canonical, normalizeDate(lastmod, filename)];
    });
}

function programmaticLastmodEntries() {
  const verifiedDates = JSON.parse(readFileSync(join(process.cwd(), 'src/data/pseo-verified-dates.json'), 'utf8'));
  const collections = [
    ['beauty', 'beauty-pseo-pages.json'],
    ['itinerary', 'itinerary-pseo-pages.json']
  ];
  return collections.flatMap(([route, filename]) => {
    const pages = JSON.parse(readFileSync(join(process.cwd(), 'src/data', filename), 'utf8'));
    return pages.map((page) => {
      const dateValue = verifiedDates.pages?.[page.slug] ?? verifiedDates[route];
      const verifiedDate = normalizeDate(dateValue, `${route}/${page.slug} verified date`);
      return [`${site}/${route}/${page.slug}/`, verifiedDate];
    });
  });
}

function applyLastmod(xml, dates) {
  return xml.replace(/<url>([\s\S]*?)<\/url>/g, (urlBlock) => {
    const encodedLocation = urlBlock.match(/<loc>(.*?)<\/loc>/)?.[1];
    if (!encodedLocation) return urlBlock;
    const location = encodedLocation.replaceAll('&amp;', '&');
    const lastmod = dates.get(location);
    if (!lastmod) return urlBlock;
    const lastmodNode = `<lastmod>${xmlEscape(lastmod)}</lastmod>`;
    return /<lastmod>.*?<\/lastmod>/.test(urlBlock)
      ? urlBlock.replace(/<lastmod>.*?<\/lastmod>/, lastmodNode)
      : urlBlock.replace('</url>', `${lastmodNode}</url>`);
  });
}

if (!existsSync(sitemapChunk)) {
  throw new Error('Astro sitemap output is missing: dist/sitemap-0.xml');
}

const lastmodDates = new Map([...postLastmodEntries(), ...programmaticLastmodEntries()]);
const sitemapContents = applyLastmod(readFileSync(sitemapChunk, 'utf8'), lastmodDates);
writeFileSync(sitemapChunk, sitemapContents, 'utf8');

for (const [url, expectedDate] of lastmodDates) {
  const encodedUrl = xmlEscape(url);
  const block = sitemapContents.match(new RegExp(`<url>[\\s\\S]*?<loc>${encodedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/loc>[\\s\\S]*?<\\/url>`))?.[0];
  if (!block?.includes(`<lastmod>${expectedDate}</lastmod>`)) throw new Error(`Missing expected sitemap lastmod for ${url}`);
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
