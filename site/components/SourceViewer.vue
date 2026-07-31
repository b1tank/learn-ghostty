<script setup>
import { computed, onMounted, ref } from "vue";

const source = ref(null);
const error = ref("");
const notice = ref("");
const params = ref({ path: "src/main_ghostty.zig", line: 25, end: 25 });
const commit = "6ad1fe7d8cbda36c77b337a96c9bea8a77883699";

const githubUrl = computed(() => {
  const p = params.value;
  return `https://github.com/ghostty-org/ghostty/blob/${commit}/${p.path}#L${p.line}${p.end > p.line ? `-L${p.end}` : ""}`;
});

async function load() {
  error.value = "";
  source.value = null;
  const query = new URLSearchParams(window.location.search);
  params.value = {
    path: query.get("path") || "src/main_ghostty.zig",
    line: Number(query.get("line") || 25),
    end: Number(query.get("end") || query.get("line") || 25)
  };
  try {
    const response = await fetch(`/api/source?${new URLSearchParams(params.value)}`);
    const value = await response.json();
    if (!response.ok) throw new Error(value.error);
    source.value = value;
  } catch (cause) {
    error.value = cause.message;
  }
}

async function copyForPi() {
  await navigator.clipboard.writeText(`@ghostty/${params.value.path}:${params.value.line}`);
  notice.value = "Copied a source reference for Pi";
  setTimeout(() => notice.value = "", 1800);
}

async function openEditor() {
  notice.value = "Opening VS Code…";
  const response = await fetch("/api/source/open", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: params.value.path, line: params.value.line })
  });
  const value = await response.json();
  notice.value = response.ok ? "Opened in VS Code" : value.error;
}

onMounted(load);
</script>

<template>
  <section class="source-workbench">
    <header class="source-header">
      <div><span class="source-kicker">PINNED GHOSTTY SOURCE</span><h2>{{ params.path }}</h2><small>{{ commit.slice(0, 12) }} · {{ source?.totalLines ?? '—' }} lines</small></div>
      <div class="source-actions">
        <button @click="copyForPi">Copy for Pi</button>
        <button @click="openEditor">Open in VS Code</button>
        <a :href="githubUrl" target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>
    </header>
    <div v-if="notice" class="source-notice" role="status" aria-live="polite">{{ notice }}</div>
    <div v-if="error" class="source-error" role="alert"><span>{{ error }}. Start this page with <code>./camp serve</code>.</span><button type="button" @click="load">Retry</button></div>
    <div v-else-if="source" class="code-window">
      <div class="code-window__bar"><i></i><i></i><i></i><span>READ ONLY · LOCAL CHECKOUT</span></div>
      <pre><code><span v-for="(text, index) in source.lines" :key="index" :class="['source-line', { focused: source.from + index >= source.line && source.from + index <= source.end }]"><b>{{ source.from + index }}</b><span>{{ text || ' ' }}</span></span></code></pre>
    </div>
    <div v-else-if="!error" class="loading-state">Reading the local checkout…</div>
  </section>
</template>
