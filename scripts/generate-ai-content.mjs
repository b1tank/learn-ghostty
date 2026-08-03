import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(resolve(root, "course/manifest.json"), "utf8"));
const outDir = resolve(root, "site/public/ai/lessons");
await mkdir(outDir, { recursive: true });

function attr(tag, name) {
  return tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
}
function sourceBlock(tag) {
  const path = attr(tag, "path");
  const line = Number(tag.match(/:line="(\d+)"/)?.[1] || attr(tag, "line") || 1);
  const end = Number(tag.match(/:end="(\d+)"/)?.[1] || attr(tag, "end") || line);
  const label = attr(tag, "label") || path;
  const note = attr(tag, "note") || "";
  const commit = manifest.course.sourceCommit;
  return `\n**Ghostty source — ${label}**\n\n- Remote: https://github.com/ghostty-org/ghostty/blob/${commit}/${path}#L${line}${end > line ? `-L${end}` : ""}\n- Local: \`~/ghostty/${path}:${line}${end > line ? `-${end}` : ""}\`\n${note ? `- Read for: ${note}\n` : ""}`;
}
function clean(source, lesson) {
  let text = source
    .replace(/^---[\s\S]*?---\s*/, "")
    .replace(/<script setup>[\s\S]*?<\/script>\s*/, "")
    .replace(/<div[^>]*class="lesson-hero[^"]*"[^>]*>[\s\S]*?<h1>([\s\S]*?)<\/h1>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/div>\s*<\/div>/, (_all, heading, lead) => `# ${heading.replace(/<br\s*\/?>(\s*)/g, " ").replace(/<[^>]+>/g, "").trim()}\n\n> ${lead.replace(/<[^>]+>/g, "").trim()}\n`)
    .replace(/<SourceLink[\s\S]*?\/>/g, sourceBlock)
    .replace(/<ArchitectureExplorer\s*\/>/g, "\n> **Interactive on the website:** explore each architecture layer and its data boundary.\n")
    .replace(/<ByteWorkbench\s*\/>/g, "\n> **Interactive on the website:** edit and step terminal byte sequences through parser state, style, cursor, and cells.\n")
    .replace(/<LabRunner[\s\S]*?\/>/g, (tag) => `\n> **Systems experiment on the website:** ${attr(tag, "title") || attr(tag, "lab")}.\n`)
    .replace(/<EvidenceNotebook[\s\S]*?\/>/g, (tag) => `\n> **Notebook on the website:** save evidence for mission \`${attr(tag, "mission-id")}\`.\n`)
    .replace(/<PredictionCard[\s\S]*?\/>/g, (tag) => `\n> **Pause and predict:** ${attr(tag, "question") || "Write a prediction before revealing the result."}\n`)
    .replace(/<LessonProgress[\s\S]*?\/>/g, "")
    .replace(/<AiCopyMenu[\s\S]*?\/>/g, "")
    .replace(/<LessonFooter[\s\S]*?\/>/g, "")
    .replace(/<span[^>]*class="lesson-anchor"[^>]*><\/span>/g, "")
    .replace(/<div[^>]*class="lesson-finish"[^>]*>/g, "\n")
    .replace(/<\/?(?:div|span|em|strong)[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const header = `---\ncourse: Learn Ghostty\nlesson_id: ${lesson.id}\ntitle: "${lesson.title.replaceAll('"', '\\"')}"\nsource_commit: ${manifest.course.sourceCommit}\ncanonical_url: https://b1tank.github.io/learn-ghostty${lesson.path}\nlocal_course_path: ~/learn-ghostty/site${lesson.path}.md\n---\n\n`;
  return `${header}${text}\n`;
}

for (const lesson of manifest.lessons.filter((item) => item.status === "available")) {
  const sourcePath = resolve(root, "site", `${lesson.path.replace(/^\//, "")}.md`);
  const output = clean(await readFile(sourcePath, "utf8"), lesson);
  await writeFile(resolve(outDir, `${lesson.id}.md`), output);
}
console.log(`✓ generated AI-clean Markdown for ${manifest.lessons.filter((item) => item.status === "available").length} lessons`);
