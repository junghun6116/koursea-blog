#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const postsDir = path.join(root, 'src/content/posts');
const outputDir = path.join(root, 'public/og/posts');

const xml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function titleFromFrontmatter(source, slug) {
  const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---/u)?.[1] ?? '';
  const raw = frontmatter.match(/^title:\s*(.+)$/mu)?.[1]?.trim();
  if (!raw) return slug.replaceAll('-', ' ');
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1).replaceAll('\\"', '"').replaceAll("\\'", "'");
  }
  return raw;
}

function wrapTitle(title, max = 34) {
  const words = title.split(/\s+/u);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length <= 3) return lines;
  return [...lines.slice(0, 2), `${lines.slice(2).join(' ').slice(0, max - 1).trim()}…`];
}

function accentFor(slug) {
  const palette = ['#2F6F62', '#A05A42', '#395A8A', '#8B6B33', '#6B4E71'];
  const hash = [...slug].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 0);
  return palette[hash % palette.length];
}

function artwork(title, slug) {
  const accent = accentFor(slug);
  const lines = wrapTitle(title);
  const titleMarkup = lines.map((line, index) =>
    `<tspan x="88" dy="${index === 0 ? 0 : 76}">${xml(line)}</tspan>`
  ).join('');
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FBF9F3"/>
          <stop offset="1" stop-color="#EEEAE0"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#paper)"/>
      <rect x="0" y="0" width="24" height="630" fill="${accent}"/>
      <circle cx="1090" cy="96" r="190" fill="${accent}" opacity="0.08"/>
      <circle cx="1040" cy="570" r="260" fill="${accent}" opacity="0.06"/>
      <text x="88" y="90" fill="${accent}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="5">KOURSEA JOURNAL</text>
      <text x="88" y="205" fill="#17213B" font-family="Georgia, 'Times New Roman', serif" font-size="62" font-weight="700">${titleMarkup}</text>
      <line x1="88" y1="526" x2="1112" y2="526" stroke="#D6D2C8"/>
      <text x="88" y="578" fill="#596273" font-family="Arial, Helvetica, sans-serif" font-size="24">Fact-checked Korea travel &amp; K-beauty guidance</text>
      <text x="1112" y="578" text-anchor="end" fill="${accent}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">blog.koursea.com</text>
    </svg>`;
}

await fs.mkdir(outputDir, { recursive: true });
const files = (await fs.readdir(postsDir)).filter((file) => file.endsWith('.md')).sort();
for (const file of files) {
  const slug = path.basename(file, '.md');
  const source = await fs.readFile(path.join(postsDir, file), 'utf8');
  const title = titleFromFrontmatter(source, slug);
  await sharp(Buffer.from(artwork(title, slug)))
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(outputDir, `${slug}.png`));
}

console.log(`Generated ${files.length} individual post OG images in public/og/posts/.`);
