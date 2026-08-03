import { ref } from "vue";
import manifest from "../../course/manifest.json";

const storageKey = "learn-ghostty.evidence.v2";
export const courseManifest = manifest;
export const learnerState = ref(null);

function initialState() {
  return {
    schemaVersion: 2,
    currentLesson: manifest.lessons[0].id,
    currentMission: manifest.lessons[0].missionIds[0],
    currentStep: "welcome",
    startedAt: null,
    updatedAt: null,
    lessons: Object.fromEntries(manifest.lessons.filter((lesson) => lesson.status === "available").map((lesson) => [lesson.id, { status: "not_started", completedMissions: [] }])),
    lastSectionByLesson: {},
    completedLessons: [],
    evidence: {},
    questions: [],
    activity: []
  };
}

export function loadLearnerState() {
  if (learnerState.value) return learnerState.value;
  const empty = initialState();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    learnerState.value = saved ? { ...empty, ...saved, lessons: { ...empty.lessons, ...saved.lessons }, lastSectionByLesson: { ...empty.lastSectionByLesson, ...saved.lastSectionByLesson }, completedLessons: [...new Set(saved.completedLessons ?? [])], evidence: { ...saved.evidence } } : empty;
  } catch { learnerState.value = empty; }
  return learnerState.value;
}

function persist() {
  learnerState.value.updatedAt = new Date().toISOString();
  learnerState.value.startedAt ??= learnerState.value.updatedAt;
  localStorage.setItem(storageKey, JSON.stringify(learnerState.value));
  window.dispatchEvent(new CustomEvent("learn-ghostty-state", { detail: learnerState.value }));
}

function stageFor(evidence) {
  return evidence.sourceInvariant ? "traced" : evidence.explanation ? "explained" : evidence.observation ? "observed" : evidence.prediction ? "predicted" : "not_started";
}

export function saveMissionEvidence(missionId, fields) {
  const state = loadLearnerState();
  const mission = manifest.missions.find((item) => item.id === missionId);
  if (!mission) throw new Error("unknown mission");
  const previous = state.evidence[missionId] ?? {};
  const now = new Date().toISOString();
  const evidence = { ...previous, ...Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])), missionId, createdAt: previous.createdAt ?? now, updatedAt: now };
  evidence.stage = stageFor(evidence);
  evidence.complete = mission.evidenceFields.every((field) => Boolean(evidence[field]));
  state.evidence[missionId] = evidence;
  state.currentLesson = mission.lessonId;
  state.currentMission = missionId;
  const lesson = manifest.lessons.find((item) => item.id === mission.lessonId);
  const lessonState = state.lessons[lesson.id] ?? { status: "in_progress", completedMissions: [] };
  lessonState.status = "in_progress";
  lessonState.completedMissions ??= [];
  if (evidence.complete && !lessonState.completedMissions.includes(missionId)) lessonState.completedMissions.push(missionId);
  state.lessons[lesson.id] = lessonState;

  if (evidence.complete) {
    const missionIndex = lesson.missionIds.indexOf(missionId);
    const nextMission = lesson.missionIds[missionIndex + 1];
    if (nextMission) {
      state.currentMission = nextMission;
      state.currentStep = nextMission;
    }
  }
  state.activity = [{ at: now, missionId, event: `${mission.title}: ${evidence.stage}` }, ...(state.activity ?? []).filter((item) => item.missionId !== missionId || item.event !== `${mission.title}: ${evidence.stage}`)].slice(0, 20);
  persist();
  return evidence;
}

export function recordSection(lessonId, sectionId) {
  const state = loadLearnerState();
  if (!manifest.lessons.some((lesson) => lesson.id === lessonId && lesson.status === "available")) return;
  const changed = state.currentLesson !== lessonId || state.currentStep !== sectionId;
  state.currentLesson = lessonId;
  state.currentStep = sectionId || "welcome";
  state.lastSectionByLesson[lessonId] = state.currentStep;
  state.lessons[lessonId] ??= { status: "not_started", completedMissions: [] };
  if (state.lessons[lessonId].status === "not_started") state.lessons[lessonId].status = "in_progress";
  if (changed) persist();
}

export function markLessonComplete(lessonId) {
  const state = loadLearnerState();
  const lesson = manifest.lessons.find((item) => item.id === lessonId);
  if (!lesson || lesson.status !== "available") return;
  state.lessons[lessonId] ??= { status: "in_progress", completedMissions: [] };
  state.lessons[lessonId].status = "completed";
  if (!state.completedLessons.includes(lessonId)) state.completedLessons.push(lessonId);
  const next = manifest.lessons.find((item) => item.order > lesson.order && item.status === "available");
  if (next) {
    state.currentLesson = next.id;
    state.currentMission = next.missionIds[0];
    state.currentStep = state.lastSectionByLesson[next.id] || "welcome";
  }
  persist();
}

export function resetLearnerProgress() {
  localStorage.removeItem(storageKey);
  learnerState.value = initialState();
  window.dispatchEvent(new CustomEvent("learn-ghostty-state", { detail: learnerState.value }));
}

export function hasLearnerProgress() {
  const state = loadLearnerState();
  return Boolean(state.startedAt || state.completedLessons.length || Object.keys(state.lastSectionByLesson).length || Object.keys(state.evidence).length);
}

export function evidenceFor(missionId) {
  return loadLearnerState().evidence[missionId] ?? null;
}

export function exportLearningRecord() {
  const blob = new Blob([`${JSON.stringify({ manifestVersion: manifest.schemaVersion, exportedAt: new Date().toISOString(), state: loadLearnerState() }, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "learn-ghostty-evidence.json";
  anchor.click();
  URL.revokeObjectURL(url);
}
