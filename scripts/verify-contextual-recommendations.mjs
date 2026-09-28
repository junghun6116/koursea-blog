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

const arex = fs.readFileSync('dist/posts/arex-express-vs-all-stop-seoul-station-transfer/index.html', 'utf8');
const arexRelated = arex.match(/<aside class="related-pseo"[\s\S]*?<\/aside>/)?.[0] ?? '';
assert.ok(arexRelated, 'Ordinary editorial posts must render contextual recommendations');
assert.ok((arexRelated.match(/href="\/posts\//g) ?? []).length >= 2, 'Ordinary recommendations must include at least two related editorial posts');

const postDirs = fs.readdirSync('dist/posts').filter((slug) => fs.existsSync(`dist/posts/${slug}/index.html`));
const postsWithoutRecommendations = postDirs.filter((slug) => !fs.readFileSync(`dist/posts/${slug}/index.html`, 'utf8').includes('class="related-pseo"'));
assert.deepEqual(postsWithoutRecommendations, [], `Every editorial post must have relevant planning links; missing: ${postsWithoutRecommendations.join(', ')}`);

for (const removedSlug of [
  'rejuran-healer-korea-price-downtime-guide-2026',
  'pico-toning-laser-foreign-traveler-guide'
]) {
  assert.ok(!fs.existsSync(`dist/beauty/${removedSlug}/index.html`), `${removedSlug} must not remain as a duplicate indexable page`);
}

const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const redirectPairs = new Map((vercelConfig.routes ?? []).map((route) => [route.src, route.headers?.Location]));
assert.equal(redirectPairs.get('/beauty/rejuran-healer-korea-price-downtime-guide-2026/'), '/posts/rejuran-healer-korea-guide/');
assert.equal(redirectPairs.get('/beauty/pico-toning-laser-foreign-traveler-guide/'), '/posts/laser-toning-korea-guide/');

console.log('PASS: contextual recommendations stay on-topic, thin-link gaps are covered, and duplicate beauty pages are removed');
