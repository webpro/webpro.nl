import { defineCollection, z } from 'astro:content';

const page = defineCollection({
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    published: z.coerce.date().optional(),
    modified: z.coerce.date().optional(),
  }),
});

const references = page;

const articles = defineCollection({
  schema: z.object({
    title: z.string().optional(),
    description: z.string(),
    published: z.coerce.date(),
    modified: z.coerce.date().optional(),
    draft: z.boolean().optional(),
    image: z.string().optional(),
    tags: z.string().optional(),
  }),
});

const scraps = articles;

export const collections = { articles, scraps, references };
