<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const entries = ref([
  { id: 1, name: "fetchUser", status: "success", latency: 120, retries: 0 },
  { id: 2, name: "getPermissions", status: "success", latency: 45, retries: 0 },
]);

const stats = ref({ execs: 42, success: 98, latency: 85, retries: 2 });
let nextId = 3;
let timer;

const runSimulation = () => {
  timer = setInterval(() => {
    // Add loading entry
    const newEntry = {
      id: nextId++,
      name: ["syncData", "ping", "uploadFile", "checkAuth"][
        Math.floor(Math.random() * 4)
      ],
      status: "loading",
      latency: null,
      retries: 0,
    };
    entries.value.unshift(newEntry);

    if (entries.value.length > 5) entries.value.pop();

    // Resolve it shortly after
    setTimeout(() => {
      const isError = Math.random() > 0.8;
      newEntry.status = isError ? "error" : "success";
      newEntry.latency = Math.floor(Math.random() * 300) + 20;

      stats.value.execs++;
      if (isError) {
        newEntry.retries++;
        stats.value.retries++;
        stats.value.success = Math.max(0, stats.value.success - 1);

        // Auto heal/retry
        setTimeout(() => {
          newEntry.status = "success";
          newEntry.latency += 500;
        }, 800);
      }
    }, 600);
  }, 2000);
};

onMounted(() => {
  runSimulation();
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="devtools-panel">
      <div class="header">
        <div class="title">⚡ AsyncFlowState DevTools</div>
        <div class="shortcut">Ctrl+Shift+F</div>
      </div>

      <div class="timeline">
        <transition-group name="list">
          <div class="entry" v-for="e in entries" :key="e.id">
            <div class="dot" :class="e.status"></div>
            <div class="name">{{ e.name }}</div>
            <div class="latency" v-if="e.retries > 0">↻{{ e.retries }}</div>
            <div class="latency">
              {{ e.latency ? `${e.latency}ms` : "..." }}
            </div>
          </div>
        </transition-group>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="val">{{ stats.execs }}</div>
          <div class="lbl">Executions</div>
        </div>
        <div class="stat">
          <div class="val text-green-400">{{ stats.success }}%</div>
          <div class="lbl">Success</div>
        </div>
        <div class="stat">
          <div class="val">{{ stats.latency }}ms</div>
          <div class="lbl">Avg Latency</div>
        </div>
        <div class="stat">
          <div class="val text-amber-400">{{ stats.retries }}</div>
          <div class="lbl">Retries</div>
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

.devtools-panel {
  width: 100%;
  max-width: 450px;
  background: #1a1a2e; /* Dark theme forced */
  color: #e0e0e0;
  border: 1px solid #2d2d44;
  border-radius: 12px;
  overflow: hidden;
  font-family: monospace;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.header {
  background: #7c3aed; /* Purple */
  color: white;
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.shortcut {
  opacity: 0.7;
  font-size: 0.75rem;
}

.timeline {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 180px;
  overflow: hidden;
}

.entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #16213e;
  border-radius: 6px;
  font-size: 0.85rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot.success {
  background: #22c55e;
}
.dot.error {
  background: #ef4444;
}
.dot.loading {
  background: #eab308;
  animation: pulse 1s infinite;
}

.name {
  flex: 1;
}

.latency {
  opacity: 0.6;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 12px;
  border-top: 1px solid #2d2d44;
  background: #0f172a;
}

.stat {
  text-align: center;
}

.val {
  font-size: 1.1rem;
  font-weight: 800;
  color: #7c3aed;
}

.lbl {
  font-size: 0.65rem;
  text-transform: uppercase;
  opacity: 0.5;
  margin-top: 4px;
}

.text-green-400 {
  color: #4ade80 !important;
}
.text-amber-400 {
  color: #fbbf24 !important;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
