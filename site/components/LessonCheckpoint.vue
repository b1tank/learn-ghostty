<script setup>
import { ref } from "vue";
const props = defineProps({ step: String, nextStep: String, completion: Number, label: { type: String, default: "Save checkpoint" }, event: String });
const saved = ref(false);
const busy = ref(false);
async function save() {
  busy.value = true;
  const response = await fetch("/api/progress", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lessonId: "00-ghostty-overview", step: props.step, nextStep: props.nextStep, completion: props.completion, event: props.event || props.label })
  });
  saved.value = response.ok;
  busy.value = false;
}
</script>

<template>
  <div class="lesson-checkpoint"><div><span>CHECKPOINT</span><strong>{{ saved ? 'Progress saved to learner/state.json' : 'Ready to remember this point?' }}</strong></div><button :disabled="busy || saved" @click="save">{{ saved ? 'Saved ✓' : busy ? 'Saving…' : label }}</button></div>
</template>
