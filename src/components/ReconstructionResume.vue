<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { hasProgress, loadProgress } from '../lib/progressStore.js';
const props = defineProps({ lessons: { type: Array, required: true }, base: { type: String, required: true } });
const state = ref(null);
function sync() { state.value = { ...loadProgress() }; }
onMounted(() => { sync(); window.addEventListener('learn-ghostty-progress', sync); });
onUnmounted(() => window.removeEventListener('learn-ghostty-progress', sync));
const lesson = computed(() => props.lessons.find((item) => item.id === state.value?.currentLesson) || props.lessons[0]);
const visible = computed(() => state.value && hasProgress() && lesson.value);
const href = computed(() => {
  if (!lesson.value) return '#';
  const section = state.value?.lastSections?.[lesson.value.id];
  const root = props.base.endsWith('/') ? props.base : `${props.base}/`;
  return `${root}${lesson.value.href.replace(/^\/+/, '')}${section && section !== 'welcome' ? `#${section}` : ''}`;
});
const completed = computed(() => state.value?.completedLessons?.includes(lesson.value?.id));
</script>

<template>
  <aside v-if="visible" class="reconstruction-resume">
    <div><span>YOUR CHECKPOINT</span><strong>{{ lesson.title }}</strong></div>
    <a :href="href"><span>{{ completed ? 'Revisit chapter' : 'Continue chapter' }}</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4"/></svg></a>
  </aside>
</template>
