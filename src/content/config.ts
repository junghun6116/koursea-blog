import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().max(220),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).min(1),
    canonicalUrl: z.string().url().optional(),
    author: z.string().optional()
  })
});

export const collections = { posts };
