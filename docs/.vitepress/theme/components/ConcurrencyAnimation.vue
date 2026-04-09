<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const clicks = ref([]);
const lanes = ref({
  keep: [],
  restart: [],
  enqueue: []
});

let timer;
let cycleCount = 0;

const runSimulation = () => {
  // Clear previous
  clicks.value = [];
  lanes.value = { keep: [], restart: [], enqueue: [] };
  cycleCount = 0;

  // Simulate 3 clicks in quick succession
  setTimeout(() => triggerClick(1), 500);
  setTimeout(() => triggerClick(2), 1500);
  setTimeout(() => triggerClick(3), 2000);
};

const triggerClick = (id) => {
  clicks.value.push(id);
  
  // Keep: only register if nothing is running
  if (lanes.value.keep.length === 0) {
    startTask('keep', id, 2500);
  } else {
    lanes.value.keep.push({ id, status: 'ignored' });
  }

  // Restart: kill running, start new
  lanes.value.restart = lanes.value.restart.map(t => t.status === 'running' ? { ...t, status: 'cancelled' } : t);
  startTask('restart', id, 2500);

  // Enqueue: add to queue, run if nothing running
  lanes.value.enqueue.push({ id, status: 'queued' });
  processEnqueue();
};

const startTask = (lane, id, duration) => {
  lanes.value[lane].push({ id, status: 'running' });
  setTimeout(() => {
    const task = lanes.value[lane].find(t => t.id === id);
    if (task && task.status === 'running') {
      task.status = 'success';
      if (lane === 'enqueue') processEnqueue();
    }
  }, duration);
};

const processEnqueue = () => {
  const isRunning = lanes.value.enqueue.some(t => t.status === 'running');
  if (!isRunning) {
    const nextText = lanes.value.enqueue.find(t => t.status === 'queued');
    if (nextText) {
      nextText.status = 'running';
      setTimeout(() => {
        if (nextText.status === 'running') {
          nextText.status = 'success';
          processEnqueue();
        }
      }, 2000);
    }
  }
};

onMounted(() => {
  runSimulation();
  timer = setInterval(runSimulation, 8000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="clicks-timeline">
      <span class="label">User Clicks</span>
      <div class="timeline">
        <div 
          v-for="i in 3" 
          :key="i"
          class="click-marker" 
          :class="{ active: clicks.includes(i) }"
          :style="{ left: i === 1 ? '10%' : i === 2 ? '30%' : '40%' }"
        ><i class="fa-solid fa-hand-pointer"></i></div>
      </div>
    </div>

    <div class="lanes">
      <div class="lane" v-for="(tasks, name) in lanes" :key="name">
        <div class="lane-header">
          <span class="lane-title">{{ name }}</span>
        </div>
        <div class="lane-track">
          <transition-group name="task-list">
            <div 
              v-for="task in tasks" 
              :key="task.id + task.status"
              class="task"
              :class="task.status"
            >
              Action {{ task.id }}
            </div>
          </transition-group>
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
  box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05);
}

.clicks-timeline {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed var(--vp-c-divider);
}

.timeline {
  flex: 1;
  height: 4px;
  background: var(--vp-c-divider);
  border-radius: 2px;
  position: relative;
}

.click-marker {
  position: absolute;
  top: -24px;
  font-size: 1.5rem;
  opacity: 0.2;
  transform: translateX(-50%) scale(0.8);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.click-marker.active {
  opacity: 1;
  transform: translateX(-50%) scale(1.2);
  animation: bounce 0.5s ease-out;
}

.label {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-2);
  min-width: 100px;
}

.lanes {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.lane {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.lane-header {
  min-width: 100px;
}

.lane-title {
  font-weight: 700;
  color: var(--vp-c-brand-1);
  text-transform: capitalize;
  background: var(--vp-c-brand-soft);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.lane-track {
  flex: 1;
  height: 44px;
  background: rgba(0,0,0,0.03);
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 8px;
  overflow: hidden;
}

.dark .lane-track {
  background: rgba(255,255,255,0.03);
}

.task {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.5s ease;
}

.task.running {
  background: var(--vp-c-brand-1);
  color: white;
  box-shadow: 0 0 15px var(--vp-c-brand-soft);
  animation: pulse-width 2.5s linear forwards;
}

.task.success {
  background: var(--vp-c-success-1, #10b981);
  color: white;
}

.task.ignored, .task.cancelled {
  background: var(--vp-c-divider);
  color: var(--vp-c-text-3);
  text-decoration: line-through;
  opacity: 0.6;
}

.task.queued {
  background: var(--vp-c-warning-soft, rgba(245, 158, 11, 0.2));
  color: var(--vp-c-warning-1, #f59e0b);
  border: 1px dashed var(--vp-c-warning-1, #f59e0b);
}

.task-list-enter-active, .task-list-leave-active {
  transition: all 0.4s ease;
}
.task-list-enter-from {
  opacity: 0;
  transform: translateX(-20px) scale(0.9);
}
.task-list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@keyframes bounce {
  0% { transform: translate(-50%, -10px) scale(1); }
  50% { transform: translate(-50%, 5px) scale(1.3); }
  100% { transform: translate(-50%, 0) scale(1.2); }
}

@keyframes pulse-width {
  0% { min-width: 60px; }
  100% { min-width: 250px; }
}

@media (max-width: 640px) {
  .lane {
    flex-direction: column;
    align-items: flex-start;
  }
  .lane-track {
    width: 100%;
  }
}
</style>
