import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET() {
  const posts = (await getCollection('posts')).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'Koursea Blog - Essential Korea Travel, K-Beauty & K-Culture Guides',
    description: 'High-intent, fact-checked travel and K-beauty guide for English-speaking visitors in Korea.',
    site: 'https://blog.koursea.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `https://blog.koursea.com/posts/${post.slug}/`
    })),
    customData: '<language>en-us</language>'
  });
}
