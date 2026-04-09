<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const mainThreadFps = ref(60);
const workerStatus = ref("idle");
let mainTimer;
let workerTimer;

const simulateHeavyWork = () => {
  // Main thread hit
  mainThreadFps.value = 4;
  workerStatus.value = "idle";

  setTimeout(() => {
    mainThreadFps.value = 60;

    // Now trigger worker offload
    setTimeout(() => {
      workerStatus.value = "processing";

      setTimeout(() => {
        workerStatus.value = "success";

        // Loop
        setTimeout(simulateHeavyWork, 3000);
      }, 2500);
    }, 2000);
  }, 2500);
};

onMounted(() => {
  simulateHeavyWork();

  // Random jitter in main thread FPS
  mainTimer = setInterval(() => {
    if (mainThreadFps.value > 10) {
      mainThreadFps.value = 58 + Math.floor(Math.random() * 3);
    }
  }, 200);
});

onUnmounted(() => {
  clearTimeout(workerTimer);
  clearInterval(mainTimer);
});
</script>

<template>
  <div class="animation-container">
    <div class="thread main-thread">
      <div class="header">
        <span>Main UI Thread</span>
        <div class="fps" :class="{ poor: mainThreadFps < 30 }">
          {{ mainThreadFps }} FPS
        </div>
      </div>
      <div class="graphs">
        <div
          class="bar"
          :style="{
            width: mainThreadFps < 30 ? '100%' : '15%',
            background: mainThreadFps < 30 ? '#ef4444' : '#10b981',
          }"
        ></div>
        <div class="tag" v-if="mainThreadFps < 30">
          UI FROZEN (Standard Flow)
        </div>
        <div class="tag safe" v-else>UI RESPONSIVE</div>
      </div>
    </div>

    <div class="connector">
      <div v-if="workerStatus === 'processing'" class="data-stream"></div>
    </div>

    <div class="thread background-thread">
      <div class="header">
        <span>Web Worker Thread</span>
        <div class="status-badge" :class="workerStatus">
          {{
            workerStatus === "processing"
              ? "Processing..."
              : workerStatus === "success"
                ? "Finished"
                : "Idle"
          }}
        </div>
      </div>
      <div class="graphs">
        <div
          class="bar"
          :style="{
            width: workerStatus === 'processing' ? '100%' : '5%',
            background:
              workerStatus === 'processing'
                ? 'var(--vp-c-brand-1)'
                : 'var(--vp-c-divider)',
          }"
        ></div>
        <div class="tag safe" v-if="workerStatus === 'processing'">
          Heavy Compute (flow.worker)
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animation-container {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.thread {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 1rem;
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
}

.fps {
  font-family: monospace;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.fps.poor {
  background: #ef4444;
  color: white;
}

.status-badge {
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--vp-c-bg-mute);
}

.status-badge.processing {
  background: var(--vp-c-brand-1);
  color: white;
}

.graphs {
  height: 24px;
  background: var(--vp-c-bg-mute);
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.bar {
  height: 100%;
  transition:
    width 0.3s ease,
    background 0.3s ease;
}

.tag {
  position: absolute;
  top: 0;
  left: 8px;
  bottom: 0;
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
}

.tag.safe {
  color: var(--vp-c-text-2);
}

.connector {
  height: 20px;
  position: relative;
  border-left: 2px dashed var(--vp-c-divider);
  margin-left: 2rem;
}

.data-stream {
  position: absolute;
  top: 0;
  left: -2px;
  bottom: 0;
  width: 2px;
  background: var(--vp-c-brand-1);
  animation: slideDown 1s infinite linear;
}

@keyframes slideDown {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}
</style>
