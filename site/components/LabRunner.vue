<script setup>
import { ref } from "vue";
const props = defineProps({ lab: String, title: String });
const running = ref(false); const result = ref(""); const ok = ref(false);
async function run() {
  if (window.location.hostname.endsWith("github.io")) {
    result.value = "Native checks need the pinned local checkout. Clone this course and run ./camp open, then return to this lesson.";
    ok.value = true; return;
  }
  running.value = true; result.value = "";
  try {
    const response = await fetch(`/api/labs/${props.lab}/run`, { method: "POST" });
    const value = await response.json(); result.value = value.output || value.error; ok.value = response.ok;
  } catch { result.value = "Start the local course with ./camp open to run this source check."; ok.value = false; }
  running.value = false;
}
</script>
<template>
  <div class="lab-runner">
    <div class="lab-title"><div><span>LOCAL CHECK</span><h3>{{ title }}</h3></div><button :disabled="running" @click="run">{{ running ? 'Running…' : 'Run against my checkout' }}</button></div>
    <pre v-if="result" :class="{ passed: ok, failed: !ok }" role="status" aria-live="polite"><code>{{ result }}</code></pre>
    <p v-else>This runs one allowlisted command against the pinned source. On the public site, it explains how to continue locally.</p>
  </div>
</template>
