<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const timeline = ref([
  { time: 0, state: "idle", active: false },
  { time: 200, state: "loading", active: false },
  { time: 800, state: "error", active: false },
  { time: 1000, state: "loading (retry)", active: false },
  { time: 1500, state: "success", active: false },
]);

const currentIndex = ref(0);
let timer;

const playForward = () => {
  let idx = 0;
  timer = setInterval(() => {
    timeline.value.forEach((t) => (t.active = false));
    timeline.value[idx].active = true;
    currentIndex.value = idx;

    idx++;
    if (idx >= timeline.value.length) {
      clearInterval(timer);
      setTimeout(playBackward, 1000);
    }
  }, 600);
};

const playBackward = () => {
  let idx = timeline.value.length - 1;
  timer = setInterval(() => {
    timeline.value.forEach((t) => (t.active = false));
    timeline.value[idx].active = true;
    currentIndex.value = idx;

    idx--;
    if (idx < 0) {
      clearInterval(timer);
      setTimeout(playForward, 1000);
    }
  }, 400); // Scrub back faster
};

onMounted(() => {
  playForward();
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="scrubber-panel">
      <div class="video-player">
        <div
          class="state-display"
          :class="timeline[currentIndex].state.split(' ')[0]"
        >
          {{ timeline[currentIndex].state }}
        </div>

        <div class="controls">
          <i class="fa-solid fa-backward-step text-purple-500"></i>
          <div class="scrubber-bar">
            <div
              class="fill"
              :style="{
                width: `${(currentIndex / (timeline.length - 1)) * 100}%`,
              }"
            ></div>

            <div class="markers">
              <div
                class="marker"
                v-for="(t, i) in timeline"
                :key="i"
                :class="{ active: t.active, [t.state.split(' ')[0]]: true }"
                :style="{ left: `${(i / (timeline.length - 1)) * 100}%` }"
              ></div>
            </div>
          </div>
          <i class="fa-solid fa-forward-step text-purple-500"></i>
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

.scrubber-panel {
  width: 100%;
  max-width: 450px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

.state-display {
  height: 120px;
  background: var(--vp-c-bg-soft);
  border: 2px dashed var(--vp-c-divider);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  transition: all 0.2s;
  text-transform: uppercase;
}

.state-display.idle {
  color: var(--vp-c-text-2);
  border-color: var(--vp-c-text-3);
}
.state-display.loading {
  color: #eab308;
  border-color: #eab308;
  background: rgba(234, 179, 8, 0.05);
}
.state-display.error {
  color: #ef4444;
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}
.state-display.success {
  color: #22c55e;
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.05);
}

.controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.scrubber-bar {
  flex: 1;
  height: 8px;
  background: var(--vp-c-divider);
  border-radius: 4px;
  position: relative;
}

.fill {
  height: 100%;
  background: #a855f7; /* purple */
  border-radius: 4px;
  transition: width 0.3s linear;
}

.markers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.marker {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-divider);
  transform: translate(-50%, -50%);
  transition: all 0.2s;
}

.marker.active {
  transform: translate(-50%, -50%) scale(1.5);
  z-index: 10;
}

.marker.idle {
  border-color: var(--vp-c-text-3);
}
.marker.loading {
  border-color: #eab308;
}
.marker.error {
  border-color: #ef4444;
}
.marker.success {
  border-color: #22c55e;
}
</style>
