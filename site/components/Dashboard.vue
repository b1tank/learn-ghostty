<script setup>
import { computed, onMounted, ref } from "vue";
import { withBase } from "vitepress";
import manifest from "../../course/manifest.json";
import ProgressRing from "./ProgressRing.vue";

const course = ref(null);
const mode = ref("loading");
const storageKey = "learn-ghostty.public-progress.v1";

function publicState() {
  const empty = {
    currentLesson: manifest.lessons[0].id,
    currentStep: "welcome",
    lessons: Object.fromEntries(manifest.lessons.map((lesson) => [lesson.id, {
      status: "not_started", completion: 0, mastery: 0, confidence: 0, completedSteps: [],
    }])),
  };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    return saved ? { ...empty, ...saved, lessons: { ...empty.lessons, ...saved.lessons } } : empty;
  } catch { return empty; }
}

async function loadCourse() {
  const hosted = window.location.hostname.endsWith("github.io");
  if (!hosted) {
    try {
      const response = await fetch("/api/course");
      if (!response.ok) throw new Error("course service unavailable");
      course.value = await response.json();
      mode.value = "local";
      return;
    } catch { /* Preview and static hosts intentionally fall back. */ }
  }
  course.value = { manifest, state: publicState() };
  mode.value = "public";
}

onMounted(loadCourse);

const current = computed(() => course.value?.manifest.lessons.find((item) => item.id === course.value.state.currentLesson));
const progress = computed(() => course.value?.state.lessons[current.value?.id] ?? {});
const completed = computed(() => Object.values(course.value?.state.lessons ?? {}).filter((item) => item.status === "completed").length);
const resumeUrl = computed(() => current.value ? `${withBase(current.value.path)}#${course.value?.state.currentStep || "welcome"}` : withBase("/"));
</script>

<template>
  <main class="cockpit-shell">
    <section class="cockpit-hero">
      <div class="eyebrow"><span class="pulse-dot"></span> VISUAL SYSTEMS COURSE</div>
      <h1>See the whole terminal.<br><em>Build every layer.</em></h1>
      <p class="hero-copy">A visual, source-backed path through Ghostty—from nineteenth-century wires to modern GPU pixels.</p>
      <div class="hero-actions">
        <a v-if="current" class="lg-button lg-button--primary" :href="resumeUrl">Continue your journey <span>→</span></a>
        <a class="lg-button lg-button--quiet" :href="withBase('/course-map')">Explore the map</a>
      </div>
    </section>

    <div v-if="mode === 'public'" class="service-warning public-mode-note" role="note">
      <span><strong>Public reading mode.</strong> Lessons, visuals, and browser progress work here. Clone the course and run <code>./camp open</code> for local source tools, durable progress, native labs, and Pi.</span>
      <a href="https://github.com/b1tank/learn-ghostty">Clone course ↗</a>
    </div>

    <section v-if="course && current" class="dashboard-grid">
      <article class="panel current-panel">
        <div class="panel-label">NOW LEARNING</div>
        <div class="lesson-number">00</div>
        <div class="current-copy">
          <h2>{{ current.title }}</h2>
          <p>{{ current.subtitle }}</p>
          <div class="lesson-meta"><span>◷ {{ current.estimatedMinutes }} min</span><span>◆ Visual + source tour</span></div>
          <a class="text-link" :href="resumeUrl">Resume at “{{ course.state.currentStep }}” →</a>
        </div>
        <ProgressRing :value="progress.completion" label="complete" />
      </article>

      <article class="panel metrics-panel">
        <div class="panel-label">YOUR SIGNAL</div>
        <div class="metric-row">
          <div><strong>{{ completed }}</strong><span>lessons complete</span></div>
          <div><strong>{{ progress.mastery ?? 0 }}%</strong><span>demonstrated mastery</span></div>
        </div>
        <div class="signal-note">Completion records where you traveled. Mastery records what you can explain and build.</div>
      </article>

      <article class="panel path-panel">
        <div class="panel-heading"><div><div class="panel-label">THE PATH AHEAD</div><h3>One machine, ten layers</h3></div><a :href="withBase('/course-map')">Full map →</a></div>
        <div class="path-track">
          <component
            :is="lesson.status === 'available' ? 'a' : 'div'"
            v-for="(lesson, index) in course.manifest.lessons"
            :key="lesson.id"
            :href="lesson.status === 'available' ? withBase(lesson.path) : undefined"
            :aria-disabled="lesson.status === 'planned' ? 'true' : undefined"
            :class="['path-stop', { active: lesson.id === current.id, locked: lesson.status === 'planned' }]"
          >
            <span class="stop-index">{{ String(index).padStart(2, '0') }}</span><span class="stop-dot"></span>
            <span class="stop-copy"><strong>{{ lesson.title }}</strong><small>{{ lesson.status === 'available' ? 'Ready now' : 'Built when you reach it' }}</small></span>
          </component>
        </div>
      </article>

      <article class="panel teacher-panel">
        <div class="teacher-orb">π</div>
        <div><div class="panel-label">PI IS YOUR TEACHER</div><h3>Ask beyond the page.</h3><p>In the local course, return to your terminal whenever a diagram raises a question. Pi knows the lesson, your progress, and the pinned Ghostty source.</p><code>what's next?</code></div>
      </article>
    </section>
    <section v-else class="loading-state">Tuning the terminal…</section>
  </main>
</template>
