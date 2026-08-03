import { getCollection } from "astro:content";
import { moduleInfo, moduleOrder } from "../data/modules.js";

export async function getLessons() {
  const entries = await getCollection("lessons");
  return entries.map((entry) => ({ id: entry.id, ...entry.data })).sort((a, b) => a.order - b.order);
}
export function groupedLessons(lessons) {
  return moduleOrder.map((name) => ({ name, summary: moduleInfo[name], lessons: lessons.filter((lesson) => lesson.module === name) }));
}
