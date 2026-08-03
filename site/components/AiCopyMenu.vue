<script setup>
import { computed, onMounted, ref } from "vue";
import { withBase } from "vitepress";
import { courseManifest, learnerState, loadLearnerState } from "../lib/courseStore.js";
const props = defineProps({ lessonId: { type: String, required: true } });
const menu = ref(null);
const notice = ref("");
const markdown = ref("");
const lesson = courseManifest.lessons.find((item) => item.id === props.lessonId);
const sectionId = computed(() => learnerState.value?.lastSectionByLesson?.[props.lessonId] || (learnerState.value?.currentLesson === props.lessonId ? learnerState.value.currentStep : "welcome") || "welcome");
const pageUrl = computed(() => {
  if (typeof window === "undefined") return `https://b1tank.github.io/learn-ghostty${lesson.path}`;
  return `${window.location.origin}${withBase(lesson.path)}#${sectionId.value}`;
});
const markdownUrl = computed(() => withBase(`/ai/lessons/${props.lessonId}.md`));

function stripFrontmatter(value) { return value.replace(/^---[\s\S]*?---\s*/, "").trim(); }
function normalized(value) { return value.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim(); }
function currentSection(value) {
  const content = stripFrontmatter(value);
  const lines = content.split("\n");
  if (sectionId.value === "welcome") {
    const next = lines.findIndex((line) => /^##\s/.test(line));
    return lines.slice(0, next < 0 ? lines.length : next).join("\n").trim();
  }
  const headingText = document.getElementById(sectionId.value)?.textContent?.replace(/#$/, "").trim();
  let start = headingText ? lines.findIndex((line) => /^#{2,3}\s/.test(line) && normalized(line.replace(/^#+\s*/, "")) === normalized(headingText)) : -1;
  if (start < 0) start = lines.findIndex((line) => /^#{2,3}\s/.test(line) && normalized(line).includes(normalized(sectionId.value.replaceAll("-", " "))));
  if (start < 0) return content;
  const level = lines[start].match(/^#+/)[0].length;
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#+)\s/);
    if (match && match[1].length <= level) { end = index; break; }
  }
  return lines.slice(start, end).join("\n").trim();
}
function progressBlock(includeNotes = false) {
  const state = learnerState.value;
  const completed = state?.completedLessons ?? [];
  let result = `lesson_status: ${completed.includes(props.lessonId) ? "completed" : "in_progress"}\ncurrent_section: ${sectionId.value}\ncompleted_lessons: [${completed.join(", ")}]`;
  if (includeNotes) {
    const missionIds = lesson.missionIds ?? [];
    const notes = Object.fromEntries(missionIds.filter((id) => state?.evidence?.[id]).map((id) => [id, state.evidence[id]]));
    result += `\nlearner_notes: |\n${JSON.stringify(notes, null, 2).split("\n").map((line) => `  ${line}`).join("\n")}`;
  }
  return result;
}
function sourceBlock() {
  return (lesson.sourceRefs ?? []).map((source) => `- ${source.label}\n  - remote: https://github.com/ghostty-org/ghostty/blob/${courseManifest.course.sourceCommit}/${source.path}#L${source.line}\n  - local: ~/ghostty/${source.path}:${source.line}`).join("\n");
}
function context(section, includeNotes = false) {
  return `---\ncourse: Learn Ghostty\nlesson: "${String(lesson.order).padStart(2, "0")} · ${lesson.title}"\nsection: "${sectionId.value}"\npage_url: "${pageUrl.value}"\nlesson_markdown_url: "${new URL(markdownUrl.value, window.location.origin)}"\nlocal_course_path: "~/learn-ghostty/site${lesson.path}.md"\nlocal_ghostty_root: "~/ghostty"\nghostty_commit: "${courseManifest.course.sourceCommit}"\nprogress:\n${progressBlock(includeNotes).split("\n").map((line) => `  ${line}`).join("\n")}\n---\n\n# Current section\n\n${section}\n\n# Referenced Ghostty source\n\n${sourceBlock() || "No production source references in this section."}\n\n# My question\n\n`;
}
async function copy(value, message) {
  await navigator.clipboard.writeText(value);
  notice.value = message;
  menu.value?.removeAttribute("open");
  setTimeout(() => notice.value = "", 1800);
}
async function copySection(includeNotes = false) { await copy(context(currentSection(markdown.value), includeNotes), includeNotes ? "Section and notes copied" : "Current section copied for AI"); }
async function copyFull() { await copy(`${markdown.value.trim()}\n\n---\n\n## Learning context\n\n${progressBlock(false)}\n`, "Full lesson copied as Markdown"); }
async function copyUrl() { await copy(pageUrl.value, "Page URL copied"); }
async function copyLocalPath() { await copy(`~/learn-ghostty/site${lesson.path}.md`, "Local course path copied"); }
onMounted(async () => {
  loadLearnerState();
  const response = await fetch(markdownUrl.value);
  markdown.value = response.ok ? await response.text() : `# ${lesson.title}\n\n${lesson.subtitle}`;
});
</script>

<template>
  <div class="ai-copy-menu">
    <button class="ai-copy-primary" :disabled="!markdown" title="Copy the current section as AI-ready Markdown" @click="copySection(false)"><span class="ai-copy-icon" aria-hidden="true"></span> Copy for AI</button>
    <details ref="menu">
      <summary aria-label="More Copy for AI options">⌄</summary>
      <div class="ai-copy-popover">
        <button @click="copySection(false)"><strong>Copy current section</strong><small>Focused Markdown, progress, paths, and sources</small></button>
        <button @click="copyFull"><strong>Copy full lesson</strong><small>Complete AI-clean lesson Markdown</small></button>
        <button @click="copySection(true)"><strong>Copy section + my notes</strong><small>Explicitly include notebook answers</small></button>
        <a :href="markdownUrl" target="_blank"><strong>View as Markdown ↗</strong><small>Open the AI-clean plaintext lesson</small></a>
        <button @click="copyUrl"><strong>Copy page link</strong><small>Exact lesson and section URL</small></button>
        <button @click="copyLocalPath"><strong>Copy local course path</strong><small>For agents running in ~/learn-ghostty</small></button>
      </div>
    </details>
    <span class="ai-copy-notice" aria-live="polite">{{ notice }}</span>
  </div>
</template>
