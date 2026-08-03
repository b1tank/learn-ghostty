<script setup>
import { computed, ref } from "vue";
const props = defineProps({ lessons: { type: Array, required: true }, base: { type: String, default: "/" } });
const dialog = ref(null); const query = ref("");
const results = computed(() => { const q=query.value.trim().toLowerCase(); return q ? props.lessons.filter(x=>`${x.title} ${x.summary} ${x.module}`.toLowerCase().includes(q)) : props.lessons.filter(x=>x.status==='published'); });
function open(){dialog.value?.showModal();setTimeout(()=>dialog.value?.querySelector('input')?.focus())}
function url(path){return `${props.base.endsWith('/')?props.base:`${props.base}/`}${path.replace(/^\//,'')}`}
</script>
<template><button class="search-toggle" aria-label="Search lessons" @click="open">⌕</button><dialog ref="dialog" class="search-dialog" @click.self="dialog.close()"><input v-model="query" placeholder="Search lessons" aria-label="Search lessons"/><div class="search-results"><a v-for="lesson in results" :key="lesson.id" :href="lesson.status==='published'?url(`/lessons/${lesson.id}`):undefined"><strong>{{ lesson.title }}</strong><small>{{ lesson.module }} · {{ lesson.status }}</small></a></div></dialog></template>
