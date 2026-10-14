#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const postsDir = path.join(root, 'src/content/posts');
const policyStart = '2026-10-14';
const requiredFields = ['coverImage', 'coverImageAlt', 'coverImageCredit', 'coverImageSourceUrl'];

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

const files = (await fs.readdir(postsDir)).filter((file) => file.endsWith('.md')).sort();
const failures = [];
let checked = 0;

for (const file of files) {
  const block = frontmatter(await fs.readFile(path.join(postsDir, file), 'utf8'));
  const pubDate = scalar(block, 'pubDate').slice(0, 10);
  if (!pubDate || pubDate < policyStart) continue;
  checked += 1;

  const values = Object.fromEntries(requiredFields.map((field) => [field, scalar(block, field)]));
  for (const field of requiredFields) {
    if (!values[field]) failures.push(`${file}: missing ${field}`);
  }

  if (values.coverImage && !values.coverImage.startsWith('/images/')) {
    failures.push(`${file}: coverImage must use a local /images/ asset with reviewed reuse rights`);
  }
  if (values.coverImage) {
    const imagePath = path.join(root, 'public', values.coverImage.replace(/^\//u, ''));
    try {
      const stats = await fs.stat(imagePath);
      if (!stats.isFile() || stats.size === 0) failures.push(`${file}: coverImage is not a usable file`);
    } catch {
      failures.push(`${file}: coverImage file does not exist (${values.coverImage})`);
    }
  }
  if (values.coverImageSourceUrl && !/^https:\/\//u.test(values.coverImageSourceUrl)) {
    failures.push(`${file}: coverImageSourceUrl must be an HTTPS original-source page`);
  }
}

if (failures.length) {
  console.error(`Editorial cover policy failed for posts published on or after ${policyStart}:`);
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('Keep the post off main until a rights-cleared cover, alt text, credit and original source URL are ready.');
  process.exitCode = 1;
} else {
  console.log(`PASS editorial cover policy: ${checked} post(s) published on or after ${policyStart} have complete, local, source-linked cover media.`);
}
