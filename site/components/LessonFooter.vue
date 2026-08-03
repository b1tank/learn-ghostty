<script setup>
import { withBase } from "vitepress";
import { courseManifest } from "../lib/courseStore.js";
const props = defineProps({ lessonId: { type: String, required: true } });
const available = courseManifest.lessons.filter((item) => item.status === "available");
const index = available.findIndex((item) => item.id === props.lessonId);
const previous = available[index - 1];
const next = available[index + 1];
</script>
<template>
  <nav class="lesson-footer-nav" aria-label="Previous and next lessons">
    <a v-if="previous" :href="withBase(previous.path)"><span>PREVIOUS LESSON</span><strong>← {{ previous.title }}</strong></a>
    <a v-else :href="withBase('/#roadmap')"><span>COURSE</span><strong>← Back to roadmap</strong></a>
    <a v-if="next" class="next" :href="withBase(next.path)"><span>NEXT LESSON</span><strong>{{ next.title }} →</strong></a>
    <a v-else class="next" :href="withBase('/#roadmap')"><span>COURSE</span><strong>Back to roadmap →</strong></a>
  </nav>
</template>
