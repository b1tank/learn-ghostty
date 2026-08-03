<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { loadProgress, progressState } from "../lib/progressStore.js";

const props = defineProps({ lesson: { type: Object, required: true }, base: { type: String, default: "/" }, sourceCommit: { type: String, required: true } });
const root = ref(null);
const trigger = ref(null);
const popup = ref(null);
const open = ref(false);
const notice = ref("");
const markdown = ref("");
const popupStyle = ref({ left: "12px", top: "12px", width: "320px" });
const lesson = props.lesson;
const sectionId = computed(() => progressState.value?.lastSections?.[lesson.id] || (progressState.value?.currentLesson === lesson.id ? progressState.value.currentSection : "welcome") || "welcome");
const pageUrl = computed(() => {
  const path = `${props.base}lessons/${lesson.id}`;
  if (typeof window === "undefined") return `https://b1tank.github.io${path}#${sectionId.value}`;
  return `${window.location.origin}${path}#${sectionId.value}`;
});
const markdownUrl = computed(() => `${props.base}ai/lessons/${lesson.id}.md`);

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
function progressBlock() {
  const state = progressState.value;
  const completed = state?.completedLessons ?? [];
  return `lesson_status: ${completed.includes(lesson.id) ? "completed" : "in_progress"}\ncurrent_section: ${sectionId.value}\ncompleted_lessons: [${completed.join(", ")}]`;
}
function sourceBlock() {
  return (lesson.sourceRefs ?? []).map((source) => `- ${source.label}\n  - remote: https://github.com/ghostty-org/ghostty/blob/${props.sourceCommit}/${source.path}#L${source.line}\n  - local: ~/ghostty/${source.path}:${source.line}`).join("\n");
}
function context(section) {
  return `---\ncourse: Learn Ghostty\nlesson: "${String(lesson.order).padStart(2, "0")} · ${lesson.title}"\nsection: "${sectionId.value}"\npage_url: "${pageUrl.value}"\nlesson_markdown_url: "${new URL(markdownUrl.value, window.location.origin)}"\nlocal_course_path: "~/learn-ghostty/src/content/docs/lessons/${lesson.id}.mdx"\nlocal_ghostty_root: "~/ghostty"\nghostty_commit: "${props.sourceCommit}"\nprogress:\n${progressBlock().split("\n").map((line) => `  ${line}`).join("\n")}\n---\n\n# Current section\n\n${section}\n\n# Referenced Ghostty source\n\n${sourceBlock() || "No production source references in this section."}\n\n# My question\n\n`;
}
async function copy(value, message) {
  await navigator.clipboard.writeText(value);
  notice.value = message;
  closeMenu(false);
  setTimeout(() => notice.value = "", 1800);
}
async function copySection() { await copy(context(currentSection(markdown.value)), "Current section copied for AI"); }
async function copyFull() { await copy(`${markdown.value.trim()}\n\n---\n\n## Learning context\n\n${progressBlock()}\n`, "Full lesson copied as Markdown"); }
async function copyUrl() { await copy(pageUrl.value, "Page URL copied"); }
async function copyLocalPath() { await copy(`~/learn-ghostty/src/content/docs/lessons/${lesson.id}.mdx`, "Local course path copied"); }

async function positionPopup() {
  if (!open.value || !trigger.value) return;
  const anchor = trigger.value.getBoundingClientRect();
  const margin = 12;
  const gap = 7;
  const width = Math.min(340, window.innerWidth - margin * 2);
  const left = Math.max(margin, Math.min(anchor.right - width, window.innerWidth - width - margin));
  let top = anchor.bottom + gap;
  popupStyle.value = { left: `${Math.round(left)}px`, top: `${Math.round(top)}px`, width: `${Math.round(width)}px` };
  await nextTick();
  const height = popup.value?.getBoundingClientRect().height || 0;
  if (top + height > window.innerHeight - margin && anchor.top - height - gap >= margin) top = anchor.top - height - gap;
  popupStyle.value = { left: `${Math.round(left)}px`, top: `${Math.round(top)}px`, width: `${Math.round(width)}px` };
}
async function toggleMenu() {
  open.value = !open.value;
  if (open.value) {
    await positionPopup();
    await nextTick();
    popup.value?.querySelector('[role="menuitem"]')?.focus();
  }
}
function closeMenu(returnFocus = true) {
  if (!open.value) return;
  open.value = false;
  if (returnFocus) nextTick(() => trigger.value?.focus());
}
function onDocumentPointer(event) {
  if (!open.value) return;
  if (!root.value?.contains(event.target) && !popup.value?.contains(event.target)) closeMenu(false);
}
function onKeydown(event) {
  if (!open.value) return;
  if (event.key === "Escape") { event.preventDefault(); closeMenu(); return; }
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const items = [...popup.value.querySelectorAll('[role="menuitem"]')];
  const current = items.indexOf(document.activeElement);
  const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowDown" ? (current + 1) % items.length : (current - 1 + items.length) % items.length;
  items[next]?.focus();
}
function onViewportChange() { if (open.value) positionPopup(); }

onMounted(async () => {
  loadProgress();
  const response = await fetch(markdownUrl.value);
  markdown.value = response.ok ? await response.text() : `# ${lesson.title}\n\n${lesson.summary}`;
  document.addEventListener("pointerdown", onDocumentPointer);
  document.addEventListener("keydown", onKeydown);
  window.addEventListener("resize", onViewportChange);
  window.addEventListener("scroll", onViewportChange, true);
});
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocumentPointer);
  document.removeEventListener("keydown", onKeydown);
  window.removeEventListener("resize", onViewportChange);
  window.removeEventListener("scroll", onViewportChange, true);
});
</script>

<template>
  <div ref="root" class="ai-copy-menu">
    <button class="ai-copy-primary" :disabled="!markdown" title="Copy the current section as AI-ready Markdown" @click="copySection"><span class="ai-copy-icon" aria-hidden="true"></span> Copy for AI</button>
    <button ref="trigger" class="ai-copy-trigger" aria-label="More Copy for AI options" aria-haspopup="menu" :aria-expanded="open" @click="toggleMenu">⌄</button>
    <span class="ai-copy-notice" aria-live="polite">{{ notice }}</span>
    <Teleport to="body">
      <div v-if="open" ref="popup" class="ai-copy-popover" role="menu" aria-label="Copy for AI options" :style="popupStyle">
        <button role="menuitem" @click="copySection"><strong>Copy current section</strong><small>Focused Markdown, progress, paths, and sources</small></button>
        <button role="menuitem" @click="copyFull"><strong>Copy full lesson</strong><small>Complete AI-clean lesson Markdown</small></button>
        <a role="menuitem" :href="markdownUrl" target="_blank"><strong>View as Markdown ↗</strong><small>Open the AI-clean plaintext lesson</small></a>
        <button role="menuitem" @click="copyUrl"><strong>Copy page link</strong><small>Exact lesson and section URL</small></button>
        <button role="menuitem" @click="copyLocalPath"><strong>Copy local course path</strong><small>For agents running in ~/learn-ghostty</small></button>
      </div>
    </Teleport>
  </div>
</template>
