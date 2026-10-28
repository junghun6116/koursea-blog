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
    matches: /k-?pop|concert|bts|army|twice|once|stray kids|newjeans|bunnies|seventeen|carat|enhypen|engene|aespa|nct|nctzen|riize|briize|boynextdoor|onedoor|bigbang|blackpink|hybe|jyp|\bsm\b|\byg\b|kwangya|weverse|inkigayo|lucky draw|lightstick|merch/i
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
  // Parcel contents do not make a shipping guide a beauty/health guide.
  const isShippingGuide = tags.some((tag) => /^(post office|ems|international shipping|shipping|send luggage home)$/i.test(tag.trim()));
  return categoryHubs.filter((hub) => !(isShippingGuide && hub.slug === 'healthcare') && hub.matches.test(tagText));
};

export const beautyShoppingPriority = (tags: string[]) => {
  const text = tags.join(' ');
  if (/clinic|botox|filler|medical|dermat|surgery|laser|rejuran|ultherapy|shurink|hifu|potenza|microneedling/i.test(text)) return 1;
  return /olive young|shopping|skincare|head spa|scalp|beauty/i.test(text) ? 0 : 1;
};

export const categoryForSlug = (slug: string) => categoryHubs.find((hub) => hub.slug === slug);
