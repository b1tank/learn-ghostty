<script setup>
import { computed, nextTick, ref, useId } from "vue";

const props = defineProps({
  title: { type: String, required: true },
  sourceLabel: { type: String, default: "Zig" },
  code: { type: Array, required: true },
  points: { type: Array, required: true },
  comparisons: { type: Array, default: () => [] },
  memory: { type: Array, default: () => [] },
  omission: String,
});

const root = ref(null);
const id = useId();
const activePoint = ref(0);
const activeLanguage = ref("c");
const languages = computed(() => [
  { id: "c", label: "C" },
  ...props.comparisons.map((item) => ({ id: item.id, label: item.label })),
]);
const point = computed(() => props.points[activePoint.value]);
const comparison = computed(() => props.comparisons.find((item) => item.id === activeLanguage.value));

function selectPoint(index) {
  if (index >= 0) activePoint.value = index;
}

function selectLine(line) {
  selectPoint(props.points.findIndex((item) => (item.lines ?? [item.line]).includes(line)));
}

function movePoint(index, delta) {
  const target = (index + delta + props.points.length) % props.points.length;
  selectPoint(target);
  nextTick(() => root.value?.querySelector(`[data-point="${target}"]`)?.focus());
}

function selectLanguage(language) {
  activeLanguage.value = language;
}

function moveLanguage(index, delta) {
  const target = (index + delta + languages.value.length) % languages.value.length;
  selectLanguage(languages.value[target].id);
  nextTick(() => root.value?.querySelector(`[data-language="${languages.value[target].id}"]`)?.focus());
}

function lineIsActive(number) {
  const lines = point.value.lines ?? [point.value.line];
  return lines.includes(number);
}
</script>

<template>
  <section ref="root" class="syntax-bridge">
    <header>
      <span>ZIG SYNTAX BRIDGE</span>
      <h3>{{ title }}</h3>
      <p>Start with the C model, then inspect each highlighted Zig line.</p>
    </header>

    <div class="syntax-bridge__languages" role="tablist" aria-label="Language comparison">
      <button
        v-for="(language, index) in languages"
        :id="`${id}-language-${language.id}`"
        :key="language.id"
        type="button"
        role="tab"
        :data-language="language.id"
        :aria-selected="activeLanguage === language.id"
        :aria-controls="`${id}-language-panel`"
        :tabindex="activeLanguage === language.id ? 0 : -1"
        @click="selectLanguage(language.id)"
        @keydown.left.prevent="moveLanguage(index, -1)"
        @keydown.right.prevent="moveLanguage(index, 1)"
      >{{ language.label }}</button>
    </div>

    <div
      v-if="activeLanguage === 'c'"
      :id="`${id}-language-panel`"
      class="syntax-bridge__c"
      role="tabpanel"
      :aria-labelledby="`${id}-language-c`"
    >
      <div class="syntax-bridge__code" :aria-label="`${sourceLabel} source with selectable lines`">
        <button
          v-for="(line, index) in code"
          :key="index"
          type="button"
          :class="{ active: lineIsActive(index + 1) }"
          :aria-label="`Explain line ${index + 1}: ${line}`"
          :aria-pressed="lineIsActive(index + 1)"
          @click="selectLine(index + 1)"
        ><b>{{ index + 1 }}</b><code>{{ line || ' ' }}</code></button>
      </div>

      <div class="syntax-bridge__points" role="tablist" :aria-label="`${title} explanations`">
        <button
          v-for="(item, index) in points"
          :id="`${id}-point-${index}`"
          :key="item.label"
          type="button"
          role="tab"
          :data-point="index"
          :aria-selected="activePoint === index"
          :aria-controls="`${id}-point-panel`"
          :tabindex="activePoint === index ? 0 : -1"
          @click="selectPoint(index)"
          @keydown.left.prevent="movePoint(index, -1)"
          @keydown.right.prevent="movePoint(index, 1)"
        >{{ item.label }}</button>
      </div>

      <article :id="`${id}-point-panel`" role="tabpanel" :aria-labelledby="`${id}-point-${activePoint}`" aria-live="polite">
        <span>C MENTAL MODEL</span>
        <h4>{{ point.label }}</h4>
        <p>{{ point.c }}</p>
        <p class="syntax-bridge__zig"><strong>Zig difference:</strong> {{ point.zig }}</p>
      </article>
    </div>

    <article
      v-else
      :id="`${id}-language-panel`"
      class="syntax-bridge__comparison"
      role="tabpanel"
      :aria-labelledby="`${id}-language-${activeLanguage}`"
    >
      <pre><code>{{ comparison.code }}</code></pre>
      <p>{{ comparison.note }}</p>
    </article>

    <figure v-if="memory.length" class="syntax-bridge__memory">
      <figcaption>MEMORY / LIFETIME FLOW</figcaption>
      <ol>
        <li v-for="(item, index) in memory" :key="index"><strong>{{ item.owner }}</strong><span>{{ item.value }}</span></li>
      </ol>
    </figure>
    <p v-if="omission" class="syntax-bridge__omission"><strong>Why no higher-level tab:</strong> {{ omission }}</p>
  </section>
</template>

