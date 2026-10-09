#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_BASE = 'https://apis.data.go.kr/B551011/KorService2';
const OUTPUT_DIR = path.resolve('artifacts/tourapi-blog-cover-candidates');
const SERVICE_KEY = process.env.TOUR_API_SERVICE_KEY?.trim();
const CANDIDATES_PER_POST = 4;
const ALLOWED_CONTENT_TYPES = new Set(['12', '14', '15']);

const POSTS = [
  { slug: '20-verified-things-to-do-gyeongju', label: 'Gyeongju attractions', keyword: '첨성대', terms: ['첨성대'], addressTerms: ['경상북도 경주시', '경북 경주시'] },
  { slug: 'best-attractions-gangneung-coffee-street-sea-fan-road', label: 'Gangneung attractions', keyword: '안목해변', terms: ['안목', '커피거리'], addressTerms: ['강원특별자치도 강릉시', '강원도 강릉시'] },
  { slug: 'best-attractions-pocheon-sky-bridge-hantan-geopark', label: 'Pocheon attractions', keyword: '포천 한탄강 하늘다리', terms: ['한탄강', '하늘다리'], addressTerms: ['경기도 포천시'] },
  { slug: 'best-things-to-do-pohang-space-walk-coastal-views', label: 'Pohang attractions', keyword: '환호공원', terms: ['환호공원', '스페이스워크'], addressTerms: ['경상북도 포항시', '경북 포항시'] },
  { slug: 'best-cafes-gyeongju-hanok-lake-views', label: 'Gyeongju cafe scenery', keyword: '보문호', terms: ['보문호', '보문관광단지'], addressTerms: ['경상북도 경주시', '경북 경주시'] },
  { slug: 'best-cafes-yangyang-oceanfront-forest-hideaways', label: 'Yangyang cafe scenery', keyword: '하조대', terms: ['하조대'], addressTerms: ['강원특별자치도 양양군', '강원도 양양군'] },
  { slug: 'best-cafes-yongin-forest-hanok-lakeside', label: 'Yongin cafe scenery', keyword: '용인 고기리계곡', terms: ['고기리', '고기동'], addressTerms: ['경기도 용인시'] },
  { slug: 'best-restaurants-andong-jjimdak-salted-mackerel', label: 'Andong food guide', keyword: '안동 하회마을', terms: ['하회마을', '하회'], addressTerms: ['경상북도 안동시', '경북 안동시'] },
  { slug: 'best-restaurants-chuncheon-dakgalbi-makguksu', label: 'Chuncheon food guide', keyword: '소양강', terms: ['소양강', '소양호'], addressTerms: ['강원특별자치도 춘천시', '강원도 춘천시'] },
  { slug: 'best-restaurants-yeosu-raw-crab-eel-soup', label: 'Yeosu food guide', keyword: '오동도', terms: ['오동도'], addressTerms: ['전라남도 여수시', '전남 여수시'] },
];

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function responseItems(payload) {
  const header = payload?.response?.header;
  if (header?.resultCode && header.resultCode !== '0000') {
    throw new Error(`TourAPI ${header.resultCode}: ${header.resultMsg || 'Unknown API error'}`);
  }
  return asArray(payload?.response?.body?.items?.item);
}

function buildUrl(endpoint, params = {}) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  url.searchParams.set('serviceKey', SERVICE_KEY);
  url.searchParams.set('MobileOS', 'ETC');
  url.searchParams.set('MobileApp', 'KourseaEditorial');
  url.searchParams.set('_type', 'json');
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  return url;
}

async function request(endpoint, params) {
  const response = await fetch(buildUrl(endpoint, params), { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`TourAPI HTTP ${response.status} from ${endpoint}`);
  return response.json();
}

function matchesPost(content, post) {
  const address = [content.addr1, content.addr2].filter(Boolean).join(' ');
  const searchable = [content.title, address].filter(Boolean).join(' ');
  return post.addressTerms.some((term) => address.includes(term))
    && post.terms.some((term) => searchable.includes(term));
}

async function candidatesFor(post) {
  const search = await request('searchKeyword2', {
    keyword: post.keyword,
    numOfRows: 30,
    pageNo: 1,
  });
  const contents = responseItems(search)
    .filter((item) => ALLOWED_CONTENT_TYPES.has(String(item.contenttypeid || '')))
    .filter((item) => matchesPost(item, post));
  const candidates = [];
  for (const content of contents) {
    const detail = await request('detailImage2', {
      contentId: content.contentid,
      imageYN: 'Y',
      numOfRows: 30,
      pageNo: 1,
    });
    for (const image of responseItems(detail)) {
      // Type 1 permits attribution-based reuse and alteration. We deliberately
      // exclude Type 3 because cover crops and WebP conversion are derivatives.
      if (!image.originimgurl || image.cpyrhtDivCd !== 'Type1') continue;
      candidates.push({
        slug: post.slug,
        label: post.label,
        keyword: post.keyword,
        contentId: String(content.contentid || ''),
        title: content.title || image.imgname || post.label,
        address: [content.addr1, content.addr2].filter(Boolean).join(' '),
        imageName: image.imgname || '',
        imageUrl: image.originimgurl,
        thumbnailUrl: image.smallimageurl || image.originimgurl,
        copyrightType: image.cpyrhtDivCd,
        attribution: 'Photo: Korea Tourism Organization (TourAPI), KOGL Type 1',
        source: 'Korea Tourism Organization TourAPI',
        humanReviewRequired: true,
      });
      if (candidates.length >= CANDIDATES_PER_POST) return candidates;
    }
  }
  return candidates;
}

async function main() {
  if (!SERVICE_KEY) throw new Error('TOUR_API_SERVICE_KEY is missing');
  const items = [];
  for (const post of POSTS) {
    const candidates = await candidatesFor(post);
    console.log(`${post.slug}: ${candidates.length} candidate(s)`);
    items.push(...candidates);
  }
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(path.join(OUTPUT_DIR, 'manifest.json'), `${JSON.stringify({
    purpose: 'Human-reviewed TourAPI candidates for Koursea Blog covers. Nothing is automatically published.',
    source: 'Korea Tourism Organization TourAPI KorService2',
    licenseFilter: 'KOGL Type 1 only',
    collectedAt: new Date().toISOString(),
    items,
  }, null, 2)}\n`);
  console.log(`Saved ${items.length} candidates to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
