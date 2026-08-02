<script setup>
import { computed, onMounted, ref } from "vue";
const data = ref(null);
const error = ref("");
onMounted(async () => {
  try {
    const response = await fetch("/api/course");
    if (!response.ok) throw new Error("course service unavailable");
    data.value = await response.json();
  } catch (cause) { error.value = cause.message; }
});
const lessonById = computed(() => Object.fromEntries((data.value?.manifest.lessons ?? []).map((lesson) => [lesson.id, lesson])));
function lessonState(id) { return data.value?.state.lessons?.[id]?.status ?? "not_started"; }
function evidenceFor(lesson) {
  const missionIds = lesson.missionIds ?? [];
  return missionIds.map((id) => data.value?.state.evidence?.[id]?.stage).filter(Boolean);
}
</script>

<template>
  <div v-if="error" class="service-warning" role="alert">Run <code>./camp serve</code> to load the course model.</div>
  <div v-else-if="data" class="course-map">
    <section v-for="module in data.manifest.modules" :key="module.id" class="course-module">
      <header><span>{{ String(data.manifest.modules.indexOf(module) + 1).padStart(2, '0') }}</span><div><h2>{{ module.title }}</h2><p>{{ module.promise }}</p></div></header>
      <div class="course-lessons">
        <component
          :is="lessonById[id].status === 'available' ? 'a' : 'article'"
          v-for="id in module.lessonIds"
          :key="id"
          :href="lessonById[id].status === 'available' ? lessonById[id].path : undefined"
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
