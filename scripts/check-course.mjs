import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import matter from "gray-matter";
import { cleanLessonMarkdown } from "../src/lib/cleanMarkdown.js";

const root = resolve(import.meta.dirname, "..");
const docsRoot = resolve(root, "src/content/docs");
const errors = [];
const upstreamCommit = "6ad1fe7d8cbda36c77b337a96c9bea8a77883699";
const actualCommit = execFileSync("git", ["-C", resolve(root, "ghostty"), "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (actualCommit !== upstreamCommit) errors.push(`Ghostty commit ${actualCommit} does not match ${upstreamCommit}`);

async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else if (entry.name.endsWith(".mdx")) result.push(path);
  }
  return result;
}

const contentFiles = (await walk(docsRoot)).filter((path) => path.includes("/chapters/") || path.includes("/field-guides/"));
const lessons = [];
const syntaxReferences = [];
for (const path of contentFiles) {
  const raw = await readFile(path, "utf8");
  const parsed = matter(raw);
  const data = parsed.data;
  const contentId = path.slice(docsRoot.length + 1, -4);
  const id = contentId.split("/").at(-1);
  lessons.push({ id, contentId, href: `/${contentId}`, summary: data.description, ...data });
  for (const key of ["order", "title", "description", "duration", "module", "status"]) {
    if (data[key] === undefined) errors.push(`${contentId}: missing ${key}`);
  }
  for (const ref of data.sourceRefs ?? []) {
    try {
      const sourcePath = resolve(root, "ghostty", ref.path);
      const lineCount = (await readFile(sourcePath, "utf8")).split("\n").length;
      if (ref.line < 1 || ref.line > lineCount) errors.push(`${contentId}: ${ref.path}:${ref.line} outside 1..${lineCount}`);
      if (ref.end && ref.end > lineCount) errors.push(`${contentId}: ${ref.path}:${ref.end} outside 1..${lineCount}`);
    } catch {
      errors.push(`${contentId}: missing source ${ref.path}`);
    }
  }
  for (const ref of data.historyRefs ?? []) {
    try {
      const source = execFileSync("git", ["-C", resolve(root, "ghostty"), "show", `${ref.commit}:${ref.path}`], { encoding: "utf8" });
      const lineCount = source.split("\n").length;
      if (ref.line < 1 || ref.line > lineCount) errors.push(`${contentId}: historical ${ref.path}:${ref.line} outside 1..${lineCount} at ${ref.commit}`);
      if (ref.end && ref.end > lineCount) errors.push(`${contentId}: historical ${ref.path}:${ref.end} outside 1..${lineCount} at ${ref.commit}`);
    } catch {
      errors.push(`${contentId}: missing historical source ${ref.commit}:${ref.path}`);
    }
  }
  if (contentId.startsWith("chapters/") && data.status === "published" && !(data.historyRefs?.length)) {
    errors.push(`${contentId}: a published reconstruction chapter requires at least one historical source reference`);
  }
  if (contentId.startsWith("chapters/") && data.status === "published") {
    const references = [...raw.matchAll(/<SyntaxBridge\b[^>]*\breference="([^"]+)"/g)].map((match) => match[1]);
    if (references.length !== 1) errors.push(`${contentId}: expected one SyntaxBridge reference link, found ${references.length}`);
    else syntaxReferences.push({ contentId, section: references[0] });
  }
  if (data.status === "published") {
    const clean = cleanLessonMarkdown(raw, { id, contentId, href: `/${contentId}`, summary: data.description, ...data }, upstreamCommit);
    if (/<(?:script|[A-Z][A-Za-z]+)\b/.test(clean)) errors.push(`${contentId}: AI Markdown contains implementation markup`);
    if (!clean.includes("~/learn-ghostty/") || !clean.includes("source_commit:")) errors.push(`${contentId}: AI Markdown missing local/pinned context`);
  }
}

