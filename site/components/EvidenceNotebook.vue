<script setup>
import { computed, onMounted, ref } from "vue";
import { courseManifest, evidenceFor, loadLearnerState, saveMissionEvidence } from "../lib/courseStore.js";
const props = defineProps({ missionId: { type: String, required: true } });
const fieldInfo = {
  prediction: ["Prediction", "Before running or revealing: what did you expect, and why?"],
  observation: ["Observation", "Record concrete output or final state. Prefer identifiers, bytes, cells, and equalities over impressions."],
  explanation: ["Explanation", "Give a causal account in your own words. Name the boundary where meaning changed."],
  sourceInvariant: ["Source invariant", "State the production rule you found in the narrow Ghostty source read."]
};
const mission = ref(null);
const form = ref({ prediction: "", observation: "", explanation: "", sourceInvariant: "" });
const stage = ref("not_started");
const complete = ref(false);
const loading = ref(true);
const saving = ref(false);
const notice = ref("");
const error = ref("");
const requiredFields = computed(() => mission.value?.evidenceFields ?? []);

function load() {
  loading.value = true; error.value = "";
  try {
    loadLearnerState();
    mission.value = courseManifest.missions.find((item) => item.id === props.missionId);
    if (!mission.value) throw new Error("mission not found in course model");
    const evidence = evidenceFor(props.missionId);
    if (evidence) {
      for (const field of Object.keys(form.value)) form.value[field] = evidence[field] ?? "";
      stage.value = evidence.stage ?? "not_started";
      complete.value = Boolean(evidence.complete);
    }
  } catch (cause) { error.value = cause.message; }
  finally { loading.value = false; }
}
async function save() {
  saving.value = true; notice.value = ""; error.value = "";
  try {
    const evidence = saveMissionEvidence(props.missionId, form.value);
    stage.value = evidence.stage;
    complete.value = evidence.complete;
    notice.value = complete.value ? "Mission evidence complete. The next mission is now current." : `Saved at stage: ${stage.value}.`;
  } catch (cause) { error.value = cause.message; }
  finally { saving.value = false; }
}
async function copyForPi() {
  const claims = requiredFields.value.map((field) => `${fieldInfo[field][0]}: ${form.value[field] || '(not written)'}`).join("\n\n");
  await navigator.clipboard.writeText(`Interrogate my evidence for mission ${props.missionId}. Do not rewrite it for me. Ask one adversarial question at a time and check claims against the pinned Ghostty source.\n\n${claims}`);
  notice.value = "Evidence and review instructions copied for Pi.";
}
onMounted(load);
</script>

<template>
  <section class="evidence-notebook">
    <header><div><span>MISSION NOTEBOOK</span><h3>{{ mission?.title || missionId }}</h3></div><b :class="{ complete }">{{ complete ? 'complete' : stage.replace('_', ' ') }}</b></header>
    <p v-if="loading">Loading durable evidence…</p>
    <div v-else-if="error" class="evidence-error" role="alert">{{ error }} <button @click="load">Retry</button></div>
    <template v-else>
      <label v-for="field in requiredFields" :key="field"><span>{{ fieldInfo[field][0] }} <small>{{ fieldInfo[field][1] }}</small></span><textarea v-model="form[field]" rows="4"></textarea></label>
      <footer><span aria-live="polite">{{ notice || 'Saved privately in this browser. Export the full record from the dashboard anytime.' }}</span><div><button @click="copyForPi">Copy for Pi review</button><button class="primary" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save evidence' }}</button></div></footer>
    </template>
  </section>
</template>
