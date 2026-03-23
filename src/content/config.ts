import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '*.json',
  }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    date: z.string(),
    tags: z.array(z.string()),
    summary: z.string(),
    body: z.string(),
  }),
});

const profile = defineCollection({
  loader: glob({
    base: './src/content/profile',
    pattern: 'index.json',
  }),
  schema: z.object({
    selfIntroduction: z.object({
      name: z.string(),
      specialty: z.string(),
      careerPreference: z.string(),
    }),
    skills: z.array(
      z.object({
        category: z.string(),
        items: z.array(
          z.object({
            name: z.string(),
            years: z.number(),
            level: z.number(),
          }),
        ),
      }),
    ),
    certifications: z.array(
      z.object({
        slug: z.string(),
        organizer: z.string(),
        name: z.string(),
        result: z.string(),
        acquiredDate: z.string(),
        expiryDate: z.string().nullable(),
      }),
    ),
    goals: z.array(
      z.object({
        slug: z.string(),
        title: z.string(),
        summary: z.string(),
        priority: z.string(),
        targetPeriod: z.string(),
        detail: z.array(z.string()),
      }),
    ),
    learnings: z.array(
      z.object({
        slug: z.string(),
        title: z.string(),
        summary: z.string(),
        period: z.string(),
        detail: z.array(z.string()),
        goalSlugs: z.array(z.string()),
      }),
    ),
  }),
});

const typing = defineCollection({
  loader: glob({
    base: './src/content/typing',
    pattern: '*.json',
  }),
  schema: z.object({
    date: z.string(),
    totalChars: z.number(),
    correctKeys: z.number(),
    errorKeys: z.number(),
    sessionMinutes: z.union([z.number(), z.string()]),
  }),
});

export const collections = {
  blog,
  profile,
  typing,
};
