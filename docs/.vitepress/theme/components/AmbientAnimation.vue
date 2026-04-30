<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const battery = ref(100);
const network = ref("4g");
const cpu = ref("Low");
const behavior = ref("Standard Execution");
const actionColor = ref("#3b82f6");

let timer;

const runSimulation = () => {
  let step = 0;
  timer = setInterval(() => {
    step++;

    if (step === 1) {
      battery.value = 85;
      network.value = "4g";
      cpu.value = "Low";
      behavior.value = "Standard Execution";
      actionColor.value = "#3b82f6";
    } else if (step === 2) {
      battery.value = 12;
      behavior.value = "Deferred (Low Battery)";
      actionColor.value = "#f59e0b"; // amber
    } else if (step === 3) {
      battery.value = 60; // Plugged in
      network.value = "2g";
      behavior.value = "Compressed Payload (Slow Network)";
      actionColor.value = "#8b5cf6"; // purple
    } else if (step === 4) {
      network.value = "4g";
      cpu.value = "Critical (95%)";
      behavior.value = "Throttled Concurrency (High CPU)";
      actionColor.value = "#ef4444"; // red
    } else if (step >= 5) {
      step = 0; // Reset
    }
  }, 2500);
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
    <div class="device-panel">
      <div class="sensors">
        <div class="sensor" :class="{ warning: battery <= 15 }">
          <i class="fa-solid fa-battery-half"></i>
          <div class="val">{{ battery }}%</div>
        </div>
        <div class="sensor" :class="{ warning: network === '2g' }">
          <i class="fa-solid fa-wifi"></i>
          <div class="val">{{ network }}</div>
        </div>
        <div class="sensor" :class="{ warning: cpu.includes('Critical') }">
          <i class="fa-solid fa-microchip"></i>
          <div class="val">{{ cpu }}</div>
        </div>
      </div>

      <div class="flow-execution" :style="{ borderColor: actionColor }">
        <div class="flow-title">flow.execute()</div>
        <div class="flow-behavior" :style="{ color: actionColor }">
          <i class="fa-solid fa-bolt" v-if="actionColor === '#3b82f6'"></i>
          <i class="fa-regular fa-clock" v-if="actionColor === '#f59e0b'"></i>
          <i class="fa-solid fa-compress" v-if="actionColor === '#8b5cf6'"></i>
          <i
            class="fa-solid fa-gauge-high"
            v-if="actionColor === '#ef4444'"
          ></i>
          {{ behavior }}
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

.device-panel {
  width: 100%;
  max-width: 450px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sensors {
  display: flex;
  justify-content: space-around;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed var(--vp-c-divider);
}

.sensor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-1);
  transition: all 0.3s;
}

.sensor i {
  font-size: 1.5rem;
  color: var(--vp-c-text-2);
}

.sensor.warning i {
  color: #ef4444;
  animation: pulse 1s infinite;
}

.sensor .val {
  font-size: 0.85rem;
  font-weight: 600;
  font-family: monospace;
}

.flow-execution {
  padding: 1.5rem;
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;
  background: var(--vp-c-bg-soft);
}

.flow-title {
  font-family: monospace;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.flow-behavior {
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.9);
  }
}
</style>
