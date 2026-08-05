import { getCollection } from "astro:content";
import { moduleInfo, moduleOrder } from "../data/modules.js";

export async function getLessons() {
  const entries = await getCollection("docs", ({ id }) => id.startsWith("chapters/") || id.startsWith("field-guides/"));
  return entries.map((entry) => ({
    id: entry.id.split("/").at(-1),
    contentId: entry.id,
    href: `/${entry.id}`,
    summary: entry.data.description,
    ...entry.data,
  })).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export function groupedLessons(lessons) {
  return moduleOrder.map((name) => ({ name, summary: moduleInfo[name], lessons: lessons.filter((lesson) => lesson.module === name) }));
}
