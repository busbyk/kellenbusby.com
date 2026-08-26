import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      published: z.boolean().default(true),
      // trip reports get extras like the "View as story" mode
      tripReport: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      oneLiner: z.string(),
      status: z.enum(['live', 'in-progress', 'archived']),
      // Human status shown on the badge, e.g. "In development", "Early days"
      statusLabel: z.string(),
      url: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      stack: z.array(z.string()).optional(),
      // Extra context line, e.g. why an archived project was retired
      note: z.string().optional(),
      // Featured projects appear on the landing page
      featured: z.boolean().default(false),
      // Show the "interested?" call to action (mailto + Plausible for now)
      cta: z.boolean().default(false),
      order: z.number().default(99),
    }),
});

export const collections = { blog, projects };
