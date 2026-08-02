<script setup>
import { computed, ref } from "vue";

const presets = [
  { id: "green", label: "green Hi", value: "\\x1b[32mHi\\x1b[0m", prompt: "Which bytes occupy cells, and which only change state?" },
  { id: "return", label: "carriage return", value: "abc\\rX", prompt: "Does X append after c, erase the line, or overwrite a?" },
  { id: "backspace", label: "backspace", value: "abc\\bX", prompt: "Where does X land, and does backspace erase by itself?" }
];
const source = ref(presets[0].value);
const prediction = ref("");
const predictionLocked = ref(false);
const bytes = ref([]);
const index = ref(0);
const parserState = ref("ground");
const csi = ref("");
const cursor = ref(0);
const style = ref("default");
const cells = ref([]);
const action = ref("Waiting for a locked prediction.");
const log = ref([]);
const running = ref(false);
const selected = ref("green");

function decode(text) {
  const result = [];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== "\\") { result.push(text.charCodeAt(i)); continue; }
    const next = text[++i];
    if (next === "x" && /^[0-9a-fA-F]{2}$/.test(text.slice(i + 1, i + 3))) {
      result.push(Number.parseInt(text.slice(i + 1, i + 3), 16)); i += 2;
    } else if (next === "r") result.push(13);
    else if (next === "n") result.push(10);
    else if (next === "b") result.push(8);
    else if (next === "e") result.push(27);
    else if (next === "\\") result.push(92);
    else { result.push(92); if (next) result.push(next.charCodeAt(0)); }
  }
  return result.slice(0, 64);
}

function describe(byte) {
  if (byte === 27) return "ESC";
  if (byte === 13) return "CR";
  if (byte === 10) return "LF";
  if (byte === 8) return "BS";
  if (byte >= 32 && byte <= 126) return String.fromCharCode(byte);
  return "CTRL";
}
function hex(byte) { return byte.toString(16).toUpperCase().padStart(2, "0"); }
const currentByte = computed(() => bytes.value[index.value]);
const finished = computed(() => bytes.value.length > 0 && index.value >= bytes.value.length);

function choose(preset) {
  selected.value = preset.id;
  source.value = preset.value;
  prediction.value = "";
  predictionLocked.value = false;
  resetMachine();
}
function lockPrediction() {
  if (!prediction.value.trim()) return;
  predictionLocked.value = true;
  resetMachine();
  bytes.value = decode(source.value);
  action.value = "Prediction locked. Step the first byte.";
}
function resetMachine() {
  bytes.value = predictionLocked.value ? decode(source.value) : [];
  index.value = 0; parserState.value = "ground"; csi.value = ""; cursor.value = 0;
  style.value = "default"; cells.value = Array.from({ length: 12 }, () => ({ char: " ", style: "default" }));
  action.value = predictionLocked.value ? "Ready for the first byte." : "Waiting for a locked prediction.";
  log.value = [];
}
function record(byte, message) {
  action.value = message;
  log.value.push(`${String(index.value + 1).padStart(2, "0")}  0x${hex(byte)} ${describe(byte).padEnd(4)}  ${message}`);
}
function step() {
  if (!predictionLocked.value || finished.value) return;
  const byte = bytes.value[index.value];
  const char = String.fromCharCode(byte);
  if (parserState.value === "escape") {
    if (char === "[") { parserState.value = "csi"; csi.value = ""; record(byte, "enter CSI parameter state"); }
    else { parserState.value = "ground"; record(byte, "unsupported escape; return to ground"); }
  } else if (parserState.value === "csi") {
    if (/[0-9;]/.test(char)) { csi.value += char; record(byte, `collect parameter ${char}`); }
    else if (char === "m") {
      const code = csi.value || "0";
      style.value = code === "31" ? "red" : code === "32" ? "green" : "default";
      parserState.value = "ground"; record(byte, `dispatch SGR ${code}; style → ${style.value}`);
    } else { parserState.value = "ground"; record(byte, "unsupported CSI; return to ground"); }
  } else if (byte === 27) {
    parserState.value = "escape"; record(byte, "begin escape sequence; write no cell");
  } else if (byte === 13) {
    cursor.value = 0; record(byte, "carriage return; cursor column → 0");
  } else if (byte === 8) {
    cursor.value = Math.max(0, cursor.value - 1); record(byte, `backspace; cursor column → ${cursor.value}`);
  } else if (byte === 10) {
    record(byte, "line feed (single-row model records it but cannot move down)");
  } else if (byte >= 32 && byte <= 126) {
    if (cursor.value < cells.value.length) cells.value[cursor.value] = { char, style: style.value };
    record(byte, `print '${char}' in cell ${cursor.value} using ${style.value}`);
    cursor.value = Math.min(cells.value.length, cursor.value + 1);
  } else record(byte, "control byte ignored by this miniature model");
  index.value += 1;
}
async function run() {
  if (!predictionLocked.value) return;
  running.value = true;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  while (!finished.value) {
    step();
    if (!reduced) await new Promise((done) => setTimeout(done, 180));
  }
  running.value = false;
}
resetMachine();
</script>

