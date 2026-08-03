<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { withBase } from "vitepress";
import { courseManifest, learnerState, loadLearnerState, markLessonComplete, recordSection } from "../lib/courseStore.js";
const props = defineProps({ lessonId: { type: String, required: true } });
const lesson = courseManifest.lessons.find((item) => item.id === props.lessonId);
const module = courseManifest.modules.find((item) => item.lessonIds.includes(props.lessonId));
const completed = computed(() => learnerState.value?.completedLessons?.includes(props.lessonId));
const available = courseManifest.lessons.filter((item) => item.status === "available");
const index = available.findIndex((item) => item.id === props.lessonId);
const previous = available[index - 1];
const next = available[index + 1];
let headings = [];
let frame;

function updateSection() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    const threshold = Math.min(180, window.innerHeight * .28);
    const passed = headings.filter((heading) => heading.getBoundingClientRect().top <= threshold);
    const current = passed.at(-1)?.id || "welcome";
    recordSection(props.lessonId, current);
  });
}
function complete() { markLessonComplete(props.lessonId); }
onMounted(() => {
  loadLearnerState();
  headings = [...document.querySelectorAll(".VPDoc .vp-doc h2[id], .VPDoc .vp-doc h3[id]")];
  window.addEventListener("scroll", updateSection, { passive: true });
  window.addEventListener("hashchange", updateSection);
  setTimeout(updateSection, 100);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateSection);
  window.removeEventListener("hashchange", updateSection);
  cancelAnimationFrame(frame);
});
</script>

<template>
  <nav class="lesson-progress" aria-label="Lesson progress and navigation">
    <div class="lesson-crumbs"><a :href="withBase('/')">Home</a><span>›</span><a :href="withBase('/#roadmap')">{{ module.title }}</a><span>›</span><strong>Lesson {{ String(lesson.order).padStart(2, '0') }}</strong></div>
    <div class="lesson-progress__actions">
      <a v-if="previous" :href="withBase(previous.path)" :aria-label="`Previous lesson: ${previous.title}`">← Previous</a>
      <a :href="withBase('/#roadmap')">Roadmap</a>
      <button :disabled="completed" @click="complete">{{ completed ? 'Completed ✓' : 'Mark lesson complete' }}</button>
      <a v-if="next" :href="withBase(next.path)" :aria-label="`Next lesson: ${next.title}`">Next →</a>
    </div>
  </nav>
</template>
