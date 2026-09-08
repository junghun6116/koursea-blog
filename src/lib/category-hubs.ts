export type CategoryHub = {
  slug: 'kpop' | 'healthcare' | 'travel';
  label: string;
  description: string;
  matches: RegExp;
};

export const categoryHubs: CategoryHub[] = [
  {
    slug: 'kpop',
    label: 'K-Pop & Concerts',
    description: 'Fan routes, official merchandise checks, filming locations, and practical concert planning for international visitors.',
    matches: /k-?pop|concert|bts|army|twice|once|stray kids|stay|newjeans|bunnies|seventeen|carat|enhypen|engene|aespa|nct|nctzen|riize|briize|boynextdoor|onedoor|bigbang|blackpink|hybe|jyp|\bsm\b|\byg\b|kwangya|weverse|inkigayo|lucky draw|lightstick|merch/i
  },
  {
    slug: 'healthcare',
    label: 'Healthcare & K-Beauty',
    description: 'Clinic comparisons, treatment-planning guides, skincare shopping, and health logistics grounded in published Koursea evidence.',
    matches: /beauty|clinic|dermat|skin|botox|toxin|filler|rejuran|ultherapy|shurink|hifu|laser|pico|potenza|microneedling|medical|health|pharmacy|scalp|head spa|olive young|cosmetic/i
  },
  {
    slug: 'travel',
    label: 'Travel Essentials',
    description: 'Transit, payments, neighborhoods, food, attractions, and everyday logistics for planning a trip across Korea.',
    matches: /travel|seoul|busan|gyeongju|pohang|yangyang|yongin|chuncheon|andong|yeosu|gangneung|pocheon|jeju|airport|arex|subway|transit|taxi|payment|card|wowpass|t-money|tmoney|maps|navigation|luggage|shipping|post office|printing|cowork|restaurant|food|cafe|bakery|attraction|itinerary|hotel|festival|museum|beach|heritage|hanbok|lost112|emergency|free things|day trip|ktx|myeongdong|hongdae|seongsu|jongno|gangnam|haeundae|hwangridan|gwangalli|insadong|yongsan/i
  }
];

export const categoriesForTags = (tags: string[]) => {
  const tagText = tags.join(' ');
  return categoryHubs.filter((hub) => hub.matches.test(tagText));
};

export const categoryForSlug = (slug: string) => categoryHubs.find((hub) => hub.slug === slug);
