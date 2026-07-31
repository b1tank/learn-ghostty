<script setup>
import { computed, onMounted, ref } from "vue";
import ProgressRing from "./ProgressRing.vue";

const course = ref(null);
const error = ref("");

async function loadCourse() {
  error.value = "";
  try {
    const response = await fetch("/api/course");
    if (!response.ok) throw new Error("course service unavailable");
    course.value = await response.json();
  } catch (cause) {
    error.value = cause.message;
  }
}

onMounted(loadCourse);

const current = computed(() => {
  if (!course.value) return null;
  return course.value.manifest.lessons.find((item) => item.id === course.value.state.currentLesson);
});
const progress = computed(() => course.value?.state.lessons[current.value?.id] ?? {});
const completed = computed(() => Object.values(course.value?.state.lessons ?? {}).filter((item) => item.status === "completed").length);
const resumeUrl = computed(() => current.value ? `${current.value.path}#${course.value?.state.currentStep || "welcome"}` : "/");
</script>

<template>
  <main class="cockpit-shell">
    <section class="cockpit-hero">
      <div class="eyebrow"><span class="pulse-dot"></span> YOUR LOCAL SYSTEMS LAB</div>
      <h1>See the whole terminal.<br><em>Build every layer.</em></h1>
      <p class="hero-copy">A visual, source-backed path through Ghostty—from nineteenth-century wires to modern GPU pixels.</p>
      <div class="hero-actions">
        <a v-if="current" class="button button-primary" :href="resumeUrl">Continue your journey <span>→</span></a>
        <a class="button button-quiet" href="/course-map">Explore the map</a>
      </div>
    </section>

    <div v-if="error" class="service-warning" role="alert">
      <span>Start the cockpit with <code>./camp serve</code> to connect durable progress.</span>
      <button type="button" @click="loadCourse">Retry connection</button>
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
        <div class="panel-heading"><div><div class="panel-label">THE PATH AHEAD</div><h3>One machine, ten layers</h3></div><a href="/course-map">Full map →</a></div>
        <div class="path-track">
          <component
            :is="lesson.status === 'available' ? 'a' : 'div'"
            v-for="(lesson, index) in course.manifest.lessons"
            :key="lesson.id"
            :href="lesson.status === 'available' ? lesson.path : undefined"
            :aria-disabled="lesson.status === 'planned' ? 'true' : undefined"
            :class="['path-stop', { active: lesson.id === current.id, locked: lesson.status === 'planned' }]"
          >
            <span class="stop-index">{{ String(index).padStart(2, '0') }}</span>
            <span class="stop-dot"></span>
            <span class="stop-copy"><strong>{{ lesson.title }}</strong><small>{{ lesson.status === 'available' ? 'Ready now' : 'Built when you reach it' }}</small></span>
          </component>
        </div>
      </article>

      <article class="panel teacher-panel">
        <div class="teacher-orb">π</div>
        <div><div class="panel-label">PI IS YOUR TEACHER</div><h3>Ask beyond the page.</h3><p>Return to your terminal whenever a diagram raises a question. Pi knows this lesson, your progress, and the pinned Ghostty source.</p><code>what's next?</code></div>
      </article>
    </section>

    <section v-else-if="!error" class="loading-state">Tuning the terminal…</section>
  </main>
</template>
