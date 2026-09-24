import assert from 'node:assert/strict';
import fs from 'node:fs';

const ticketing = fs.readFileSync('dist/posts/kpop-concert-ticketing-seoul-2026/index.html', 'utf8');
const related = ticketing.match(/<aside class="related-pseo"[\s\S]*?<\/aside>/)?.[0] ?? '';
assert.ok(related, 'K-pop ticketing post must render contextual recommendations');
assert.doesNotMatch(related, /href="\/beauty\//, 'K-pop recommendations must not contain treatment guides');
assert.doesNotMatch(related, /PRICE &amp; DOWNTIME/, 'K-pop recommendations must not contain procedure cards');
assert.ok((related.match(/href="\/posts\//g) ?? []).length >= 2, 'K-pop recommendations must link to related editorial posts');
const concertPlanningLinks = [
  'kpop-concert-day-venue-transport-guide-2026',
  'kspo-dome-concert-survival-guide',
  'guide-kpop-music-show-foreigner-tickets-inkigayo-theshow',
  'guide-music-bank-mcountdown-foreigner-tickets'
].filter((slug) => related.includes(`/posts/${slug}/`));
assert.ok(concertPlanningLinks.length >= 2, 'Ticketing post must prioritize practical concert and ticket guides');

const home = fs.readFileSync('dist/index.html', 'utf8');
assert.doesNotMatch(home, /\b\d{1,3},\d{3}\s+(?:source-checked\s+)?(?:places|locations)\b/i, 'Blog home must not publish a manually maintained place count');

console.log('PASS: K-pop recommendations stay on-topic and blog place copy cannot become a stale manual count');
