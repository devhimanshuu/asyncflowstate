<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const nodes = ref([
  { id: 1, name: "API.fetchUser", active: false, done: false },
  { id: 2, name: "API.fetchPosts", active: false, done: false },
  { id: 3, name: "Process & Filter", active: false, done: false },
]);

let timer;

const runWave = () => {
  nodes.value.forEach((n) => {
    n.active = false;
    n.done = false;
  });
  let idx = 0;

  const step = () => {
    if (idx > 0) {
      nodes.value[idx - 1].active = false;
      nodes.value[idx - 1].done = true;
    }

    if (idx < nodes.value.length) {
      nodes.value[idx].active = true;
      idx++;
      timer = setTimeout(step, 1200);
    } else {
      timer = setTimeout(runWave, 2500);
    }
  };

  step();
};

onMounted(() => {
  runWave();
});

onUnmounted(() => {
  clearTimeout(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="subtitle">pipe() execution flow</div>
    <div class="pipeline">
      <template v-for="(node, index) in nodes" :key="node.id">
        <div class="node" :class="{ active: node.active, done: node.done }">
          <div class="icon">
            <span v-if="node.active"><i class="fa-solid fa-gear"></i></span>
            <span v-else-if="node.done"><i class="fa-solid fa-check"></i></span>
            <span v-else><i class="fa-solid fa-hourglass-half"></i></span>
          </div>
          {{ node.name }}
        </div>
        <div
          class="arrow"
          v-if="index < nodes.length - 1"
          :class="{ active: nodes[index].done }"
        >
          <div class="line"></div>
          <div class="head"></div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.animation-container {
  margin: 2rem 0;
  padding: 3rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}

.subtitle {
  text-align: center;
  font-size: 0.8rem;
  font-family: monospace;
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.pipeline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.node {
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-divider);
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  min-width: 120px;
  text-align: center;
}

.node.active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  box-shadow: 0 0 15px rgba(100, 108, 255, 0.2);
  transform: translateY(-5px);
}

.node.done {
  border-color: #10b981;
  color: #10b981;
}

.icon {
  font-size: 1.5rem;
}

.arrow {
  display: flex;
  align-items: center;
  width: 40px;
  opacity: 0.3;
  transition: opacity 0.3s;
}

.arrow.active {
  opacity: 1;
}

.arrow .line {
  flex: 1;
  height: 2px;
  background: var(--vp-c-text-2);
}

.arrow .head {
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 8px solid var(--vp-c-text-2);
}
</style>
