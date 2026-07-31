<script setup>
import { onMounted, ref } from "vue";
const props = defineProps({ step: String, nextStep: String, completion: Number, label: { type: String, default: "Save checkpoint" }, event: String });
const saved = ref(false);
const busy = ref(false);
const error = ref("");

async function hydrate() {
  try {
    const response = await fetch("/api/course");
    if (!response.ok) return;
    const value = await response.json();
    saved.value = value.state.lessons?.["00-ghostty-overview"]?.completedSteps?.includes(props.step) ?? false;
  } catch {
    // The visible save action remains available and will report a useful error.
  }
}

async function save() {
  busy.value = true;
  error.value = "";
  try {
    const response = await fetch("/api/progress", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: "00-ghostty-overview", step: props.step, nextStep: props.nextStep, completion: props.completion, event: props.event || props.label })
    });
    if (!response.ok) throw new Error("The course service could not save this checkpoint.");
    saved.value = true;
  } catch (cause) {
    error.value = `${cause.message} Keep this page open and retry after running ./camp serve.`;
  } finally {
    busy.value = false;
  }
}

onMounted(hydrate);
</script>

<template>
  <div :id="`checkpoint-${step}`" class="lesson-checkpoint">
    <div><span>CHECKPOINT</span><strong>{{ saved ? 'Progress saved to learner/state.json' : 'Ready to remember this point?' }}</strong><small v-if="error" role="alert">{{ error }}</small></div>
    <button :disabled="busy || saved" @click="save">{{ saved ? 'Saved ✓' : busy ? 'Saving…' : label }}</button>
    <span class="visually-hidden" aria-live="polite">{{ saved ? `${label} saved` : error }}</span>
  </div>
</template>
