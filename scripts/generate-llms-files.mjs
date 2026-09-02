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
  }
];

const absolute = (path) => `${site}${path}`;
const link = (title, path, summary) => `- [${title}](${absolute(path)}): ${summary}`;

const llms = [
  '# Koursea Blog',
  '',
  '> High-intent, fact-checked Korea travel and K-beauty guidance for English-speaking visitors.',
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
  ...beauty.map((page) => link(page.treatment_name, `/beauty/${page.slug}/`, `${page.clinic_type}. Target topic: ${page.target_keyword}.`)),
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
  '> Koursea is a high-intent, fact-checked travel and K-beauty guide for English-speaking visitors in Korea.',
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
    `### [${page.treatment_name}](${absolute(`/beauty/${page.slug}/`)})`,
    '',
    `- Clinic model: ${page.clinic_type}`,
    `- Target query: ${page.target_keyword}`,
    `- Planning price: ${page.average_price_range_krw}`,
    `- Downtime: ${page.downtime_days}`,
    `- Visitor check: ${page.foreigner_friendly_check}`,
    `- Key takeaway: ${page.key_takeaway}`,
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
