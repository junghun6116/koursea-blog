import fs from 'node:fs';
import assert from 'node:assert/strict';

const postLayout = fs.readFileSync('src/layouts/PostLayout.astro', 'utf8');
const categoryPage = fs.readFileSync('src/pages/category/[slug].astro', 'utf8');
const categoryHubs = fs.readFileSync('src/lib/category-hubs.ts', 'utf8');

for (const source of [postLayout, categoryPage]) {
  assert(source.includes('utm_source=koursea_blog'), 'K-pop handoff must preserve the blog source');
  assert(source.includes('utm_campaign=kpop_fan_travel'), 'K-pop handoff must preserve the campaign');
  assert(source.includes('https://www.koursea.com/kpop.html'), 'K-pop handoff must target the fan-travel hub');
  assert(source.includes('community.html?topic=kpop_concerts&compose=1'), 'K-pop handoff must open the K-pop Ask composer');
}

assert(postLayout.includes("kpop_blog_cta_click"), 'article CTA clicks must be measurable');
assert(categoryPage.includes("kpop_blog_category_cta_click"), 'category CTA clicks must be measurable');

const kpopPattern = categoryHubs.match(/slug: 'kpop'[\s\S]*?matches: \/([^\n]+)\/i/)?.[1];
assert(kpopPattern, 'K-pop category matcher must be present');
const kpopMatcher = new RegExp(kpopPattern, 'i');
assert(kpopMatcher.test('stray kids'), 'Stray Kids must stay in the K-pop category');
assert(!kpopMatcher.test('Korea temple stay'), 'ordinary travel stays must not enter the K-pop category');
assert(!kpopMatcher.test('Jeonju hanok stay'), 'hanok stays must not enter the K-pop category');

console.log('PASS K-pop blog handoff: UTM, hub, Ask and CTA events are connected');