<template>
  <section class="byte-workbench">
    <header><div><span>EXECUTABLE MENTAL MODEL</span><h3>Drive a twelve-cell terminal</h3></div><p>This model intentionally supports only printable ASCII, CR, BS, and SGR 0/31/32. Its limits are visible.</p></header>
    <div class="byte-presets" aria-label="Sequence presets"><button v-for="preset in presets" :key="preset.id" :class="{ selected: selected === preset.id }" @click="choose(preset)">{{ preset.label }}</button></div>
    <label class="workbench-field"><span>BYTE NOTATION <small>Use text, \x1b, \r, \b, or \n</small></span><input v-model="source" :disabled="predictionLocked" spellcheck="false" /></label>
    <label class="workbench-field"><span>YOUR PREDICTION <small>{{ presets.find((item) => item.id === selected)?.prompt }}</small></span><textarea v-model="prediction" :disabled="predictionLocked" rows="2" placeholder="Write what you expect before running anything."></textarea></label>
    <div v-if="!predictionLocked" class="workbench-lock"><button :disabled="!prediction.trim()" @click="lockPrediction">Lock prediction and reveal bytes</button></div>

    <template v-else>
      <div class="byte-rail" aria-label="Input bytes"><span v-for="(byte, byteIndex) in bytes" :key="byteIndex" :class="{ current: byteIndex === index, done: byteIndex < index }"><b>{{ hex(byte) }}</b><small>{{ describe(byte) }}</small></span></div>
      <div class="terminal-machine">
        <div class="machine-state"><div><span>PARSER</span><strong>{{ parserState }}</strong></div><div><span>STYLE</span><strong>{{ style }}</strong></div><div><span>CURSOR</span><strong>{{ cursor }}</strong></div><div><span>NEXT BYTE</span><strong>{{ currentByte === undefined ? 'done' : `0x${hex(currentByte)}` }}</strong></div></div>
        <div class="terminal-grid" aria-label="Twelve terminal cells"><div v-for="(cell, cellIndex) in cells" :key="cellIndex" :class="[`is-${cell.style}`, { cursor: cellIndex === cursor && !finished }]" ><span>{{ cell.char }}</span><small>{{ cellIndex }}</small></div></div>
        <div class="machine-action" aria-live="polite"><span>LAST ACTION</span><strong>{{ finished ? 'Sequence complete. Compare the cells with your prediction.' : action }}</strong></div>
      </div>
      <div class="workbench-controls"><button @click="predictionLocked = false; resetMachine()">Edit prediction</button><button @click="resetMachine">Reset machine</button><button :disabled="finished || running" @click="step">Step one byte</button><button class="primary" :disabled="finished || running" @click="run">{{ running ? 'Running…' : 'Run remaining' }}</button></div>
      <details class="action-log"><summary>Open action trace ({{ log.length }} events)</summary><pre>{{ log.join('\n') || 'No bytes stepped yet.' }}</pre></details>
    </template>
  </section>
</template>
