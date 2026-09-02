import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const site = 'https://blog.koursea.com';
const errors = [];
const warnings = [];
const vercelConfig = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
const redirectPaths = new Set(
  (vercelConfig.routes ?? [])
    .filter((route) => route.status >= 300 && route.status < 400 && typeof route.src === 'string' && !route.src.includes('\\'))
    .map((route) => route.src)
);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function pageUrl(file) {
  const path = relative(dist, file).split(sep).join('/');
  if (path === 'index.html') return `${site}/`;
  if (path.endsWith('/index.html')) return `${site}/${path.slice(0, -'index.html'.length)}`;
  return `${site}/${path}`;
}

function attrs(tag) {
  return Object.fromEntries([...tag.matchAll(/([:\w-]+)=["']([^"']*)["']/g)].map((match) => [match[1], match[2]]));
}

function localTarget(url) {
  const pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') return join(dist, 'index.html');
  if (pathname.endsWith('/')) return join(dist, pathname.slice(1), 'index.html');
  if (pathname.endsWith('.html') || pathname.includes('.')) return join(dist, pathname.slice(1));
  return join(dist, pathname.slice(1), 'index.html');
}

if (!existsSync(dist)) throw new Error('dist/ does not exist. Run astro build first.');
const htmlFiles = walk(dist).filter((file) => file.endsWith('.html'));

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const url = pageUrl(file);
  const label = relative(dist, file);
  const tags = [...html.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map((match) => ({ raw: match[0], ...attrs(match[0]) }));
  const canonicals = tags.filter((tag) => tag.rel === 'canonical');
  if (canonicals.length !== 1) errors.push(`${label}: expected 1 canonical, found ${canonicals.length}`);
  else if (canonicals[0].href !== url) errors.push(`${label}: canonical ${canonicals[0].href} does not match ${url}`);

  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map((match) => match[1].trim());
  if (titles.length !== 1 || !titles[0]) errors.push(`${label}: missing or duplicate <title>`);
  const descriptions = tags.filter((tag) => tag.name === 'description' && tag.content?.trim());
  if (descriptions.length !== 1) errors.push(`${label}: expected 1 non-empty meta description, found ${descriptions.length}`);
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) errors.push(`${label}: expected 1 h1, found ${h1Count}`);

  for (const property of ['og:title', 'og:description', 'og:url', 'og:type', 'og:image']) {
    const count = tags.filter((tag) => tag.property === property && tag.content?.trim()).length;
    if (count !== 1) errors.push(`${label}: expected 1 ${property}, found ${count}`);
  }
  for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    const count = tags.filter((tag) => tag.name === name && tag.content?.trim()).length;
    if (count !== 1) errors.push(`${label}: expected 1 ${name}, found ${count}`);
  }

  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { errors.push(`${label}: invalid JSON-LD (${error.message})`); }
  }

  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']*)["']/gi)) {
    const href = match[1].replaceAll('&amp;', '&').trim();
    if (!href) { errors.push(`${label}: empty href`); continue; }
    if (href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
    let target;
    try { target = new URL(href, url); } catch { errors.push(`${label}: invalid href ${href}`); continue; }
    if (target.origin !== site) continue;
    if (!existsSync(localTarget(target)) && !redirectPaths.has(target.pathname)) errors.push(`${label}: broken internal link ${target.pathname}`);
  }
}

const ogPng = join(dist, 'og-default.png');
if (!existsSync(ogPng)) errors.push('Missing dist/og-default.png fallback image');
if (htmlFiles.length === 0) errors.push('No HTML pages found');

console.log(`SEO audit: ${htmlFiles.length} HTML pages`);
console.log(`Errors: ${errors.length}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Warnings: ${warnings.length}`);
for (const warning of warnings) console.warn(`WARN ${warning}`);
if (errors.length) process.exit(1);
