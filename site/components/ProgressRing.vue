<script setup>
import { computed } from "vue";
const props = defineProps({ value: { type: Number, default: 0 }, label: { type: String, default: "Progress" }, color: { type: String, default: "var(--lime)" } });
const safe = computed(() => Math.max(0, Math.min(100, props.value)));
</script>

<template>
  <div class="progress-ring" :style="{ '--progress': `${safe * 3.6}deg`, '--ring-color': color }">
    <div class="progress-ring__center">
      <strong>{{ Math.round(safe) }}%</strong>
      <span>{{ label }}</span>
    </div>
  </div>
</template>
