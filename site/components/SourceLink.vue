<script setup>
import { computed, ref } from "vue";
const props = defineProps({ path: String, line: { type: Number, default: 1 }, end: Number, label: String, note: String });
const copied = ref(false);
const viewUrl = computed(() => `/source?path=${encodeURIComponent(props.path)}&line=${props.line}&end=${props.end || props.line}`);
async function copy() {
  await navigator.clipboard.writeText(`@ghostty/${props.path}:${props.line}`);
  copied.value = true;
  setTimeout(() => copied.value = false, 1500);
}
</script>

<template>
  <div class="source-card">
    <div class="source-card__icon">&lt;/&gt;</div>
    <div class="source-card__copy"><strong>{{ label || path }}</strong><code>{{ path }}:{{ line }}</code><small v-if="note">{{ note }}</small></div>
    <div class="source-card__actions"><a :href="viewUrl">Read source →</a><button @click="copy">{{ copied ? 'Copied' : 'Copy for Pi' }}</button></div>
  </div>
</template>