const syntaxReference = await readFile(resolve(docsRoot, "zig-for-c.mdx"), "utf8");
if (!syntaxReference.includes("Zig `0.16.0`")) errors.push("zig-for-c: missing Zig 0.16.0 version scope");
const syntaxSectionIds = new Set([...syntaxReference.matchAll(/^## (.+)$/gm)].map((match) => match[1].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")));
for (const { contentId, section } of syntaxReferences) {
  if (!syntaxSectionIds.has(section)) errors.push(`${contentId}: Zig reference section #${section} is missing`);
}
const linkedChapters = new Set([...syntaxReference.matchAll(/\.\.\/chapters\/([^/)]+)\//g)].map((match) => match[1]));
const publishedChapters = lessons.filter((lesson) => lesson.contentId.startsWith("chapters/") && lesson.status === "published").map((lesson) => lesson.id);
for (const chapter of publishedChapters) if (!linkedChapters.has(chapter)) errors.push(`zig-for-c: missing link to chapter ${chapter}`);
for (const claim of ["does **not** require explicit types everywhere", "error is a checked union case", "not a promise that cleanup runs", "does not by itself promise a C ABI symbol", "additional pointer categories"]) {
  if (!syntaxReference.includes(claim)) errors.push(`zig-for-c: missing C-to-Zig correction: ${claim}`);
}

const orders = lessons.map((lesson) => lesson.order);
if (new Set(orders).size !== orders.length) errors.push("lesson order values must be unique");
if (lessons.length !== 16) errors.push(`expected 16 reconstruction/field-guide entries, found ${lessons.length}`);
if (lessons.filter((lesson) => lesson.status === "published").length !== 15) errors.push("expected eleven reconstruction chapters plus four published field guides");

const reconstructionRoot = resolve(root, "src/data/reconstruction");
const snapshotDirs = (await readdir(reconstructionRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
for (const entry of snapshotDirs) {
  const snapshotRoot = resolve(reconstructionRoot, entry.name);
  const snapshot = JSON.parse(await readFile(resolve(snapshotRoot, "manifest.json"), "utf8"));
  if (snapshot.upstream_commit !== upstreamCommit) errors.push(`${snapshot.chapter}: snapshot uses the wrong upstream commit`);
  for (const file of snapshot.files) {
    const snapshotPath = file.path.replace(/^src\//, "");
    try {
      const hash = createHash("sha256").update(await readFile(resolve(snapshotRoot, snapshotPath))).digest("hex");
      if (hash !== file.sha256) errors.push(`${snapshot.chapter}: snapshot hash mismatch for ${file.path}`);
    } catch {
      errors.push(`${snapshot.chapter}: missing snapshot for ${file.path}`);
    }
  }
  const outputHash = createHash("sha256").update(await readFile(resolve(snapshotRoot, "output.txt"))).digest("hex");
  if (outputHash !== snapshot.output_sha256) errors.push(`${snapshot.chapter}: output hash mismatch`);
  if (snapshot.screenshot_sha256) {
    const screenshotHash = createHash("sha256").update(await readFile(resolve(snapshotRoot, "screenshot.png"))).digest("hex");
    if (screenshotHash !== snapshot.screenshot_sha256) errors.push(`${snapshot.chapter}: screenshot hash mismatch`);
  }
}

if (errors.length) {
  console.error("Course validation failed:\n" + errors.map((error) => `  ✗ ${error}`).join("\n"));
  process.exit(1);
}
console.log(`✓ Ghostty source pin ${actualCommit.slice(0, 12)}`);
console.log(`✓ ${lessons.length} course entries (${lessons.filter((lesson) => lesson.status === "published").length} published)`);
console.log(`✓ ${lessons.flatMap((lesson) => lesson.sourceRefs ?? []).length} current and ${lessons.flatMap((lesson) => lesson.historyRefs ?? []).length} historical source references`);
console.log(`✓ Published AI Markdown is clean and carries pinned local/source context`);
console.log(`✓ ${snapshotDirs.length} reconstruction snapshots and outputs match their provenance hashes`);
