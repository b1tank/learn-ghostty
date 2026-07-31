<script setup>
import { onMounted, ref } from "vue";
const props = defineProps({ step: String, nextStep: String, completion: Number, label: { type: String, default: "Save checkpoint" }, event: String });
const saved = ref(false);
const busy = ref(false);
const error = ref("");
const mode = ref("local");
const storageKey = "learn-ghostty.public-progress.v1";

function browserState() {
  try { return JSON.parse(localStorage.getItem(storageKey) || "null") || { currentLesson: "00-ghostty-overview", currentStep: "welcome", lessons: {} }; }
  catch { return { currentLesson: "00-ghostty-overview", currentStep: "welcome", lessons: {} }; }
}

async function hydrate() {
  if (!window.location.hostname.endsWith("github.io")) {
    try {
      const response = await fetch("/api/course");
      if (response.ok) {
        const value = await response.json();
        saved.value = value.state.lessons?.["00-ghostty-overview"]?.completedSteps?.includes(props.step) ?? false;
        return;
      }
    } catch { /* Use browser progress below. */ }
  }
  mode.value = "browser";
  saved.value = browserState().lessons?.["00-ghostty-overview"]?.completedSteps?.includes(props.step) ?? false;
}

function saveInBrowser() {
  const state = browserState();
  const lesson = state.lessons["00-ghostty-overview"] || { status: "not_started", completion: 0, mastery: 0, confidence: 0, completedSteps: [] };
  lesson.status = lesson.status === "not_started" ? "in_progress" : lesson.status;
  lesson.completion = Math.max(lesson.completion || 0, props.completion || 0);
  lesson.completedSteps = [...new Set([...(lesson.completedSteps || []), props.step])];
  state.currentLesson = "00-ghostty-overview";
  state.currentStep = props.nextStep || props.step;
  state.lessons["00-ghostty-overview"] = lesson;
  localStorage.setItem(storageKey, JSON.stringify(state));
  saved.value = true;
}

async function save() {
  busy.value = true; error.value = "";
  if (mode.value === "browser") { saveInBrowser(); busy.value = false; return; }
  try {
    const response = await fetch("/api/progress", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: "00-ghostty-overview", step: props.step, nextStep: props.nextStep, completion: props.completion, event: props.event || props.label })
    });
    if (!response.ok) throw new Error("The course service could not save this checkpoint.");
    saved.value = true;
  } catch {
    mode.value = "browser";
    saveInBrowser();
    error.value = "The local service was unavailable, so this checkpoint was saved in this browser.";
  } finally { busy.value = false; }
}
onMounted(hydrate);
</script>

<template>
  <div :id="`checkpoint-${step}`" class="lesson-checkpoint">
    <div><span>CHECKPOINT</span><strong>{{ saved ? (mode === 'local' ? 'Progress saved to learner/state.json' : 'Progress saved in this browser') : 'Ready to remember this point?' }}</strong><small v-if="error" role="status">{{ error }}</small></div>
    <button :disabled="busy || saved" @click="save">{{ saved ? 'Saved ✓' : busy ? 'Saving…' : label }}</button>
    <span class="visually-hidden" aria-live="polite">{{ saved ? `${label} saved` : error }}</span>
  </div>
</template>
