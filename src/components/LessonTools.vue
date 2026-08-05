<script setup>
import {computed,onBeforeUnmount,onMounted} from "vue";import CopyForAi from "./CopyForAi.vue";import {completeLesson,loadProgress,progressState,recordSection} from "../lib/progressStore.js";const props=defineProps({lesson:Object,lessons:Array,base:String,sourceCommit:String});const done=computed(()=>progressState.value?.completedLessons.includes(props.lesson.id));const url=p=>`${props.base.endsWith('/')?props.base:`${props.base}/`}${p.replace(/^\//,'')}`;let headings=[],frame;function update(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const passed=headings.filter(h=>h.getBoundingClientRect().top<=Math.min(180,innerHeight*.28));recordSection(props.lesson.id,passed.at(-1)?.id||'welcome')})}function complete(){completeLesson(props.lesson.id,props.lessons)}onMounted(()=>{loadProgress();headings=[...document.querySelectorAll('.sl-markdown-content h2[id],.sl-markdown-content h3[id]')];addEventListener('scroll',update,{passive:true});addEventListener('hashchange',update);setTimeout(update,100)});onBeforeUnmount(()=>{removeEventListener('scroll',update);removeEventListener('hashchange',update);cancelAnimationFrame(frame)});
</script>
<template>
  <div class="lesson-progress">
    <div class="lesson-progress__label">Lesson {{String(lesson.order).padStart(2,'0')}} · {{lesson.duration}}</div>
    <div class="lesson-progress__actions">
      <a :href="url('#roadmap')"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m3 5 4-2 6 2 4-2v12l-4 2-6-2-4 2V5Z"/><path d="M7 3v12m6-10v12"/></svg><span>Roadmap</span></a>
      <button :disabled="done" @click="complete"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="m6.5 10 2.2 2.2 4.8-4.8"/></svg><span>{{done?'Completed':'Mark lesson complete'}}</span></button>
      <CopyForAi :lesson="lesson" :base="base" :source-commit="sourceCommit"/>
    </div>
  </div>
</template>
