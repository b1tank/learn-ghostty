<script setup>
import { computed, ref } from "vue";
import { withBase } from "vitepress";
import manifest from "../../course/manifest.json";
const props = defineProps({ path: String, line: { type: Number, default: 1 }, end: Number, label: String, note: String });
const notice = ref("");
const finalLine = computed(() => props.end || props.line);
const viewUrl = computed(() => `${withBase('/source')}?path=${encodeURIComponent(props.path)}&line=${props.line}&end=${finalLine.value}`);
const githubUrl = computed(() => `https://github.com/ghostty-org/ghostty/blob/${manifest.course.sourceCommit}/${props.path}#L${props.line}${finalLine.value > props.line ? `-L${finalLine.value}` : ""}`);
const localPath = computed(() => `~/ghostty/${props.path}:${props.line}${finalLine.value > props.line ? `-${finalLine.value}` : ""}`);
async function copy(value, message) { await navigator.clipboard.writeText(value); notice.value = message; setTimeout(() => notice.value = "", 1600); }
function copyAi() {
  const value = `Learn Ghostty source context\n\nPage:\n${window.location.href}\n\nSource:\n${props.label || props.path}\n\nRemote:\n${githubUrl.value}\n\nLocal (assuming Ghostty is cloned at ~/ghostty):\n${localPath.value}\n\nWhat this excerpt is for:\n${props.note || "Inspect the named boundary and explain what invariant it preserves."}\n\nMy question:\n`;
  return copy(value, "Source context copied for AI");
}
</script>

<template>
  <div class="source-card">
    <div class="source-card__icon">&lt;/&gt;</div>
    <div class="source-card__copy"><strong>{{ label || path }}</strong><code>{{ path }}:{{ line }}{{ finalLine > line ? `–${finalLine}` : '' }}</code><small v-if="note">{{ note }}</small></div>
    <div class="source-card__actions">
      <a :href="viewUrl">Read excerpt</a>
      <a :href="githubUrl" target="_blank" rel="noreferrer">GitHub ↗</a>
      <button @click="copy(localPath, 'Local ~/ghostty path copied')">Copy local path</button>
      <button @click="copyAi">Copy for AI</button>
    </div>
    <span class="source-card__notice" aria-live="polite">{{ notice }}</span>
  </div>
</template>
