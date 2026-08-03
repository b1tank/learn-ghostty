<script setup>
import { computed, onMounted, ref } from "vue";
import manifest from "../../course/manifest.json";
const props = defineProps({ lab: String, title: String });
const running = ref(false);
const result = ref("");
const ok = ref(false);
const liveAvailable = ref(false);
const mode = ref("reference");
const definition = computed(() => manifest.labs[props.lab]);

onMounted(async () => {
  try {
    const response = await fetch("/api/health", { signal: AbortSignal.timeout(450) });
    liveAvailable.value = response.ok;
  } catch { liveAvailable.value = false; }
});

function runReference() {
  mode.value = "reference";
  result.value = definition.value?.referenceOutput || "No browser reference trace is bundled for this experiment.";
  ok.value = Boolean(definition.value?.referenceOutput);
}

async function runLive() {
  running.value = true; result.value = ""; mode.value = "live";
  try {
    const response = await fetch(`/api/labs/${props.lab}/run`, { method: "POST" });
    const value = await response.json(); result.value = value.output || value.error; ok.value = response.ok;
  } catch { result.value = "The optional live runner disconnected. The bundled reference trace remains available."; ok.value = false; liveAvailable.value = false; }
  running.value = false;
}
</script>
<template>
  <div class="lab-runner">
    <div class="lab-title">
      <div><span>SYSTEMS EXPERIMENT</span><h3>{{ title }}</h3><small>{{ definition?.referencePlatform }}</small></div>
      <div class="lab-actions"><button @click="runReference">Run reference trace</button><button v-if="liveAvailable" :disabled="running" @click="runLive">{{ running ? 'Running…' : 'Run live probe' }}</button></div>
    </div>
    <pre v-if="result" :class="{ passed: ok, failed: !ok }" role="status" aria-live="polite"><code>{{ result }}</code></pre>
    <p v-else>The website includes an authentic, deterministic trace so the mission works anywhere. If a local course service is already available, a live-run option appears automatically—never as a prerequisite.</p>
    <p v-if="result" class="lab-provenance"><strong>{{ mode === 'live' ? 'LIVE RESULT' : 'REFERENCE RESULT' }}</strong> {{ mode === 'live' ? 'Generated on this machine.' : 'Captured from the same checked-in C probe on Linux; identifiers are normalized for stable comparison.' }}</p>
  </div>
</template>
