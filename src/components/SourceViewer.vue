<script setup>
import { computed, onMounted, ref } from "vue";
const props=defineProps({sourceCommit:{type:String,required:true}});const source=ref(null),error=ref(""),notice=ref("");const params=ref({path:"src/main_ghostty.zig",line:25,end:25});const githubUrl=computed(()=>`https://github.com/ghostty-org/ghostty/blob/${props.sourceCommit}/${params.value.path}#L${params.value.line}${params.value.end>params.value.line?`-L${params.value.end}`:""}`);function slice(content){const lines=content.split("\n"),line=Math.max(1,Math.min(lines.length,params.value.line)),end=Math.max(line,Math.min(lines.length,params.value.end)),from=Math.max(1,line-24),to=Math.min(lines.length,end+36);return{lines:lines.slice(from-1,to),line,end,from,to,totalLines:lines.length}}
async function load(){error.value="";const q=new URLSearchParams(location.search);params.value={path:q.get("path")||"src/main_ghostty.zig",line:Number(q.get("line")||25),end:Number(q.get("end")||q.get("line")||25)};try{if(!/^[A-Za-z0-9_./-]+$/.test(params.value.path)||params.value.path.includes(".."))throw Error("Invalid source path");const path=params.value.path.split("/").map(encodeURIComponent).join("/");const r=await fetch(`https://raw.githubusercontent.com/ghostty-org/ghostty/${props.sourceCommit}/${path}`);if(!r.ok)throw Error("Pinned source is unavailable");source.value=slice(await r.text())}catch(e){error.value=e.message}}
async function copy(value,message){await navigator.clipboard.writeText(value);notice.value=message;setTimeout(()=>notice.value="",1600)}
function copyAi(){return copy(`Learn Ghostty source context\n\nPage:\n${location.href}\n\nRemote:\n${githubUrl.value}\n\nLocal:\n~/ghostty/${params.value.path}:${params.value.line}\n\nMy question:\n`,"Source context copied for AI")}
onMounted(load);
</script>
<template>
  <section class="source-workbench">
    <header class="source-header">
      <div><span class="source-kicker">PINNED GHOSTTY SOURCE</span><h2>{{params.path}}</h2><small>{{sourceCommit.slice(0,12)}} · {{source?.totalLines??'—'}} lines</small></div>
      <div class="source-actions">
        <button @click="copy(`~/ghostty/${params.path}:${params.line}`,'Local path copied')"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14v11H3z"/><path d="m6 9 2 2-2 2m4 0h4"/></svg><span>Copy local path</span></button>
        <button @click="copyAi"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="6" y="5" width="10" height="12" rx="2"/><path d="M6 14H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"/></svg><span>Copy for AI</span></button>
        <a :href="githubUrl" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M7 10h6m-3-3 3 3-3 3"/></svg><span>GitHub</span></a>
      </div>
    </header>
    <div v-if="notice" class="source-notice">{{notice}}</div>
    <div v-if="error" class="source-error">{{error}} <button @click="load"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 6V3l-1.5 1.5A7 7 0 1 0 17 10h-2a5 5 0 1 1-2-4l-2 2h5Z"/></svg><span>Retry</span></button></div>
    <div v-else-if="source" class="code-window"><div class="code-window__bar"><i></i><i></i><i></i><span>READ ONLY · PINNED PUBLIC SOURCE</span></div><pre><code><span v-for="(text,i) in source.lines" :key="i" :class="['source-line',{focused:source.from+i>=source.line&&source.from+i<=source.end}]"><b>{{source.from+i}}</b><span>{{text||' '}}</span></span></code></pre></div>
  </section>
</template>
