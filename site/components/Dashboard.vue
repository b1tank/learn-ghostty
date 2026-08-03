<script setup>
import { computed, onMounted } from "vue";
import { withBase } from "vitepress";
import { courseManifest, exportLearningRecord, learnerState, loadLearnerState } from "../lib/courseStore.js";

onMounted(loadLearnerState);
const course = computed(() => learnerState.value ? { manifest: courseManifest, state: learnerState.value } : null);

const currentLesson = computed(() => course.value?.manifest.lessons.find((item) => item.id === course.value.state.currentLesson));
const currentMission = computed(() => course.value?.manifest.missions.find((item) => item.id === course.value.state.currentMission));
const evidence = computed(() => course.value?.state.evidence?.[currentMission.value?.id] ?? { stage: "not_started", complete: false });
const resumeUrl = computed(() => currentLesson.value ? `${withBase(currentLesson.value.path)}#${course.value?.state.currentStep || "welcome"}` : withBase("/"));
const activity = computed(() => course.value?.state.activity?.[0]);
const nextLessons = computed(() => course.value?.manifest.lessons.filter((lesson) => lesson.order >= (currentLesson.value?.order ?? 0)).slice(0, 4) ?? []);
const stageOrder = ["not_started", "predicted", "observed", "explained", "traced", "modified"];
function reached(stage) { return stageOrder.indexOf(evidence.value.stage) >= stageOrder.indexOf(stage); }
</script>

<template>
  <main class="learner-cockpit">
    <template v-if="course && currentLesson && currentMission">
      <header class="mission-hero">
        <div class="eyebrow"><span class="pulse-dot"></span> CURRENT MISSION · DAY {{ currentLesson.day }}</div>
        <h1>{{ currentMission.title }}</h1>
        <p>{{ currentMission.question }}</p>
        <div class="mission-actions">
          <a class="lg-button lg-button--primary" :href="resumeUrl">Resume mission <span>→</span></a>
          <code>Progress saves automatically in this browser.</code>
        </div>
      </header>

      <section class="learner-grid">
        <article class="learner-panel evidence-panel">
          <div class="panel-label">EVIDENCE, NOT POINTS</div>
          <h2>{{ evidence.complete ? 'Mission evidence complete' : 'What your record proves so far' }}</h2>
          <div class="evidence-ladder">
            <div :class="{ reached: reached('observed') }"><i>01</i><strong>Observe</strong><span>Capture what the system actually did.</span></div>
            <div :class="{ reached: reached('explained') }"><i>02</i><strong>Explain</strong><span>Give a causal account in your own words.</span></div>
            <div :class="{ reached: reached('traced') }"><i>03</i><strong>Trace</strong><span>Find the same invariant in Ghostty.</span></div>
            <div :class="{ reached: reached('modified') }"><i>04</i><strong>Modify</strong><span>Change behavior and preserve the invariant.</span></div>
          </div>
        </article>

        <article class="learner-panel context-panel">
          <div class="panel-label">LAST PROVED</div>
          <template v-if="activity"><h2>{{ activity.event }}</h2><p>{{ new Date(activity.at).toLocaleString() }}</p></template>
          <template v-else><h2>Nothing yet—and that is honest.</h2><p>Your first explanation will appear here after you produce it.</p></template>
          <div class="context-divider"></div>
          <div class="panel-label">YOUR RECORD</div>
          <p>Evidence stays in this browser. Export it anytime for backup or optional Pi review.</p>
          <button class="record-export" @click="exportLearningRecord">Export evidence JSON</button>
          <div class="context-divider"></div>
          <div class="panel-label">OPTIONAL PI REVIEW</div>
          <p>When you want a teacher, copy a notebook entry into Pi and ask it to attack the weakest claim. The website does not depend on it.</p>
        </article>

        <article class="learner-panel system-panel">
          <div class="panel-heading"><div><div class="panel-label">THE TRACE YOU ARE BUILDING</div><h2>Program output becomes light</h2></div><a :href="withBase('/course-map')">Course map →</a></div>
          <div class="system-trace" aria-label="Terminal output path">
            <span>PROGRAM</span><b>bytes</b><span>PTY</span><b>bytes</b><span>PARSER</span><b>actions</b><span>STATE</span><b>glyphs</b><span>GPU</span><b>frame</b><span>YOU</span>
          </div>
          <p>Each lesson turns one arrow from a label into something you have run, explained, and found in source.</p>
        </article>

        <article class="learner-panel queue-panel">
          <div class="panel-label">LEARNING QUEUE</div>
          <div class="queue-list">
            <component :is="lesson.status === 'available' ? 'a' : 'div'" v-for="lesson in nextLessons" :key="lesson.id" :href="lesson.status === 'available' ? withBase(lesson.path) : undefined" :class="{ current: lesson.id === currentLesson.id }">
              <span>{{ String(lesson.order).padStart(2, '0') }}</span><div><strong>{{ lesson.title }}</strong><small>{{ lesson.subtitle }}</small></div><b>{{ lesson.id === currentLesson.id ? 'NOW' : lesson.status === 'available' ? 'READY' : 'PLANNED' }}</b>
            </component>
          </div>
        </article>
      </section>
    </template>
    <div v-else class="loading-state">Loading your browser learning record…</div>
  </main>
</template>
