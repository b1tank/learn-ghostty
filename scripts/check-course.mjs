import { access, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(resolve(root, "course/manifest.json"), "utf8"));
const errors = [];

const actualCommit = execFileSync("git", ["-C", resolve(root, "ghostty"), "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (actualCommit !== manifest.course.sourceCommit) {
  errors.push(`Ghostty commit ${actualCommit} does not match ${manifest.course.sourceCommit}`);
}

for (const lesson of manifest.lessons) {
  for (const ref of lesson.sourceRefs ?? []) {
    try {
      const path = resolve(root, "ghostty", ref.path);
      await access(path);
      const lineCount = (await readFile(path, "utf8")).split("\n").length;
      if (!Number.isInteger(ref.line) || ref.line < 1 || ref.line > lineCount) {
        errors.push(`${lesson.id}: ${ref.path}:${ref.line} is outside 1..${lineCount}`);
      }
    } catch {
      errors.push(`${lesson.id}: missing Ghostty source ${ref.path}`);
    }
  }
}

if (errors.length) {
  console.error("Course validation failed:\n" + errors.map((item) => `  ✗ ${item}`).join("\n"));
  process.exit(1);
}

console.log(`✓ Ghostty source pin ${actualCommit.slice(0, 12)}`);
console.log(`✓ ${manifest.lessons.flatMap((item) => item.sourceRefs ?? []).length} source references`);
console.log(`✓ ${manifest.lessons.length} manifest lessons`);
