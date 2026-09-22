import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/lib/category-hubs.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { categoriesForTags } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

const slugs = (tags) => categoriesForTags(tags).map((hub) => hub.slug);
const jeonju = readFileSync(new URL('../src/content/posts/jeonju-hanok-village-guide.md', import.meta.url), 'utf8');
const tags = JSON.parse(jeonju.match(/^tags: (\[.*\])$/m)[1]);
assert.deepEqual(slugs(tags), ['travel'], 'Jeonju breadcrumb must be Travel Essentials only');
for (const accommodation of ['hanok stay', 'homestay', 'long stay', 'overnight stays']) {
  assert(!slugs([accommodation, 'travel']).includes('kpop'), accommodation);
}
for (const fandom of ['STAY', 'stay', ' Stay ']) {
  assert(slugs([fandom]).includes('kpop'), 'Retain exact STAY fandom tags');
}
assert(slugs(['Stray Kids', 'Seoul']).includes('kpop'));
assert.deepEqual(slugs(['clinic']), ['healthcare']);
assert.deepEqual(slugs([]), []);
console.log('Category hub regression checks passed (11 assertions).');
