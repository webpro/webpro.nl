import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const references = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/references' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    published: z.coerce.date().optional(),
    modified: z.coerce.date().optional(),
  }),
});

const blogSchema = z.object({
  title: z.string().optional(),
  description: z.string(),
  published: z.coerce.date(),
  modified: z.coerce.date().optional(),
  draft: z.boolean().optional(),
  image: z.string().optional(),
  tags: z.string().optional(),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: blogSchema,
});

const scraps = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/scraps' }),
  schema: blogSchema,
});

export const collections = { articles, scraps, references };
