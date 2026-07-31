<script setup>
import { computed, ref } from "vue";
const steps = [
  { tag: "PROGRAM", title: "A program writes", detail: "printf sends bytes for visible text plus a command meaning “use green.”", artifact: "1b 5b 33 32 6d  48 69  1b 5b 30 6d" },
  { tag: "PTY", title: "The software cable carries", detail: "The PTY preserves the illusion that the program is attached to a terminal device.", artifact: "master ← byte stream ← slave" },
  { tag: "PARSER", title: "Commands separate from text", detail: "The parser emits a style action, two printable characters, then a reset action.", artifact: "SGR(green) · PRINT(H) · PRINT(i) · SGR(reset)" },
  { tag: "STATE", title: "The screen remembers", detail: "Two cells now contain H and i with a green foreground style. The cursor moved twice.", artifact: "[ H ][ i ][   ][   ]  cursor → 2" },
  { tag: "FONTS + GPU", title: "Meaning becomes pixels", detail: "Ghostty finds glyphs, places them in an atlas, builds GPU data, and presents a frame.", artifact: "cells → glyph atlas → texture sampling → frame" }
];
const current = ref(0);
const running = ref(false);
const active = computed(() => steps[current.value]);
async function run() {
  running.value = true;
  current.value = 0;
  for (let index = 1; index < steps.length; index++) {
    await new Promise((resolve) => setTimeout(resolve, 680));
    current.value = index;
  }
  running.value = false;
}
</script>

<template>
  <div class="byte-journey">
    <div class="journey-top"><div><span>LIVE MENTAL MODEL</span><h3>Follow “Hi” all the way to light</h3></div><button :disabled="running" @click="run">{{ running ? 'Traveling…' : 'Run the journey' }} →</button></div>
    <div class="journey-steps">
      <button v-for="(step, index) in steps" :key="step.tag" :class="{ active: index === current, passed: index < current }" @click="current = index"><i></i><span>{{ step.tag }}</span></button>
    </div>
    <div class="journey-stage"><span>{{ active.tag }}</span><h4>{{ active.title }}</h4><p>{{ active.detail }}</p><code>{{ active.artifact }}</code></div>
  </div>
</template>
