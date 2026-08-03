<script setup>
import { computed, onMounted, ref } from "vue";
import { withBase } from "vitepress";
import { courseManifest, exportLearningRecord, hasLearnerProgress, learnerState, loadLearnerState, resetLearnerProgress } from "../lib/courseStore.js";

const resetDialog = ref(null);
onMounted(loadLearnerState);
const returning = computed(() => learnerState.value ? hasLearnerProgress() : false);
const currentLesson = computed(() => courseManifest.lessons.find((lesson) => lesson.id === learnerState.value?.currentLesson) ?? courseManifest.lessons[0]);
const currentSection = computed(() => learnerState.value?.lastSectionByLesson?.[currentLesson.value.id] || learnerState.value?.currentStep || "welcome");
const resumeUrl = computed(() => `${withBase(currentLesson.value.path)}#${currentSection.value}`);
const lessonById = Object.fromEntries(courseManifest.lessons.map((lesson) => [lesson.id, lesson]));
function status(lesson) {
  if (learnerState.value?.completedLessons?.includes(lesson.id)) return "Completed";
  if (learnerState.value?.currentLesson === lesson.id && returning.value) return "You are here";
  return lesson.status === "available" ? "Available" : "Planned";
}
function readableSection(value) {
  if (!value || value === "welcome") return "Lesson introduction";
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function restart() {
  resetLearnerProgress();
  resetDialog.value?.close();
}
</script>

<template>
  <main v-if="learnerState" class="home-course">
    <header class="home-intro">
      <div class="eyebrow"><span class="pulse-dot"></span> A SOURCE-BACKED LEARNING PATH</div>
      <h1>Understand Ghostty,<br><em>from PTY bytes to GPU pixels.</em></h1>
      <p>A visual, experiment-driven course for experienced engineers who are new to terminal-emulator internals. Learn the historical contracts, build causal models, and follow each boundary into real Ghostty source.</p>
      <div class="home-actions">
        <a class="lg-button lg-button--primary" :href="returning ? resumeUrl : withBase('/lessons/00-ghostty-overview')">{{ returning ? 'Resume learning' : 'Start learning' }} <span>→</span></a>
        <a class="lg-button lg-button--quiet" href="#roadmap">See what is covered</a>
      </div>
    </header>

    <section v-if="returning" class="resume-card">
      <div><span>WELCOME BACK</span><h2>{{ currentLesson.title }}</h2><p>You stopped at <strong>{{ readableSection(currentSection) }}</strong>.</p></div>
      <a class="lg-button lg-button--primary" :href="resumeUrl">Resume this section →</a>
    </section>

    <section class="home-explainer">
      <article><span>01</span><h2>What this is</h2><p>A guided path through how Ghostty transports bytes, interprets terminal protocols, maintains state, shapes text, renders with the GPU, and integrates with native platforms.</p></article>
      <article><span>02</span><h2>How to use it</h2><p>Read one idea at a time, predict before experiments, inspect the result, and then connect the same boundary to a narrow production-source excerpt.</p></article>
      <article><span>03</span><h2>Who it is for</h2><p>Senior and experienced engineers with general systems knowledge but no assumed background in PTYs, terminal emulation, Zig, font rendering, GPU pipelines, GTK, or SwiftUI.</p></article>
    </section>

    <section id="roadmap" class="home-roadmap">
      <header><div><span>THE COMPLETE PATH</span><h2>What you will learn</h2></div><p>Published lessons are always open. The order is recommended, never enforced.</p></header>
      <section v-for="module in courseManifest.modules" :key="module.id" class="roadmap-module">
        <div class="roadmap-module__title"><h3>{{ module.title }}</h3><p>{{ module.promise }}</p></div>
        <div class="roadmap-lessons">
          <component
            :is="lessonById[id].status === 'available' ? 'a' : 'div'"
            v-for="id in module.lessonIds"
            :key="id"
            :href="lessonById[id].status === 'available' ? withBase(lessonById[id].path) : undefined"
            :class="['roadmap-lesson', { current: learnerState.currentLesson === id && returning, completed: learnerState.completedLessons.includes(id) }]"
          >
            <span>{{ String(lessonById[id].order).padStart(2, '0') }}</span>
            <div><strong>{{ lessonById[id].title }}</strong><small>{{ lessonById[id].subtitle }}</small></div>
            <b>{{ status(lessonById[id]) }}</b>
          </component>
        </div>
      </section>
    </section>

    <section class="contributor-callout">
      <div><span>FOR REAL HUMAN CONTRIBUTORS</span><h2>Want to contribute to the Ghostty ecosystem?</h2><p>This path is designed to make you capable of tracing behavior, reproducing bugs, reading the relevant Zig or platform code, adding regression tests, and owning a change as a human—not merely generating a patch.</p></div>
      <div class="contributor-links">
        <a href="https://github.com/ghostty-org/ghostty/blob/main/CONTRIBUTING.md">Contribution guide ↗</a>
        <a href="https://github.com/ghostty-org/ghostty/blob/main/AI_POLICY.md">AI usage policy ↗</a>
        <a href="https://ghostty.org/docs">Official Ghostty docs ↗</a>
      </div>
    </section>

    <footer class="home-progress-tools">
      <div><strong>Your progress stays in this browser.</strong><span>Export a portable backup or restart the course whenever you want.</span></div>
      <div><button @click="exportLearningRecord">Export progress</button><button class="danger" @click="resetDialog?.showModal()">Restart progress</button></div>
    </footer>

    <dialog ref="resetDialog" class="reset-dialog">
      <form method="dialog"><button class="dialog-close" aria-label="Close reset dialog">×</button></form>
      <span>RESTART FROM SCRATCH</span><h2>Erase browser progress?</h2><p>This removes completed lessons, resume positions, and notebook answers from this browser. Export first if you may want them later.</p>
      <div><button @click="exportLearningRecord">Export backup</button><form method="dialog"><button>Cancel</button></form><button class="danger" @click="restart">Restart everything</button></div>
    </dialog>
  </main>
  <div v-else class="loading-state">Loading your learning roadmap…</div>
</template>
