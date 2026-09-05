import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const keywordOverrides: Record<string, string[]> = {
  'lost112-korea-police-lost-found-foreigner-guide': [
    'police station seoul english',
    'police box near me',
    'lost passport seoul police',
    'lost phone in taxi seoul',
    'tourist police seoul',
    'korea police emergency number in english',
    'lost and found center seoul'
  ]
};

const mainSiteUtilityGuides = [
  {
    slug: 'coin-laundry-laundromat-seoul-english-washer-detergent',
    title: 'How to Use Coin Laundry in Seoul',
    description: 'A practical foreign-traveler guide to self-service laundromats, washers, dryers, detergent and wash-and-fold options in Seoul.',
    category: 'Travel Essentials',
    tags: ['Laundry', 'Long Stay', 'Seoul'],
    keywords: ['laundromat in seoul', 'coin laundry near me', '24 hour laundromat hongdae', 'self service laundry seoul', 'wash and fold seoul', 'how to use coin laundry in korea', 'dry cleaning seoul english'],
    url: 'https://www.koursea.com/coin-laundry-laundromat-seoul-english-washer-detergent.html'
  },
  {
    slug: 'guide-korea-luggage-delivery-storage-zimcarry-lockers-2026',
    title: 'Korea Luggage Delivery, Storage and Subway Lockers',
    description: 'Store bags in Seoul, use T-Locker, or send luggage between Incheon Airport and your hotel.',
    category: 'Travel Essentials',
    tags: ['Luggage Storage', 'T-Locker', 'Airport'],
    keywords: ['subway locker seoul', 't-locker seoul english', 'luggage storage hongdae', 'luggage delivery incheon airport', 'where to store bags in seoul station'],
    url: 'https://www.koursea.com/guide-korea-luggage-delivery-storage-zimcarry-lockers-2026.html'
  },
  {
    slug: 'guide-korea-pharmacy-convenience-store-medicine-119-2026',
    title: 'Korea Pharmacy, Urgent Care and 119 Guide',
    description: 'Find late-night medicine, English help, urgent care and emergency contacts while traveling in Seoul.',
    category: 'Travel Essentials',
    tags: ['Pharmacy', 'Emergency', '119'],
    keywords: ['pharmacy open sunday seoul', 'late night pharmacy seoul', 'english speaking pharmacy near me', 'urgent care seoul english', 'international clinic seoul', 'korea emergency number 119 english', 'over the counter painkiller korea'],
    url: 'https://www.koursea.com/guide-korea-pharmacy-convenience-store-medicine-119-2026.html'
  },
  {
    slug: 'guide-korea-lost-and-found-lost112-emergency',
    title: 'Korea Lost & Found, Police Box and Lost112 Guide',
    description: 'Recover a passport, phone or wallet using Lost112, tourist interpretation and the nearest Seoul police substation.',
    category: 'Travel Essentials',
    tags: ['Lost112', 'Police', 'Emergency'],
    keywords: ['police station seoul english', 'police box near me', 'lost passport seoul police', 'lost phone in taxi seoul', 'tourist police seoul', 'korea police emergency number in english', 'lost and found center seoul'],
    url: 'https://www.koursea.com/guide-korea-lost-and-found-lost112-emergency.html'
  },
  {
    slug: 'korea-public-restrooms-free-toilets-seoul-guide',
    title: 'Public Restrooms and Free Toilets in Seoul',
    description: 'Where foreign visitors can find public toilets in subway stations, parks, malls and public buildings.',
    category: 'Travel Essentials',
    tags: ['Public Restroom', 'Seoul', 'Accessibility'],
    keywords: ['public restroom near me seoul'],
    url: 'https://www.koursea.com/korea-public-restrooms-free-toilets-seoul-guide.html'
  }
];

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');
  const guides = posts
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((post) => ({
      slug: post.slug,
      title: post.data.title,
      description: post.data.description,
      category: post.data.tags[0] ?? 'Korea Travel',
      tags: post.data.tags,
      keywords: keywordOverrides[post.slug] ?? [],
      url: `https://blog.koursea.com/posts/${post.slug}/`
    }));

  return new Response(JSON.stringify([...guides, ...mainSiteUtilityGuides]), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=900, stale-while-revalidate=86400'
    }
  });
};
