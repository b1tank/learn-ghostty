import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const sourceRef = z.object({
  path: z.string(),
  line: z.number().int().positive(),
  end: z.number().int().positive().optional(),
  label: z.string(),
  purpose: z.string(),
  officialUrl: z.string().url().optional()
});

const lessons = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/lessons" }),
  schema: z.object({
    order: z.number().int().nonnegative(),
    title: z.string(),
    summary: z.string(),
    duration: z.string(),
    module: z.enum(["Scenarios", "Core pipeline", "Native product", "Maintainer practice"]),
    status: z.enum(["published", "planned"]),
    audience: z.string().default("Experienced engineers new to terminal internals"),
    sourceRefs: z.array(sourceRef).default([])
  })
});

export const collections = { lessons };
