import { ref } from "vue";

const key = "learn-ghostty.progress.v5";
export const progressState = ref(null);

function empty() { return { version: 5, currentLesson: null, currentSection: "welcome", lastSections: {}, completedLessons: [], startedAt: null, updatedAt: null }; }
export function loadProgress() {
  if (progressState.value) return progressState.value;
  try { progressState.value = { ...empty(), ...JSON.parse(localStorage.getItem(key) || "null") }; }
  catch { progressState.value = empty(); }
  return progressState.value;
}
function persist() {
  const state = progressState.value;
  state.startedAt ??= new Date().toISOString(); state.updatedAt = new Date().toISOString();
  localStorage.setItem(key, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("learn-ghostty-progress", { detail: state }));
}
export function recordSection(lessonId, sectionId) {
  const state = loadProgress(); const section = sectionId || "welcome";
  state.lastSections[lessonId] = section;
  if (!state.completedLessons.includes(lessonId)) { state.currentLesson = lessonId; state.currentSection = section; }
  persist();
}
export function completeLesson(lessonId, lessons) {
  const state = loadProgress();
  if (!state.completedLessons.includes(lessonId)) state.completedLessons.push(lessonId);
  const current = lessons.find((item) => item.id === lessonId);
  const next = lessons.find((item) => item.status === "published" && item.module === current.module && item.order > current.order);
  if (next) { state.currentLesson = next.id; state.currentSection = state.lastSections[next.id] || "welcome"; }
  persist();
}
export function resetProgress() { localStorage.removeItem(key); progressState.value = empty(); window.dispatchEvent(new CustomEvent("learn-ghostty-progress", { detail: progressState.value })); }
export function hasProgress() { const state = loadProgress(); return Boolean(state.startedAt || state.completedLessons.length || Object.keys(state.lastSections).length); }
export function exportProgress() {
  const blob = new Blob([`${JSON.stringify({ exportedAt: new Date().toISOString(), progress: loadProgress() }, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "learn-ghostty-progress.json"; a.click(); URL.revokeObjectURL(url);
}
