<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const state = ref("idle"); // idle, speculative, morphing, settled
const value = ref("$12,000"); // Original
const specValue = ref("$15,000"); // Optimistic

let timer;

const runSimulation = () => {
  // Reset
  state.value = "idle";
  value.value = "$12,000";

  setTimeout(() => {
    // User clicks: Speculative execution instantly updates UI
    state.value = "speculative";

    setTimeout(() => {
      // Server responds with slightly different data
      state.value = "morphing";
      specValue.value = "$14,500"; // Server corrected it

      setTimeout(() => {
        state.value = "settled";
        value.value = "$14,500";
        setTimeout(runSimulation, 2000);
      }, 600); // Morph duration
    }, 1500); // Server latency
  }, 1000);
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
    <div class="speculative-panel">
      <div class="status-bar">
        <span class="badge" :class="state">{{ state.toUpperCase() }}</span>
        <span class="server-status" v-if="state === 'speculative'">
          <i class="fa-solid fa-circle-notch fa-spin"></i> Server Syncing...
        </span>
      </div>

      <div class="data-card">
        <div class="label">Projected Revenue</div>

        <div
          class="value-container"
          :class="{ morphing: state === 'morphing' }"
        >
          <!-- Standard -->
          <div
            class="actual-value"
            v-if="state === 'idle' || state === 'settled'"
          >
            {{ value }}
          </div>

          <!-- Speculative Update -->
          <div
            class="speculative-value"
            v-if="state === 'speculative' || state === 'morphing'"
          >
            {{ specValue }}
            <span class="indicator"
              ><i class="fa-solid fa-wand-magic-sparkles"></i
            ></span>
          </div>
        </div>

        <button class="action-btn" :disabled="state !== 'idle'">
          Add $3,000
        </button>
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

.speculative-panel {
  width: 100%;
  max-width: 400px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

.status-bar {
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.badge.speculative {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4; /* cyan */
}

.badge.morphing {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7; /* purple */
}

.badge.settled {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e; /* green */
}

.server-status {
  color: var(--vp-c-text-3);
  display: flex;
  align-items: center;
  gap: 6px;
}

.data-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.label {
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  letter-spacing: 0.05em;
}

.value-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.actual-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}

.speculative-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #06b6d4;
  position: relative;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); /* Morph ease */
}

.morphing .speculative-value {
  color: var(--vp-c-text-1);
  transform: scale(1.05);
}

.indicator {
  position: absolute;
  top: -10px;
  right: -20px;
  font-size: 1rem;
  color: #06b6d4;
}

.morphing .indicator {
  opacity: 0;
  transition: opacity 0.3s;
}

.action-btn {
  width: 100%;
  padding: 12px;
  background: var(--vp-c-brand-1);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 1rem;
  opacity: 1;
  transition: opacity 0.2s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
