#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const postsDir = path.join(root, 'src/content/posts');
const ogDir = path.join(root, 'public/og/posts');

function frontmatter(source) {
  return source.match(/^---\s*\n([\s\S]*?)\n---/u)?.[1] ?? '';
}

function scalar(block, field) {
  const raw = block.match(new RegExp(`^${field}:\\s*(.+)$`, 'mu'))?.[1]?.trim() ?? '';
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  return raw;
}

async function usableFile(file) {
  try {
    const stats = await fs.stat(file);
    return stats.isFile() && stats.size > 0;
  } catch {
    return false;
  }
}

const postFiles = (await fs.readdir(postsDir)).filter((file) => file.endsWith('.md')).sort();
const postSlugs = new Set(postFiles.map((file) => path.basename(file, '.md')));
const failures = [];
let coverCount = 0;
let generatedCount = 0;

for (const file of postFiles) {
  const slug = path.basename(file, '.md');
  const block = frontmatter(await fs.readFile(path.join(postsDir, file), 'utf8'));
  const coverImage = scalar(block, 'coverImage');

  if (coverImage) {
    if (!coverImage.startsWith('/images/')) {
      failures.push(`${file}: coverImage must be a local /images/ asset`);
      continue;
    }
    const coverPath = path.join(root, 'public', coverImage.replace(/^\//u, ''));
    if (!(await usableFile(coverPath))) failures.push(`${file}: missing or empty coverImage (${coverImage})`);
    else coverCount += 1;

    const staleOg = path.join(ogDir, `${slug}.png`);
    if (await usableFile(staleOg)) failures.push(`${file}: licensed cover and stale text OG both exist`);
    continue;
  }

  const ogPath = path.join(ogDir, `${slug}.png`);
  if (!(await usableFile(ogPath))) failures.push(`${file}: missing generated social image (/og/posts/${slug}.png)`);
  else generatedCount += 1;
}

for (const file of (await fs.readdir(ogDir)).filter((name) => name.endsWith('.png')).sort()) {
  const slug = path.basename(file, '.png');
  if (!postSlugs.has(slug)) failures.push(`${file}: orphan social image has no matching post`);
}

if (failures.length) {
  console.error('Social image coverage check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`PASS social image coverage: ${postFiles.length} posts (${coverCount} licensed covers, ${generatedCount} generated OG images), 0 missing or orphan files.`);
}
