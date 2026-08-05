<script setup>
import { computed, ref } from "vue";
const props = defineProps({ path: String, line: { type: Number, default: 1 }, end: Number, label: String, note: String, base: { type: String, default: "/" }, sourceCommit: { type: String, required: true } });
const notice = ref("");
const finalLine = computed(() => props.end || props.line);
const viewUrl = computed(() => `${props.base}source?path=${encodeURIComponent(props.path)}&line=${props.line}&end=${finalLine.value}`);
const githubUrl = computed(() => `https://github.com/ghostty-org/ghostty/blob/${props.sourceCommit}/${props.path}#L${props.line}${finalLine.value > props.line ? `-L${finalLine.value}` : ""}`);
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
      <a :href="viewUrl"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 4.5h5.5A2.5 2.5 0 0 1 11 7v9H5a2 2 0 0 0-2 2V4.5Z"/><path d="M17 4.5h-3A3 3 0 0 0 11 7v9h4a2 2 0 0 1 2 2V4.5Z"/></svg><span>Read excerpt</span></a>
      <a :href="githubUrl" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M7 10h6m-3-3 3 3-3 3"/></svg><span>GitHub</span></a>
      <button @click="copy(localPath, 'Local ~/ghostty path copied')"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14v11H3z"/><path d="m6 9 2 2-2 2m4 0h4"/></svg><span>Copy local path</span></button>
      <button @click="copyAi"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="6" y="5" width="10" height="12" rx="2"/><path d="M6 14H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"/></svg><span>Copy for AI</span></button>
    </div>
    <span class="source-card__notice" aria-live="polite">{{ notice }}</span>
  </div>
</template>
