<script setup>
import { computed, onMounted } from "vue";
import { withBase } from "vitepress";
import { courseManifest, learnerState, loadLearnerState } from "../lib/courseStore.js";
onMounted(loadLearnerState);
const data = computed(() => learnerState.value ? { manifest: courseManifest, state: learnerState.value } : null);
const lessonById = computed(() => Object.fromEntries((data.value?.manifest.lessons ?? []).map((lesson) => [lesson.id, lesson])));
function lessonState(id) { return data.value?.state.lessons?.[id]?.status ?? "not_started"; }
function evidenceFor(lesson) {
  const missionIds = lesson.missionIds ?? [];
  return missionIds.map((id) => data.value?.state.evidence?.[id]?.stage).filter(Boolean);
}
</script>

<template>
  <div v-if="data" class="course-map">
    <section v-for="module in data.manifest.modules" :key="module.id" class="course-module">
      <header><span>{{ String(data.manifest.modules.indexOf(module) + 1).padStart(2, '0') }}</span><div><h2>{{ module.title }}</h2><p>{{ module.promise }}</p></div></header>
      <div class="course-lessons">
        <component
          :is="lessonById[id].status === 'available' ? 'a' : 'article'"
          v-for="id in module.lessonIds"
          :key="id"
          :href="lessonById[id].status === 'available' ? withBase(lessonById[id].path) : undefined"
          :class="['course-lesson', `is-${lessonById[id].status}`]"
        >
          <span class="course-lesson__day">DAY {{ lessonById[id].day }}</span>
          <div><h3>{{ lessonById[id].title }}</h3><p>{{ lessonById[id].subtitle }}</p></div>
          <div class="course-lesson__evidence">
            <template v-if="evidenceFor(lessonById[id]).length"><b v-for="stage in evidenceFor(lessonById[id])" :key="stage">{{ stage }}</b></template>
            <b v-else>{{ lessonState(id) === 'locked' ? 'locked' : lessonById[id].status }}</b>
          </div>
        </component>
      </div>
    </section>
  </div>
  <div v-else class="loading-state">Loading the learning path…</div>
</template>
