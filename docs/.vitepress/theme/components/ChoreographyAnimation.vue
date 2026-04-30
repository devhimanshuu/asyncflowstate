<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const steps = ref([
  { id: "cart", name: "validateCart", status: "idle", layer: 0 },
  { id: "stock", name: "checkStock", status: "idle", layer: 1 },
  { id: "discount", name: "applyDiscount", status: "idle", layer: 1 },
  { id: "tax", name: "calcTax", status: "idle", layer: 2 },
  { id: "pay", name: "chargePayment", status: "idle", layer: 3 },
]);

let timer;

const runSimulation = () => {
  steps.value.forEach((s) => (s.status = "idle"));

  setTimeout(() => {
    // Layer 0
    steps.value[0].status = "loading";
    setTimeout(() => {
      steps.value[0].status = "success";

      // Layer 1 (Parallel)
      steps.value[1].status = "loading";
      steps.value[2].status = "loading";

      setTimeout(() => {
        steps.value[1].status = "success";
        steps.value[2].status = "success";

        // Layer 2
        steps.value[3].status = "loading";

        setTimeout(() => {
          steps.value[3].status = "success";

          // Layer 3
          steps.value[4].status = "loading";

          setTimeout(() => {
            steps.value[4].status = "success";
            setTimeout(runSimulation, 2000);
          }, 800);
        }, 800);
      }, 1000);
    }, 800);
  }, 500);
};

onMounted(() => {
  runSimulation();
});

onUnmounted(() => {
  clearTimeout(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="dag-panel">
      <div class="title">Directed Acyclic Graph (DAG) Execution</div>

      <div class="layers">
        <div class="layer">
          <div class="node" :class="steps[0].status">{{ steps[0].name }}</div>
        </div>

        <div class="connector">
          <i class="fa-solid fa-arrow-down"></i>
          <i class="fa-solid fa-arrow-down"></i>
        </div>

        <div class="layer parallel">
          <div class="node" :class="steps[1].status">{{ steps[1].name }}</div>
          <div class="node" :class="steps[2].status">{{ steps[2].name }}</div>
        </div>

        <div class="connector"><i class="fa-solid fa-arrow-down"></i></div>

        <div class="layer">
          <div class="node" :class="steps[3].status">{{ steps[3].name }}</div>
        </div>

        <div class="connector"><i class="fa-solid fa-arrow-down"></i></div>

        <div class="layer">
          <div class="node" :class="steps[4].status">{{ steps[4].name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animation-container {
  margin: 2rem 0;
  padding: 2.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  display: flex;
  justify-content: center;
}

.dag-panel {
  width: 100%;
  max-width: 400px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.title {
  font-weight: 700;
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.layers {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.layer {
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

.node {
  background: var(--vp-c-bg-soft);
  border: 2px solid var(--vp-c-divider);
  padding: 8px 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.85rem;
  transition: all 0.3s;
  min-width: 140px;
}

.node.loading {
  border-color: #eab308;
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
  animation: pulse 1s infinite;
}

.node.success {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.connector {
  color: var(--vp-c-divider);
  display: flex;
  gap: 60px;
  font-size: 1.2rem;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}
</style>
