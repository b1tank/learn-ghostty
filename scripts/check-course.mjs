import { access, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(resolve(root, "course/manifest.json"), "utf8"));
const state = JSON.parse(await readFile(resolve(root, "learner/state.json"), "utf8"));
const errors = [];
const lessonIds = new Set(manifest.lessons.map((lesson) => lesson.id));
const missionIds = new Set(manifest.missions.map((mission) => mission.id));
const moduleLessonIds = manifest.modules.flatMap((module) => module.lessonIds);

for (const id of moduleLessonIds) if (!lessonIds.has(id)) errors.push(`module references unknown lesson ${id}`);
for (const id of lessonIds) if (moduleLessonIds.filter((value) => value === id).length !== 1) errors.push(`lesson ${id} must appear in exactly one module`);
for (const lesson of manifest.lessons) {
  for (const id of lesson.missionIds) if (!missionIds.has(id)) errors.push(`lesson ${lesson.id} references unknown mission ${id}`);
}
for (const mission of manifest.missions) {
  if (!lessonIds.has(mission.lessonId)) errors.push(`mission ${mission.id} references unknown lesson ${mission.lessonId}`);
  if (!manifest.lessons.find((lesson) => lesson.id === mission.lessonId)?.missionIds.includes(mission.id)) errors.push(`mission ${mission.id} is not listed by its lesson`);
  for (const field of mission.evidenceFields) if (!["prediction", "observation", "explanation", "sourceInvariant"].includes(field)) errors.push(`mission ${mission.id} has unknown evidence field ${field}`);
  if (mission.labId && !manifest.labs[mission.labId]) errors.push(`mission ${mission.id} references unknown lab ${mission.labId}`);
}
if (!lessonIds.has(state.currentLesson)) errors.push(`learner state references unknown lesson ${state.currentLesson}`);
if (!missionIds.has(state.currentMission)) errors.push(`learner state references unknown mission ${state.currentMission}`);

const actualCommit = execFileSync("git", ["-C", resolve(root, "ghostty"), "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (actualCommit !== manifest.course.sourceCommit) {
  errors.push(`Ghostty commit ${actualCommit} does not match ${manifest.course.sourceCommit}`);
}

for (const lesson of manifest.lessons) {
  if (lesson.status === "available") {
    const lessonPage = resolve(root, "site", `${lesson.path.replace(/^\//, "")}.md`);
    try {
      await access(lessonPage);
    } catch {
      errors.push(`${lesson.id}: available lesson page is missing at ${lessonPage}`);
    }
    const aiPage = resolve(root, "site/public/ai/lessons", `${lesson.id}.md`);
    try {
      const aiContent = await readFile(aiPage, "utf8");
      if (/<(?:script|[A-Z][A-Za-z]+)\b/.test(aiContent)) errors.push(`${lesson.id}: AI Markdown contains implementation markup`);
      if (!aiContent.includes("local_course_path: ~/learn-ghostty/")) errors.push(`${lesson.id}: AI Markdown is missing local course context`);
    } catch {
      errors.push(`${lesson.id}: generated AI Markdown is missing; run npm run generate:ai`);
    }
  }
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
console.log(`✓ ${manifest.modules.length} modules, ${manifest.lessons.length} lessons (${manifest.lessons.filter((item) => item.status === "available").length} available), ${manifest.missions.length} missions`);
