<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const events = ref([
  {
    id: 1,
    time: "0ms",
    type: "start",
    label: "EXECUTE",
    color: "brand",
    active: false,
  },
  {
    id: 2,
    time: "1s",
    type: "retry",
    label: "RETRY",
    color: "warning",
    active: false,
  },
  {
    id: 3,
    time: "2s",
    type: "success",
    label: "SUCCESS",
    color: "accent",
    active: false,
  },
]);

const progress = ref(0);
const activeEventIndex = ref(-1);
let timer;

const runAnimation = () => {
  progress.value = 0;
  activeEventIndex.value = -1;

  timer = setInterval(() => {
    progress.value += 1;

    if (progress.value === 1) activeEventIndex.value = 0;
    if (progress.value === 40) activeEventIndex.value = 1;
    if (progress.value === 80) activeEventIndex.value = 2;

    if (progress.value >= 100) {
      clearInterval(timer);
      setTimeout(runAnimation, 3000);
    }
  }, 30);
};

onMounted(() => {
  runAnimation();
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="debugger-ui">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="controls">
          <i class="fa-solid fa-backward-step"></i>
          <i class="fa-solid fa-play"></i>
          <i class="fa-solid fa-forward-step"></i>
        </div>
        <div class="search-bar">Filter events...</div>
      </div>

      <!-- Timeline -->
      <div class="timeline-container">
        <div class="timeline">
          <!-- Time Grid Lines -->
          <div
            v-for="n in 5"
            :key="n"
            class="grid-line"
            :style="{ left: `${(n - 1) * 25}%` }"
          >
            <span>{{ (n - 1) * 0.5 }}s</span>
          </div>

          <!-- Event Track -->
          <div class="track">
            <div
              v-for="(event, index) in events"
              :key="event.id"
              class="event-marker"
              :class="[event.color, { active: activeEventIndex === index }]"
              :style="{ left: `${index * 40}%` }"
            >
              <div class="pulse"></div>
              <div class="marker-info">
                <span class="marker-type">{{ event.label }}</span>
                <span class="marker-time">{{ event.time }}</span>
              </div>
            </div>

            <!-- Playhead -->
            <div class="playhead" :style="{ left: `${progress}%` }">
              <div class="playhead-line"></div>
              <div class="playhead-handle"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Event List -->
      <div class="event-details">
        <div class="event-header">State Snapshot</div>
        <div class="event-data">
          <div class="json-line">
            <span class="key">"status"</span>:
            <span class="val"
              >"{{
                activeEventIndex === 0
                  ? "loading"
                  : activeEventIndex === 1
                    ? "retrying"
                    : activeEventIndex === 2
                      ? "success"
                      : "idle"
              }}"</span
            >
          </div>
          <div class="json-line">
            <span class="key">"retryCount"</span>:
            <span class="val">{{ activeEventIndex >= 1 ? "1" : "0" }}</span>
          </div>
          <div class="json-line">
            <span class="key">"data"</span>:
            <span class="val">{{
              activeEventIndex === 2 ? '{"id": 1, "name": "Flow"}' : "null"
            }}</span>
          </div>
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
  border-radius: 20px;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.debugger-ui {
  width: 100%;
  max-width: 500px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.toolbar {
  padding: 10px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  gap: 16px;
}

.controls {
  display: flex;
  gap: 12px;
  color: var(--vp-c-brand-1);
  font-size: 0.8rem;
}
.search-bar {
  flex: 1;
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  padding: 4px 10px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}

.timeline-container {
  padding: 40px 20px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.timeline {
  height: 60px;
  position: relative;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.grid-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--vp-c-divider);
  opacity: 0.5;
}

.grid-line span {
  position: absolute;
  top: -20px;
  left: -10px;
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.track {
  position: relative;
  width: 100%;
  height: 100%;
}

.event-marker {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  cursor: pointer;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.event-marker.active {
  transform: translateY(-50%) scale(1.5);
  box-shadow: 0 0 15px currentColor;
}
.event-marker.brand {
  color: var(--vp-c-brand-1);
  background: currentColor;
}
.event-marker.warning {
  color: #f9e2af;
  background: currentColor;
}
.event-marker.accent {
  color: #94e2d5;
  background: currentColor;
}

.marker-info {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.marker-type {
  font-size: 0.55rem;
  font-weight: 800;
  text-transform: uppercase;
}
.marker-time {
  font-size: 0.5rem;
  opacity: 0.6;
}

.pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: currentColor;
  opacity: 0;
}

.active .pulse {
  animation: markerPulse 1.5s infinite;
}

@keyframes markerPulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

.playhead {
  position: absolute;
  top: -10px;
  bottom: -10px;
  width: 1px;
  z-index: 10;
  transition: left 0.03s linear;
}

.playhead-line {
  width: 100%;
  height: 100%;
  background: #f38ba8;
}
.playhead-handle {
  position: absolute;
  top: -8px;
  left: -4px;
  width: 9px;
  height: 9px;
  background: #f38ba8;
  border-radius: 50%;
}

.event-details {
  padding: 16px;
  background: #1e1e2e;
  color: #cdd6f4;
  height: 120px;
}

.event-header {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #cdd6f4;
  margin-bottom: 8px;
  opacity: 0.5;
  letter-spacing: 0.1em;
}

.event-data {
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
}
.json-line {
  margin-bottom: 4px;
}
.key {
  color: #f5e0dc;
}
.val {
  color: #fab387;
}
</style>
