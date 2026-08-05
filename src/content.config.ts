import { defineCollection, z } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

const sourceRef = z.object({
  path: z.string(), line: z.number().int().positive(), end: z.number().int().positive().optional(),
  label: z.string(), purpose: z.string(), officialUrl: z.string().url().optional()
});

const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({ extend: z.object({
    order: z.number().int().nonnegative().optional(),
    module: z.enum(["Reconstruction", "Field guides"]).optional(),
    status: z.enum(["published", "planned"]).optional(),
    duration: z.string().optional(),
    sourceRefs: z.array(sourceRef).default([])
  }) })
});

export const collections = { docs };
