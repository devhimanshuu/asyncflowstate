<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const isEdge = ref(false);
const activeFunc = ref("client");
const latency = ref(150);

let timer;

const runSimulation = () => {
  timer = setInterval(() => {
    isEdge.value = !isEdge.value;

    if (isEdge.value) {
      activeFunc.value = "edge";
      latency.value = 12; // Edge is fast
    } else {
      activeFunc.value = "client";
      latency.value = 150; // Standard network latency
    }
  }, 3000);
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
    <div class="edge-panel">
      <div class="toggle-container">
        <span :class="{ active: !isEdge }">Browser Request</span>
        <div class="toggle" :class="{ 'is-edge': isEdge }">
          <div class="knob"></div>
        </div>
        <span :class="{ active: isEdge }"
          >Edge Request (Cloudflare/Vercel)</span
        >
      </div>

      <div class="network-map">
        <div class="device client" :class="{ active: activeFunc === 'client' }">
          <i class="fa-solid fa-laptop"></i>
          <div>Client Runtime</div>
        </div>

        <div class="connection">
          <div class="line" :class="{ fast: isEdge }"></div>
          <div class="latency-badge">{{ latency }}ms</div>
        </div>

        <div
          class="device edge-server"
          :class="{ active: activeFunc === 'edge' }"
        >
          <i class="fa-solid fa-server"></i>
          <div>Edge Runtime</div>
          <div class="cache-hit" v-if="isEdge">⚡ Edge Cache Hit</div>
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

.edge-panel {
  width: 100%;
  max-width: 500px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

.toggle-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 3rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.toggle-container span.active {
  color: var(--vp-c-text-1);
}

.toggle {
  width: 40px;
  height: 20px;
  background: var(--vp-c-divider);
  border-radius: 10px;
  position: relative;
  transition: background 0.3s;
}

.toggle.is-edge {
  background: #3b82f6; /* blue */
}

.knob {
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle.is-edge .knob {
  transform: translateX(20px);
}

.network-map {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.device {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  transition: all 0.3s;
  position: relative;
}

.device i {
  font-size: 2.5rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 50%;
  transition: all 0.3s;
}

.device.active.client i {
  color: #8b5cf6;
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}
.device.active.edge-server i {
  color: #3b82f6;
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.connection {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line {
  width: 100%;
  height: 4px;
  background: var(--vp-c-divider);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.line::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 30%;
  background: #8b5cf6;
  animation: moveLine 1.5s linear infinite;
}

.line.fast::after {
  background: #3b82f6;
  animation: moveLine 0.2s linear infinite; /* Much faster */
}

.latency-badge {
  position: absolute;
  top: -25px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: monospace;
}

.cache-hit {
  position: absolute;
  bottom: -25px;
  font-size: 0.7rem;
  font-weight: 800;
  color: #f59e0b;
  white-space: nowrap;
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes moveLine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

@keyframes pop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
