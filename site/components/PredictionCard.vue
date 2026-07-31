<script setup>
import { ref, useId } from "vue";
defineProps({ question: String, answer: String, hint: String });
const revealed = ref(false);
const hintOpen = ref(false);
const id = useId();
</script>

<template>
  <aside class="prediction-card">
    <div class="prediction-kicker">PAUSE · PREDICT</div>
    <h3>{{ question }}</h3>
    <p>Say your answer out loud or write it down before revealing ours.</p>
    <div class="prediction-actions">
      <button :aria-expanded="hintOpen" :aria-controls="`${id}-hint`" @click="hintOpen = !hintOpen">{{ hintOpen ? 'Hide hint' : 'Small hint' }}</button>
      <button class="reveal" :aria-expanded="revealed" :aria-controls="`${id}-answer`" @click="revealed = !revealed">{{ revealed ? 'Hide answer' : 'Reveal answer' }}</button>
    </div>
    <div v-if="hintOpen && !revealed" :id="`${id}-hint`" class="prediction-hint">{{ hint }}</div>
    <div v-if="revealed" :id="`${id}-answer`" class="prediction-answer" role="status"><strong>OUR MODEL</strong>{{ answer }}</div>
  </aside>
</template>
