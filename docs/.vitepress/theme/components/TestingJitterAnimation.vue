<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const metrics = ref({
  latencyMs: 50,
  packetLoss: 0,
});

let timer;

const runSimulation = () => {
  timer = setInterval(() => {
    // Determine random jitter conditions for this tick
    const isFlaky = Math.random() > 0.6; 
    
    if (isFlaky) {
      metrics.value.latencyMs = Math.floor(Math.random() * 1500) + 300; // Spike: 300ms - 1800ms
      metrics.value.packetLoss = Math.floor(Math.random() * 30); // Spike: 0-30% loss
    } else {
      metrics.value.latencyMs = Math.floor(Math.random() * 30) + 40; // Normal: 40-70ms
      metrics.value.packetLoss = 0;
    }
  }, 1500); // Change conditions every 1.5 seconds
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
    <div class="header">
      <i class="fa-solid fa-fire text-orange-500"></i> simulateJitter() Telemetry
    </div>
    
    <div class="dashboard">
      <div class="metric-card" :class="{ 'warning': metrics.latencyMs > 500 }">
        <div class="label">Artificial Latency</div>
        <div class="value">{{ metrics.latencyMs }}<span class="unit">ms</span></div>
        <div class="trend-bar">
          <div class="fill" :style="{ width: `${Math.min(100, (metrics.latencyMs / 1800) * 100)}%` }"></div>
        </div>
      </div>
      
      <div class="metric-card" :class="{ 'danger': metrics.packetLoss > 0 }">
        <div class="label">Simulated Failure Rate</div>
        <div class="value">{{ metrics.packetLoss }}<span class="unit">%</span></div>
        <div class="trend-bar error-trend">
          <div class="fill" :style="{ width: `${metrics.packetLoss}%` }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animation-container {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #1e1e20; /* Darker console aesthetic */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
  font-family: 'JetBrains Mono', monospace;
}

.header {
  color: var(--vp-c-text-1);
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}

.dashboard {
  display: flex;
  gap: 1.5rem;
}

.metric-card {
  flex: 1;
  background: rgba(255,255,255,0.05);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #10b981; /* Green safe by default */
  transition: all 0.3s;
}

.metric-card.warning {
  border-left-color: #eab308;
}

.metric-card.danger {
  border-left-color: #ef4444;
}

.label {
  font-size: 0.7rem;
  color: #a1a1aa;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.value {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.unit {
  font-size: 1rem;
  color: #a1a1aa;
}

.trend-bar {
  margin-top: 10px;
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
}

.trend-bar .fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.metric-card.warning .trend-bar .fill {
  background: #eab308;
}

.metric-card.danger .trend-bar .fill {
  background: #ef4444;
}
</style>
