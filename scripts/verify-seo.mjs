import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');
const sitemapPath = join(distDir, 'sitemap-0.xml');
const robotsPath = join(distDir, 'robots.txt');
const errors = [];

const fail = (message) => errors.push(message);

function filesBelow(directory, extension) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory()
      ? filesBelow(path, extension)
      : path.endsWith(extension)
        ? [path]
        : [];
  });
}

function routeFor(file) {
  return `/${relative(distDir, file).split(sep).join('/')}`
    .replace(/\/index\.html$/, '/')
    .replace(/\.html$/, '');
}

function jsonLdNodes(value) {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap(jsonLdNodes);
  return [value, ...jsonLdNodes(value['@graph'])];
}

if (!existsSync(distDir)) fail('dist/ is missing. Run the production build first.');

const htmlFiles = filesBelow(distDir, '.html');
if (htmlFiles.length === 0) fail('No generated HTML files were found in dist/.');

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const route = routeFor(file);
  // Search Console verification tokens must retain Google's exact plain-text payload.
  if (/^\/google[a-z0-9]+$/i.test(route)) continue;
  const canonicalLinks = [...html.matchAll(/<link\b[^>]*>/gi)].filter((match) =>
    /\brel=["'][^"']*\bcanonical\b[^"']*["']/i.test(match[0]),
  );

  if (canonicalLinks.length !== 1) {
    fail(`${route}: expected exactly one canonical link, found ${canonicalLinks.length}.`);
  } else {
    const href = canonicalLinks[0][0].match(/\bhref=["']([^"']+)["']/i)?.[1]?.trim();
    try {
      const canonical = new URL(href);
      if (canonical.protocol !== 'https:' || canonical.hostname !== 'blog.koursea.com') {
        fail(`${route}: canonical must use https://blog.koursea.com (found ${href}).`);
      }
    } catch {
      fail(`${route}: canonical URL is missing or invalid (${href ?? 'empty'}).`);
    }
  }

  if (/^\/beauty\/[^/]+\/$/.test(route)) {
    const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    let hasMedicalWebPage = false;
    for (const [, rawJson] of scripts) {
      try {
        hasMedicalWebPage ||= jsonLdNodes(JSON.parse(rawJson)).some((node) => {
          const type = node?.['@type'];
          return type === 'MedicalWebPage' || (Array.isArray(type) && type.includes('MedicalWebPage'));
        });
      } catch (error) {
        fail(`${route}: invalid JSON-LD (${error.message}).`);
      }
    }
    if (!hasMedicalWebPage) fail(`${route}: MedicalWebPage JSON-LD is missing.`);
  }
}

if (!existsSync(sitemapPath)) {
  fail('dist/sitemap-0.xml is missing.');
} else {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const urlBlocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/gi)];
  if (urlBlocks.length === 0) fail('sitemap-0.xml contains no <url> entries.');
  if (/<lastmod>\s*<\/lastmod>/i.test(sitemap)) fail('sitemap-0.xml contains an empty <lastmod> tag.');

  for (const [index, match] of urlBlocks.entries()) {
    const block = match[1];
    const loc = block.match(/<loc>([^<]+)<\/loc>/i)?.[1]?.trim();
    if (!loc) fail(`sitemap URL entry ${index + 1}: missing or empty <loc>.`);
    const lastmods = [...block.matchAll(/<lastmod>([^<]*)<\/lastmod>/gi)];
    for (const [, value] of lastmods) {
      const timestamp = value.trim();
      if (!timestamp || Number.isNaN(Date.parse(timestamp))) {
        fail(`${loc ?? `sitemap entry ${index + 1}`}: invalid <lastmod> value "${timestamp}".`);
      }
    }
  }
}

if (!existsSync(robotsPath)) {
  fail('dist/robots.txt is missing.');
} else {
  const robots = readFileSync(robotsPath, 'utf8');
  for (const bot of ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'ChatGPT-User', 'Google-Extended']) {
    const block = robots.match(new RegExp(`User-agent:\\s*${bot}\\s*([\\s\\S]*?)(?=\\n\\s*User-agent:|$)`, 'i'))?.[1] ?? '';
    if (!/^\s*Allow:\s*\/\s*$/im.test(block)) fail(`robots.txt: ${bot} does not have an explicit "Allow: /" rule.`);
  }
}

if (errors.length > 0) {
  console.error(`SEO verification failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const beautyCount = htmlFiles.filter((file) => /^\/beauty\/[^/]+\/$/.test(routeFor(file))).length;
console.log(`SEO verification passed: ${htmlFiles.length} HTML files, ${beautyCount} Beauty schemas, valid sitemap lastmod values, and AI crawler rules.`);
