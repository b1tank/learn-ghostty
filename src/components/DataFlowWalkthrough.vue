<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId } from "vue";

const props = defineProps({
  title: String,
  steps: { type: Array, required: true },
  analogy: String,
  interval: { type: Number, default: 3200 },
});

const root = ref(null);
const id = useId();
const active = ref(0);
const playing = ref(false);
const hasPlayed = ref(false);
const reducedMotion = ref(false);
let timer;
let observer;

const step = computed(() => props.steps[active.value]);
const progress = computed(() => props.steps.length <= 1 ? 0 : (active.value / (props.steps.length - 1)) * 100);

function stopTimer() {
  if (timer) window.clearTimeout(timer);
  timer = undefined;
}

function schedule() {
  stopTimer();
  if (!playing.value || reducedMotion.value) return;
  timer = window.setTimeout(() => {
    if (active.value >= props.steps.length - 1) {
      playing.value = false;
      hasPlayed.value = true;
      return;
    }
    active.value += 1;
    schedule();
  }, props.interval);
}

function play() {
  if (reducedMotion.value) {
    active.value = props.steps.length - 1;
    hasPlayed.value = true;
    return;
  }
  if (active.value >= props.steps.length - 1) active.value = 0;
  playing.value = true;
  hasPlayed.value = true;
  schedule();
}

function pause() {
  playing.value = false;
  stopTimer();
}

function restart() {
  active.value = 0;
  play();
}

function select(index) {
  pause();
  active.value = index;
  hasPlayed.value = true;
}

function previous() {
  pause();
  active.value = Math.max(0, active.value - 1);
}

function next() {
  pause();
  active.value = Math.min(props.steps.length - 1, active.value + 1);
}

function moveFocus(index, delta) {
  const target = (index + delta + props.steps.length) % props.steps.length;
  select(target);
  nextTick(() => root.value?.querySelector(`[data-step="${target}"]`)?.focus());
}

onMounted(() => {
  reducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !hasPlayed.value && !reducedMotion.value) play();
    if (!entry.isIntersecting && playing.value) pause();
  }, { threshold: 0.45 });
  if (root.value) observer.observe(root.value);
});

onBeforeUnmount(() => {
  stopTimer();
  observer?.disconnect();
});
</script>

<template>
  <section ref="root" class="flow-walkthrough" :class="{ 'is-playing': playing }">
    <header class="flow-header">
      <div>
        <span>ANIMATED DATA FLOW</span>
        <h3>{{ title }}</h3>
        <p v-if="analogy">{{ analogy }}</p>
      </div>
      <div class="flow-header__controls">
        <button v-if="!playing && active < steps.length - 1" type="button" @click="play">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 8 5-8 5V3Z" fill="currentColor"/></svg>
          Play flow
        </button>
        <button v-else-if="playing" type="button" @click="pause">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 3h3v10H4zm5 0h3v10H9z" fill="currentColor"/></svg>
          Pause
        </button>
        <button v-else type="button" @click="restart">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 5V2l-1.4 1.4A6 6 0 1 0 14 8h-2a4 4 0 1 1-1.8-3.3L8 7h5Z" fill="currentColor"/></svg>
          Replay
        </button>
      </div>
    </header>

    <div class="flow-track" :style="{ '--flow-progress': `${progress}%`, '--flow-count': steps.length }">
      <div class="flow-track__line" aria-hidden="true"><i></i><b></b></div>
      <div class="flow-rail" role="tablist" :aria-label="`${title} steps`">
        <button
          v-for="(item, index) in steps"
          :id="`${id}-tab-${index}`"
          :key="index"
          type="button"
          role="tab"
          :data-step="index"
          :aria-selected="active === index"
          :aria-controls="`${id}-panel`"
          :tabindex="active === index ? 0 : -1"
          :class="{ active: active === index, done: index < active }"
          @click="select(index)"
          @keydown.left.prevent="moveFocus(index, -1)"
          @keydown.right.prevent="moveFocus(index, 1)"
        >
          <b>{{ String(index + 1).padStart(2, "0") }}</b>
          <span>{{ item.actor }}</span>
        </button>
      </div>
    </div>

    <article
      :id="`${id}-panel`"
      class="flow-detail"
      role="tabpanel"
      :aria-labelledby="`${id}-tab-${active}`"
      aria-live="polite"
    >
      <div class="flow-detail__main">
        <div class="flow-detail__step">STEP {{ String(active + 1).padStart(2, "0") }} OF {{ String(steps.length).padStart(2, "0") }}</div>
        <h4>{{ step.actor }}</h4>
        <p>{{ step.action }}</p>
      </div>
      <div class="flow-data">
        <div><span>DATA IN</span><code>{{ step.input }}</code></div>
        <svg viewBox="0 0 32 16" aria-hidden="true"><path d="M2 8h26m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <div><span>DATA OUT</span><code>{{ step.output }}</code></div>
      </div>
      <aside v-if="step.analogy" class="flow-analogy">
        <span>SPORTS BROADCAST ANALOGY</span>
        <p>{{ step.analogy }}</p>
      </aside>
    </article>

    <footer class="flow-footer">
      <button type="button" :disabled="active === 0" @click="previous">Previous</button>
      <span>{{ active + 1 }} / {{ steps.length }}</span>
      <button type="button" :disabled="active === steps.length - 1" @click="next">Next</button>
    </footer>
  </section>
</template>