<style>
.syntax-bridge{margin:1.5rem 0;border:1px solid var(--course-border);border-radius:var(--course-radius-md);background:var(--course-surface);overflow:hidden;container:syntax/inline-size}.syntax-bridge>header{padding:1.15rem 1.25rem;border-bottom:1px solid var(--course-border)}.syntax-bridge>header>span,.syntax-bridge article>span,.syntax-bridge__memory figcaption{color:var(--sl-color-text-accent);font:700 var(--sl-text-2xs) var(--__sl-font-mono);letter-spacing:.06em}.syntax-bridge h3,.syntax-bridge h4,.syntax-bridge p{margin:0}.syntax-bridge h3{margin-top:.25rem;font-size:var(--sl-text-xl)}.syntax-bridge header p{margin-top:.35rem;color:var(--sl-color-text);font-size:var(--sl-text-sm)}.syntax-bridge__languages,.syntax-bridge__points{display:flex;gap:.35rem;padding:.7rem 1.25rem;overflow-x:auto}.syntax-bridge__languages{border-bottom:1px solid var(--course-border)}.syntax-bridge__languages button,.syntax-bridge__points button{min-height:2.4rem;padding:.45rem .8rem;border:1px solid var(--course-border);border-radius:.45rem;background:var(--course-surface-soft);color:var(--sl-color-text);font:700 var(--sl-text-xs) var(--__sl-font-mono);white-space:nowrap;cursor:pointer}.syntax-bridge__languages button[aria-selected=true],.syntax-bridge__points button[aria-selected=true]{border-color:var(--sl-color-accent);background:var(--sl-color-accent-low);color:var(--sl-color-text-accent)}.syntax-bridge button:focus-visible{outline:3px solid var(--sl-color-accent);outline-offset:2px}.syntax-bridge__c{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(15rem,.75fr);grid-template-areas:"code tabs" "code detail"}.syntax-bridge__code{grid-area:code;padding:.85rem 0;background:var(--lg-code-shell);overflow:auto}.syntax-bridge__code button{display:grid;grid-template-columns:2.8rem minmax(max-content,1fr);width:100%;min-height:1.75rem;padding:0;border:0;background:transparent;color:var(--lg-code-text);text-align:left;cursor:pointer}.syntax-bridge__code button.active{background:color-mix(in srgb,var(--sl-color-accent) 22%,transparent);box-shadow:inset 3px 0 var(--sl-color-accent)}.syntax-bridge__code b{padding:.15rem .7rem;color:var(--lg-code-muted);font:400 var(--sl-text-xs) var(--__sl-font-mono);text-align:right}.syntax-bridge__code code{padding:.15rem 1rem .15rem 0;background:none;color:inherit;font-size:var(--sl-text-sm);white-space:pre}.syntax-bridge__points{grid-area:tabs;padding-bottom:.35rem}.syntax-bridge__c>article{grid-area:detail;padding:.65rem 1.25rem 1.2rem}.syntax-bridge article h4{margin-top:.25rem}.syntax-bridge article p{margin-top:.55rem;color:var(--sl-color-text);font-size:var(--sl-text-sm);line-height:1.55}.syntax-bridge__zig{padding-left:.7rem;border-left:2px solid var(--sl-color-accent)}.syntax-bridge__comparison{padding:1rem 1.25rem}.syntax-bridge__comparison pre{margin:0;padding:.85rem;overflow:auto;background:var(--lg-code-shell);color:var(--lg-code-text)}.syntax-bridge__memory{margin:0;padding:1rem 1.25rem;border-top:1px solid var(--course-border)}.syntax-bridge__memory ol{display:flex;align-items:stretch;margin:.65rem 0 0;padding:0;list-style:none}.syntax-bridge__memory li{position:relative;flex:1;min-width:0;margin:0!important;padding:.7rem;border:1px solid var(--course-border);background:var(--course-surface-soft)}.syntax-bridge__memory li+li{margin-left:1.4rem!important}.syntax-bridge__memory li+li:before{position:absolute;right:100%;top:50%;width:1.4rem;content:"→";color:var(--sl-color-text-accent);text-align:center;transform:translateY(-50%)}.syntax-bridge__memory strong,.syntax-bridge__memory span{display:block}.syntax-bridge__memory strong{font-size:var(--sl-text-sm)}.syntax-bridge__memory span{margin-top:.25rem;color:var(--sl-color-text);font-size:var(--sl-text-xs)}.syntax-bridge__omission{padding:0 1.25rem 1rem;color:var(--sl-color-text);font-size:var(--sl-text-sm)}@container syntax (max-width:42rem){.syntax-bridge__c{grid-template-columns:1fr;grid-template-areas:"code" "tabs" "detail"}.syntax-bridge__memory ol{display:grid;gap:1.4rem}.syntax-bridge__memory li+li{margin-left:0!important}.syntax-bridge__memory li+li:before{right:auto;bottom:100%;top:auto;left:50%;width:auto;height:1.4rem;transform:translateX(-50%) rotate(90deg)}}@media(prefers-reduced-motion:reduce){.syntax-bridge *{scroll-behavior:auto!important;transition:none!important}}
</style>
