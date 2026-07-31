<script setup>
import { ref } from "vue";
defineProps({ question: String, answer: String, hint: String });
const revealed = ref(false);
const hintOpen = ref(false);
</script>

<template>
  <aside class="prediction-card">
    <div class="prediction-kicker">PAUSE · PREDICT</div>
    <h3>{{ question }}</h3>
    <p>Say your answer out loud or write it down before revealing ours.</p>
    <div class="prediction-actions"><button @click="hintOpen = !hintOpen">{{ hintOpen ? 'Hide hint' : 'Small hint' }}</button><button class="reveal" @click="revealed = !revealed">{{ revealed ? 'Hide answer' : 'Reveal answer' }}</button></div>
    <div v-if="hintOpen && !revealed" class="prediction-hint">{{ hint }}</div>
    <div v-if="revealed" class="prediction-answer"><strong>OUR MODEL</strong>{{ answer }}</div>
  </aside>
</template>
