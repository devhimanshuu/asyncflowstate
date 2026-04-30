<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const generations = ref(0);
const timeout = ref(5000);
const retries = ref(3);
const staleTime = ref(10000);
const fitness = ref(0.42);

let timer;

const runEvolution = () => {
  timer = setInterval(() => {
    if (generations.value < 50) {
      generations.value += 1;
      // Mutate
      timeout.value = Math.max(
        1500,
        timeout.value - Math.floor(Math.random() * 200),
      );
      if (generations.value % 15 === 0 && retries.value > 1) retries.value -= 1;
      staleTime.value += Math.floor(Math.random() * 500);
      fitness.value = Math.min(
        0.98,
        fitness.value + 0.01 + Math.random() * 0.02,
      );
    } else {
      // Reset after a while
      setTimeout(() => {
        generations.value = 0;
        timeout.value = 5000;
        retries.value = 3;
        staleTime.value = 10000;
        fitness.value = 0.42;
      }, 3000);
    }
  }, 100); // Fast evolution
};

onMounted(() => {
  runEvolution();
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="dna-panel">
      <div class="header">
        <div class="title">
          <i class="fa-solid fa-dna text-fuchsia-500"></i> Flow DNA Evolution
        </div>
        <div class="generation">
          Generation: <span>{{ generations }}</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="label">Timeout</div>
          <div class="value" :class="{ evolved: generations > 0 }">
            {{ timeout }}<span class="unit">ms</span>
          </div>
        </div>
        <div class="stat-box">
          <div class="label">Max Retries</div>
          <div class="value" :class="{ evolved: generations > 0 }">
            {{ retries }}
          </div>
        </div>
        <div class="stat-box">
          <div class="label">Stale Time</div>
          <div class="value" :class="{ evolved: generations > 0 }">
            {{ (staleTime / 1000).toFixed(1) }}<span class="unit">s</span>
          </div>
        </div>
      </div>

      <div class="fitness-bar-container">
        <div class="label">Fitness Score (Latency Optimized)</div>
        <div class="bar-bg">
          <div class="bar-fill" :style="{ width: `${fitness * 100}%` }"></div>
        </div>
        <div class="score">{{ (fitness * 100).toFixed(1) }}%</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animation-container {
  margin: 2rem 0;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  display: flex;
  justify-content: center;
}

.dna-panel {
  width: 100%;
  max-width: 500px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.title {
  display: flex;
  gap: 8px;
  align-items: center;
}

.generation span {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 2px 8px;
  border-radius: 12px;
  font-family: monospace;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-box {
  background: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid var(--vp-c-divider);
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.value {
  font-size: 1.5rem;
  font-weight: 800;
  font-family: monospace;
  color: var(--vp-c-text-1);
  transition: color 0.2s;
}

.value.evolved {
  color: #a855f7; /* Fuchsia */
}

.unit {
  font-size: 0.8rem;
  opacity: 0.6;
  margin-left: 2px;
}

.fitness-bar-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bar-bg {
  width: 100%;
  height: 8px;
  background: var(--vp-c-divider);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #a855f7);
  border-radius: 4px;
  transition: width 0.1s linear;
}

.score {
  text-align: right;
  font-size: 0.85rem;
  font-weight: 600;
  color: #a855f7;
  font-family: monospace;
}
</style>
