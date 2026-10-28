import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(240),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).min(1),
    canonicalUrl: z.url().optional(),
    author: z.string().optional(),
    reviewer: z.string().optional(),
    coverImage: z.string().optional(),
    coverOmissionReason: z.string().min(20).optional(),
    coverImageAlt: z.string().optional(),
    coverImageCredit: z.string().optional(),
    coverImageSourceUrl: z.url().optional(),
    thumbnail: z.string().optional(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).optional()
  }).superRefine((post, context) => {
    if (post.coverOmissionReason) {
      if (post.coverImage || post.thumbnail || post.coverImageAlt || post.coverImageCredit || post.coverImageSourceUrl) {
        context.addIssue({ code: 'custom', path: ['coverOmissionReason'], message: 'An omitted cover must not retain image fields or a substitute thumbnail.' });
      }
      return;
    }
    if (post.pubDate < new Date('2026-10-14T00:00:00Z')) return;
    const visualFields: Array<[string, unknown]> = [
      ['coverImage', post.coverImage],
      ['coverImageAlt', post.coverImageAlt],
      ['coverImageCredit', post.coverImageCredit],
      ['coverImageSourceUrl', post.coverImageSourceUrl]
    ];
    for (const [field, value] of visualFields) {
      if (value) continue;
      context.addIssue({
        code: 'custom',
        path: [field],
        message: 'Cover images require alt text, a visible credit and the original source URL.'
      });
    }
  })
});

export const collections = { posts };
