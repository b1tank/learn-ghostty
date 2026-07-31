<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({ placement: { type: String, default: "bar" } });
const modes = [
  { id: "system", label: "System", short: "Auto", icon: "◐" },
  { id: "light", label: "Light", short: "Light", icon: "☀" },
  { id: "dark", label: "Dark", short: "Dark", icon: "☾" }
];
const preference = ref("system");
const effective = ref("light");
let media;

function effectiveMode(value) {
  return value === "system" ? (media?.matches ? "dark" : "light") : value;
}

function renderTheme(value, persist = true, announce = true) {
  if (!modes.some((mode) => mode.id === value)) value = "system";
  preference.value = value;
  effective.value = effectiveMode(value);
  document.documentElement.classList.toggle("dark", effective.value === "dark");
  document.documentElement.dataset.themePreference = value;
  document.documentElement.dataset.effectiveTheme = effective.value;
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    effective.value === "dark" ? "#07110f" : "#f6f8f3"
  );
  if (persist) localStorage.setItem("learn-ghostty-theme", value);
  if (announce) window.dispatchEvent(new CustomEvent("learn-ghostty-theme-change", { detail: { preference: value } }));
}

function select(value) {
  renderTheme(value);
}

function onMediaChange() {
  if (preference.value === "system") renderTheme("system", false);
}

function onThemeChange(event) {
  if (event.detail?.preference !== preference.value) renderTheme(event.detail.preference, false, false);
}

onMounted(() => {
  media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onMediaChange);
  window.addEventListener("learn-ghostty-theme-change", onThemeChange);
  renderTheme(localStorage.getItem("learn-ghostty-theme") || document.documentElement.dataset.themePreference || "system", false, false);
});

onBeforeUnmount(() => {
  media?.removeEventListener("change", onMediaChange);
  window.removeEventListener("learn-ghostty-theme-change", onThemeChange);
});
</script>

<template>
  <div :class="['theme-selector', `theme-selector--${props.placement}`]" role="radiogroup" aria-label="Color theme">
    <span v-if="props.placement === 'screen'" class="theme-selector__label">APPEARANCE</span>
    <div class="theme-selector__options">
      <button
        v-for="mode in modes"
        :key="mode.id"
        type="button"
        role="radio"
        :aria-checked="preference === mode.id"
        :aria-label="`${mode.label} theme${mode.id === 'system' ? `, currently ${effective}` : ''}`"
        :title="`${mode.label} theme`"
        :class="{ selected: preference === mode.id }"
        @click="select(mode.id)"
      >
        <span aria-hidden="true">{{ mode.icon }}</span>
        <b>{{ props.placement === 'screen' ? mode.label : mode.short }}</b>
      </button>
    </div>
    <span class="visually-hidden" aria-live="polite">{{ preference === 'system' ? `Following system: ${effective}` : `${preference} theme selected` }}</span>
  </div>
</template>
