<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const items = ref([]);
let attemptCount = 0;
let timer;

const runSimulation = () => {
  items.value = [];
  attemptCount = 0;
  scheduleAttempt();
};

const scheduleAttempt = () => {
  attemptCount++;
  items.value.push({
    id: attemptCount,
    status: 'loading'
  });

  setTimeout(() => {
    const item = items.value.find(i => i.id === attemptCount);
    if (!item) return;

    if (attemptCount < 3) {
      item.status = 'failed';
      // Exponential backoff mock: 500ms, 1000ms
      const delay = attemptCount === 1 ? 800 : 1600;
      timer = setTimeout(scheduleAttempt, delay);
    } else {
      item.status = 'success';
      // Reset after success
      timer = setTimeout(runSimulation, 4000);
    }
  }, 1000); // Network request time
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
    <div class="legend">Exponential Backoff Simulation</div>
    <div class="attempts-track">
      <div class="start-line"></div>
      <transition-group name="attempt-anim">
        <div 
          v-for="(item, index) in items" 
          :key="item.id"
          class="attempt-row"
        >
          <div class="delay-bar" v-if="index > 0" :style="{ width: index === 1 ? '60px' : '150px' }">
            <span class="delay-text">{{ index === 1 ? '1s' : '2s' }}</span>
          </div>
          
          <div class="network-request" :class="item.status">
            <span class="pulse" v-if="item.status === 'loading'"></span>
            <span v-if="item.status === 'loading'">Requesting...</span>
            <span v-else-if="item.status === 'failed'"><i class="fa-solid fa-xmark"></i> Error (500)</span>
            <span v-else><i class="fa-solid fa-check"></i> Success (200)</span>
          </div>
        </div>
      </transition-group>
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
  box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05);
}

.legend {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.attempts-track {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.start-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--vp-c-divider);
}

.attempt-row {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  height: 44px;
}

.delay-bar {
  height: 2px;
  background: dashed 2px var(--vp-c-divider);
  margin-right: 1rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delay-bar::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-bottom: 2px dashed var(--vp-c-brand-1);
  opacity: 0.5;
}

.delay-text {
  position: absolute;
  top: -20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.network-request {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.5s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.network-request.loading {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  min-width: 130px;
}

.network-request.failed {
  background: var(--vp-c-danger-soft, rgba(239, 68, 68, 0.1));
  border: 1px solid var(--vp-c-danger-1, #ef4444);
  color: var(--vp-c-danger-1, #ef4444);
  min-width: 130px;
}

.network-request.success {
  background: var(--vp-c-success-soft, rgba(16, 185, 129, 0.1));
  border: 1px solid var(--vp-c-success-1, #10b981);
  color: var(--vp-c-success-1, #10b981);
  min-width: 130px;
}

.pulse {
  width: 8px;
  height: 8px;
  background: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: pulsing 1s infinite alternate;
}

@keyframes pulsing {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.2); opacity: 1; }
}

.attempt-anim-enter-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.attempt-anim-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.attempt-anim-leave-to {
  opacity: 0;
}
</style>
