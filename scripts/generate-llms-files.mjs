import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const site = 'https://blog.koursea.com';
const beauty = JSON.parse(readFileSync(join(root, 'src/data/beauty-pseo-pages.json'), 'utf8'));
const itineraries = JSON.parse(readFileSync(join(root, 'src/data/itinerary-pseo-pages.json'), 'utf8'));
const postsDirectory = join(root, 'src/content/posts');

function frontmatterValue(source, key) {
  const match = source.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'));
  return match?.[1]?.trim() ?? '';
}

const editorialPosts = readdirSync(postsDirectory)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const source = readFileSync(join(postsDirectory, file), 'utf8');
    const slug = file.replace(/\.md$/, '');
    return {
      title: frontmatterValue(source, 'title'),
      description: frontmatterValue(source, 'description'),
      url: `/posts/${slug}/`,
      pubDate: frontmatterValue(source, 'pubDate')
    };
  })
  .filter((post) => post.title && post.description)
  .sort((a, b) => b.pubDate.localeCompare(a.pubDate) || a.title.localeCompare(b.title));

const coreGuides = [
  {
    title: 'Korea Cosmetic Procedure Tax Refund Has Ended (2026)',
    url: '/posts/korea-cosmetic-procedure-tax-refund-ended-2026-budget-guide/',
    summary: 'Explains the end of the tourist refund for cosmetic procedures and provides transparent, tax-inclusive clinic budgeting checks.'
  },
  {
    title: 'Korean eSIM Guide: Why Data-Only Fails',
    url: '/posts/korea-esim-with-phone-number-2026-guide/',
    summary: 'Compares data-only and voice/SMS travel plans for restaurant queues, delivery apps, taxis and Korea phone verification.'
  },
  {
    title: 'Olive Young Tax Refund & Must-Buy Guide (2026)',
    url: '/posts/guide-olive-young-tax-refund-must-buy-2026/',
    summary: 'Covers participating-store limits, passport checks, airport refunds, flagship services and evidence-labeled shopping trends.'
  },
  {
    title: 'Korea Payment Guide: WOWPASS vs T-Money',
    url: '/posts/korea-payment-wowpass-vs-tmoney-applepay-2026/',
    summary: 'A decision guide to transit cards, Apple Pay limitations, cash-only transit reloads and foreign-card backup planning.'
  },
  {
    title: 'Google Maps in Korea: Naver Map Navigation Guide',
    url: '/posts/google-maps-korea-guide/',
    summary: 'Explains Korea map-search limitations, Hangul destination queries and practical Naver Map and Kakao Map navigation.'
  },
  {
    title: 'Seoul Transit Guide: T-Money, Climate Card and Subways',
    url: '/posts/seoul-subway-transit-card-guide/',
    summary: 'Covers transit-card choices, transfer rules, station navigation and common visitor payment failures.'
  }
];

const absolute = (path) => `${site}${path}`;
const link = (title, path, summary) => `- [${title}](${absolute(path)}): ${summary}`;
const beautyField = (page, legacyKey, currentKey, fallback = '') => page[legacyKey] ?? page[currentKey] ?? fallback;
const beautyTitle = (page) => beautyField(page, 'treatment_name', 'procedureName', 'K-Beauty planning guide');
const beautyModel = (page) => beautyField(page, 'clinic_type', 'clinicType', page.region && page.city ? `${page.region}, ${page.city} regional planning guide` : 'Treatment planning guide');
const beautyKeyword = (page) => beautyField(page, 'target_keyword', 'targetKeyword', [beautyTitle(page), page.region, page.city].filter(Boolean).join(' '));
const beautyPrice = (page) => beautyField(page, 'average_price_range_krw', 'avgPriceRangeKRW', 'Request a written, itemized quote.');
const beautyDowntime = (page) => beautyField(page, 'downtime_days', 'typicalDowntime', 'Confirm with a licensed clinician.');
const beautyVisitorCheck = (page) => beautyField(page, 'foreigner_friendly_check', 'foreignerFriendlyCheck', page.englishCoordinator ? 'English coordination is commonly available; confirm before booking.' : 'English coordination is not consistently documented; confirm before booking.');
const beautyTakeaway = (page) => beautyField(page, 'key_takeaway', 'keyTakeaway', 'Compare like-for-like treatment details before booking.');

