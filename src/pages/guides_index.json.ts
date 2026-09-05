import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

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
      url: `https://blog.koursea.com/posts/${post.slug}/`
    }));

  return new Response(JSON.stringify(guides), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
};
