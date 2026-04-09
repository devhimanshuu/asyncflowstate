<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const tab1state = ref("idle");
const tab2state = ref("idle");
let timer;

const runSyncCycle = () => {
  tab1state.value = "idle";
  tab2state.value = "idle";

  setTimeout(() => {
    tab1state.value = "loading"; // Tab 1 starts an action (e.g. login)
    setTimeout(() => {
      tab2state.value = "loading";
    }, 100); // BroadcastChannel delay

    setTimeout(() => {
      tab1state.value = "success"; // Tab 1 finishes
      setTimeout(() => {
        tab2state.value = "success";
      }, 100);

      timer = setTimeout(runSyncCycle, 3000);
    }, 1500);
  }, 1000);
};

onMounted(() => {
  runSyncCycle();
});

onUnmounted(() => {
  clearTimeout(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="tabs-container">
      <div class="browser-tab">
        <div class="tab-header">
          <i class="fa-solid fa-globe"></i> Window A (Active)
        </div>
        <div class="tab-body">
          <div class="state-output" :class="tab1state">
            status: {{ tab1state }}
          </div>
        </div>
      </div>

      <div class="sync-signal">
        <div
          class="signal-line"
          :class="{ active: tab1state !== 'idle' }"
        ></div>
        <span>BroadcastChannel Sync</span>
      </div>

      <div class="browser-tab">
        <div class="tab-header inactive">
          <i class="fa-solid fa-globe"></i> Window B (Background)
        </div>
        <div class="tab-body">
          <div class="state-output" :class="tab2state">
            status: {{ tab2state }}
          </div>
        </div>
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
  overflow: hidden;
}

.tabs-container {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
}

.browser-tab {
  flex: 1;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.tab-header {
  background: var(--vp-c-bg-mute);
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border-bottom: 1px solid var(--vp-c-divider);
}

.tab-header.inactive {
  color: var(--vp-c-text-3);
}

.tab-body {
  padding: 24px;
  display: flex;
  justify-content: center;
}

.state-output {
  font-family: monospace;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.state-output.idle {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
}
.state-output.loading {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
.state-output.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.sync-signal {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  font-size: 0.75rem;
}

.signal-line {
  width: 100%;
  min-width: 80px;
  height: 2px;
  background: dashed 2px var(--vp-c-divider);
  margin-bottom: 8px;
  position: relative;
}

.signal-line.active::after {
  content: "";
  position: absolute;
  top: -2px;
  left: 0;
  bottom: -2px;
  width: 20px;
  background: var(--vp-c-brand-1);
  border-radius: 4px;
  animation: traverse 0.5s infinite linear;
}

@keyframes traverse {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(60px);
    opacity: 0;
  }
}
</style>