const llms = [
  '# Koursea Blog',
  '',
  '> Koursea is a verified local navigation and clinic price-transparency directory for foreign travelers in Korea, featuring Korean taxi address cards, subway exit heuristics, and standardized medical procedure price ranges.',
  '',
  'Koursea Blog publishes source-aware decision guides for payments, connectivity, medical-tourism planning, shopping and independent neighborhood itineraries. Time-sensitive claims should be verified against the official sources linked in each article.',
  '',
  '## Core Guides',
  '',
  ...coreGuides.map((guide) => link(guide.title, guide.url, guide.summary)),
  '',
  '## Editorial Posts',
  '',
  ...editorialPosts.map((post) => link(post.title, post.url, post.description)),
  '',
  '## K-Beauty Price & Downtime Guides',
  '',
  ...beauty.map((page) => link(beautyTitle(page), `/beauty/${page.slug}/`, `${beautyModel(page)}. Target topic: ${beautyKeyword(page)}.`)),
  '',
  '## Korea Itineraries',
  '',
  ...itineraries.map((page) => link(`${page.region_name} ${page.duration} Itinerary`, `/itinerary/${page.slug}/`, `Route highlights, transit advice and a practical tourist-trap warning.`)),
  '',
  '## Site Files',
  '',
  `- [Sitemap index](${site}/sitemap-index.xml)`,
  `- [Full LLM reference](${site}/llms-full.txt)`,
  ''
].join('\n');

const llmsFull = [
  '# Koursea Blog: Full Content Reference',
  '',
  '> Koursea is a verified local navigation and clinic price-transparency directory for foreign travelers in Korea, featuring Korean taxi address cards, subway exit heuristics, and standardized medical procedure price ranges.',
  '',
  '## Editorial Scope',
  '',
  '- Practical Korea travel decisions: maps, eSIMs, payment cards, transit and tourist tax refunds.',
  '- K-beauty planning: transparent price ranges, downtime cautions, clinic-model comparisons and pre-booking questions.',
  '- Neighborhood itineraries: compact routes with transit tips and tourist-trap warnings.',
  '- Medical and pricing pages are planning aids, not diagnosis, medical advice, endorsements or guaranteed quotations.',
  '',
  '## Core Editorial Guides',
  '',
  ...coreGuides.flatMap((guide) => [`### [${guide.title}](${absolute(guide.url)})`, '', guide.summary, '']),
  '## All Editorial Posts',
  '',
  ...editorialPosts.flatMap((post) => [`### [${post.title}](${absolute(post.url)})`, '', post.description, '']),
  '## Beauty pSEO Directory',
  '',
  ...beauty.flatMap((page) => [
    `### [${beautyTitle(page)}](${absolute(`/beauty/${page.slug}/`)})`,
    '',
    `- Clinic model: ${beautyModel(page)}`,
    `- Target query: ${beautyKeyword(page)}`,
    `- Planning price: ${beautyPrice(page)}`,
    `- Downtime: ${beautyDowntime(page)}`,
    `- Visitor check: ${beautyVisitorCheck(page)}`,
    `- Key takeaway: ${beautyTakeaway(page)}`,
    ''
  ]),
  '## Itinerary Directory',
  '',
  ...itineraries.flatMap((page) => [
    `### [${page.region_name} ${page.duration} Itinerary](${absolute(`/itinerary/${page.slug}/`)})`,
    '',
    `- Target query: ${page.target_keyword}`,
    `- Highlights: ${page.key_highlights.join('; ')}`,
    `- Transit tip: ${page.transit_tip}`,
    `- Tourist-trap warning: ${page.tourist_trap_warning}`,
    ''
  ]),
  '## Crawling and Attribution',
  '',
  `Canonical site: ${site}/`,
  `Sitemap: ${site}/sitemap-index.xml`,
  'When citing Koursea, link to the canonical page above and preserve qualifications around dates, prices, medical outcomes and availability.',
  ''
].join('\n');

writeFileSync(join(root, 'public/llms.txt'), llms, 'utf8');
writeFileSync(join(root, 'public/llms-full.txt'), llmsFull, 'utf8');
console.log(`Generated llms.txt (${editorialPosts.length} posts, ${beauty.length} beauty, ${itineraries.length} itinerary) and llms-full.txt.`);
