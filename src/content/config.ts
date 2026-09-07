import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().max(240),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).min(1),
    canonicalUrl: z.string().url().optional(),
    author: z.string().optional(),
    coverImage: z.string().optional(),
    thumbnail: z.string().optional(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).optional()
  })
});

export const collections = { posts };
