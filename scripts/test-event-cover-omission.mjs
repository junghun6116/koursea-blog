import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const slug = 'kgma-mma-2026-gocheok-sky-dome-seoul-trip-guide';
const source = readFileSync(`src/content/posts/${slug}.md`, 'utf8');
assert.match(source, /^coverOmissionReason: .{20,}$/m);
assert.doesNotMatch(source, /^(coverImage\w*|thumbnail):/m);
assert.doesNotMatch(source, /mma-2016|BTS at the \*\*2016/);
const html = readFileSync(`dist/posts/${slug}/index.html`, 'utf8');
assert.doesNotMatch(html, /mma-2016-bts-archive|gocheok-sky-dome-wide-wikimedia/);
assert.match(html, /kgma-is\.com\/locales\/en\/kgma2026\.html/);
assert.match(html, new RegExp(`/og/posts/${slug}\\.png`));
console.log('PASS: no unrelated event photo; official links and text-only social card retained.');
