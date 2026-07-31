<script setup>
const stages = [
  ["01", "Origins + PTY", "Understand the historical contract and the software cable."],
  ["02", "Zig bridge", "Translate C instincts into the language of Ghostty's core."],
  ["03", "Parser + state", "Turn arbitrary bytes into a correct, durable terminal screen."],
  ["04", "Threads + I/O", "Keep output, input, and rendering responsive under pressure."],
  ["05", "Unicode + fonts", "Turn human text into correctly shaped and cached glyphs."],
  ["06", "GPU renderer", "Build frames with OpenGL and understand the Metal twin."],
  ["07", "Native UI", "Cross GTK, Wayland/X11, SwiftUI, AppKit, input, and IME boundaries."],
  ["08", "Maintainer practice", "Test, benchmark, investigate, and change any layer safely."]
];
</script>
<template><div class="learning-path"><article v-for="stage in stages" :key="stage[0]"><span>{{ stage[0] }}</span><div><h3>{{ stage[1] }}</h3><p>{{ stage[2] }}</p></div></article></div></template>
