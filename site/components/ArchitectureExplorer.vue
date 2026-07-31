<script setup>
import { computed, nextTick, ref } from "vue";

const layers = [
  { id: "program", short: "PROGRAM", title: "Terminal application", plain: "The program with something to say: your shell, editor, compiler, or TUI.", data: "Reads input bytes and writes output bytes", browser: "Closest to a web application", source: "The program is outside Ghostty" },
  { id: "pty", short: "PTY", title: "Pseudo-terminal", plain: "A software cable that lets an old terminal-shaped program talk to a modern terminal window.", data: "A bidirectional byte stream plus terminal behavior", browser: "Loosely like a local connection—but with Unix terminal rules", source: "src/pty.zig · src/termio/Exec.zig" },
  { id: "parser", short: "PARSER", title: "VT parser", plain: "The interpreter that separates visible text from commands such as “turn red” or “move left.”", data: "Bytes in; semantic actions out", browser: "Like tokenizing HTML, except terminal commands are imperative", source: "src/terminal/Parser.zig" },
  { id: "state", short: "STATE", title: "Terminal state", plain: "The terminal's memory: cells, cursor, colors, modes, history, links, and images.", data: "Parser actions become a durable screen model", browser: "Roughly DOM + layout state, but arranged around a character grid", source: "src/terminal/Terminal.zig · Screen.zig" },
  { id: "fonts", short: "FONTS", title: "Text and font system", plain: "Turns Unicode meaning into the exact glyph shapes that fit the terminal grid.", data: "Code points and style become shaped, rasterized glyphs", browser: "Uses the same broad shaping ideas as browser text", source: "src/font/" },
  { id: "renderer", short: "GPU", title: "GPU renderer", plain: "Packages backgrounds, glyphs, images, and the cursor into efficient GPU drawing work.", data: "Cell and glyph data become buffers, textures, and frames", browser: "Like browser paint and compositing", source: "src/renderer/generic.zig · OpenGL.zig · Metal.zig" },
  { id: "native", short: "WINDOW", title: "Native application runtime", plain: "Makes Ghostty feel at home: windows, tabs, splits, menus, clipboard, keyboard, and IME.", data: "Native events cross a narrow boundary into the shared core", browser: "The browser chrome around the rendering engine", source: "src/apprt/gtk · macos/Sources" }
];
const selected = ref("state");
const active = computed(() => layers.find((item) => item.id === selected.value));
function move(index, delta) {
  const next = (index + delta + layers.length) % layers.length;
  selected.value = layers[next].id;
  nextTick(() => document.querySelector(`#architecture-tab-${layers[next].id}`)?.focus());
}
</script>

<template>
  <div class="architecture-explorer">
    <div class="architecture-rail" role="tablist" aria-label="Terminal output layers">
      <template v-for="(layer, index) in layers" :key="layer.id">
        <button
          :id="`architecture-tab-${layer.id}`"
          role="tab"
          :aria-selected="selected === layer.id"
          aria-controls="architecture-detail"
          :tabindex="selected === layer.id ? 0 : -1"
          :class="['architecture-node', { active: selected === layer.id }]"
          @click="selected = layer.id"
          @keydown.left.prevent="move(index, -1)"
          @keydown.right.prevent="move(index, 1)"
        >
          <span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ layer.short }}</strong>
        </button>
        <i v-if="index < layers.length - 1">→</i>
      </template>
    </div>
    <div id="architecture-detail" class="architecture-detail" role="tabpanel" :aria-labelledby="`architecture-tab-${active.id}`" tabindex="0">
      <div class="detail-number">{{ String(layers.indexOf(active) + 1).padStart(2, '0') }}</div>
      <div><div class="detail-kicker">SELECTED LAYER</div><h3>{{ active.title }}</h3><p>{{ active.plain }}</p></div>
      <dl><div><dt>BOUNDARY</dt><dd>{{ active.data }}</dd></div><div><dt>BROWSER LENS</dt><dd>{{ active.browser }}</dd></div><div><dt>GHOSTTY</dt><dd><code>{{ active.source }}</code></dd></div></dl>
    </div>
    <p class="analogy-warning"><strong>Analogy guardrail:</strong> browser comparisons are landmarks, not equivalence. A terminal mostly receives imperative commands against a grid; a browser primarily builds and lays out a declarative document.</p>
  </div>
</template>
