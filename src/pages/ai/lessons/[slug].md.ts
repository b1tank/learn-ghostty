import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cleanLessonMarkdown } from "../../../lib/cleanMarkdown.js";

const commit = "6ad1fe7d8cbda36c77b337a96c9bea8a77883699";

async function expandSnapshotComponents(raw: string) {
  const pattern = /<(CodeSnapshot|OutputPreview)\s+([\s\S]*?)\/>/g;
  let expanded = "";
  let cursor = 0;
  for (const match of raw.matchAll(pattern)) {
    expanded += raw.slice(cursor, match.index);
    const file = match[2].match(/file="([^"]+)"/)?.[1];
    if (!file) {
      expanded += match[0];
    } else {
      const content = (await readFile(resolve(file), "utf8")).trimEnd();
      expanded += `\n\n\`\`\`${match[1] === "CodeSnapshot" ? "zig" : "console"}\n${content}\n\`\`\`\n`;
    }
    cursor = (match.index ?? 0) + match[0].length;
  }
  return expanded + raw.slice(cursor);
}

export async function getStaticPaths() {
  const entries = await getCollection("docs", ({ id, data }) =>
    (id.startsWith("chapters/") || id.startsWith("field-guides/")) && data.status === "published"
  );
  return entries.map((entry) => ({ params: { slug: entry.id.split("/").at(-1) }, props: { entry } }));
}

export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry;
  const id = entry.id.split("/").at(-1);
  const raw = await expandSnapshotComponents(await readFile(resolve(`src/content/docs/${entry.id}.mdx`), "utf8"));
  const lesson = { id, contentId: entry.id, href: `/${entry.id}`, summary: entry.data.description, ...entry.data };
  return new Response(cleanLessonMarkdown(raw, lesson, commit), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
