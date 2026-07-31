<script setup>
import { computed, onMounted, ref } from "vue";

const source = ref(null); const error = ref(""); const notice = ref(""); const localMode = ref(false);
const params = ref({ path: "src/main_ghostty.zig", line: 25, end: 25 });
const commit = "6ad1fe7d8cbda36c77b337a96c9bea8a77883699";
const githubUrl = computed(() => {
  const p = params.value;
  return `https://github.com/ghostty-org/ghostty/blob/${commit}/${p.path}#L${p.line}${p.end > p.line ? `-L${p.end}` : ""}`;
});

function sourceSlice(content) {
  const lines = content.split("\n");
  const line = Math.max(1, Math.min(lines.length, params.value.line));
  const end = Math.max(line, Math.min(lines.length, params.value.end));
  const from = Math.max(1, line - 24); const to = Math.min(lines.length, end + 36);
  return { path: params.value.path, line, end, from, to, totalLines: lines.length, lines: lines.slice(from - 1, to) };
}

async function loadPublicSource() {
  if (!/^[A-Za-z0-9_./-]+$/.test(params.value.path) || params.value.path.includes("..")) throw new Error("invalid source path");
  const encoded = params.value.path.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`https://raw.githubusercontent.com/ghostty-org/ghostty/${commit}/${encoded}`);
  if (!response.ok) throw new Error("Pinned source is unavailable from GitHub");
  source.value = sourceSlice(await response.text());
  localMode.value = false;
}

async function load() {
  error.value = ""; source.value = null;
  const query = new URLSearchParams(window.location.search);
  params.value = { path: query.get("path") || "src/main_ghostty.zig", line: Number(query.get("line") || 25), end: Number(query.get("end") || query.get("line") || 25) };
  if (!window.location.hostname.endsWith("github.io")) {
    try {
      const response = await fetch(`/api/source?${new URLSearchParams(params.value)}`);
      const value = await response.json();
      if (!response.ok) throw new Error(value.error);
      source.value = value; localMode.value = true; return;
    } catch { /* Read the same pinned source from GitHub below. */ }
  }
  try { await loadPublicSource(); } catch (cause) { error.value = cause.message; }
}

async function copyForPi() {
  await navigator.clipboard.writeText(`@ghostty/${params.value.path}:${params.value.line}`);
  notice.value = "Copied a source reference for Pi"; setTimeout(() => notice.value = "", 1800);
}
async function openEditor() {
  notice.value = "Opening VS Code…";
  const response = await fetch("/api/source/open", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: params.value.path, line: params.value.line }) });
  const value = await response.json(); notice.value = response.ok ? "Opened in VS Code" : value.error;
}
onMounted(load);
</script>

<template>
  <section class="source-workbench">
    <header class="source-header">
      <div><span class="source-kicker">PINNED GHOSTTY SOURCE</span><h2>{{ params.path }}</h2><small>{{ commit.slice(0, 12) }} · {{ source?.totalLines ?? '—' }} lines · {{ localMode ? 'local checkout' : 'public snapshot' }}</small></div>
      <div class="source-actions">
        <button @click="copyForPi">Copy for Pi</button><button v-if="localMode" @click="openEditor">Open in VS Code</button>
        <a :href="githubUrl" target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>
    </header>
    <div v-if="notice" class="source-notice" role="status" aria-live="polite">{{ notice }}</div>
    <div v-if="error" class="source-error" role="alert"><span>{{ error }}.</span><button type="button" @click="load">Retry</button></div>
    <div v-else-if="source" class="code-window">
      <div class="code-window__bar"><i></i><i></i><i></i><span>READ ONLY · {{ localMode ? 'LOCAL CHECKOUT' : 'PINNED PUBLIC SOURCE' }}</span></div>
      <pre><code><span v-for="(text, index) in source.lines" :key="index" :class="['source-line', { focused: source.from + index >= source.line && source.from + index <= source.end }]"><b>{{ source.from + index }}</b><span>{{ text || ' ' }}</span></span></code></pre>
    </div>
    <div v-else-if="!error" class="loading-state">Reading the pinned source…</div>
  </section>
</template>
