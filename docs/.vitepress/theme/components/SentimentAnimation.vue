<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const frustration = ref(0.2);
const cursorX = ref(50);
const cursorY = ref(50);
const isRageClicking = ref(false);
const helpMode = ref(false);

let timer;

const runSimulation = () => {
  let tick = 0;

  timer = setInterval(() => {
    tick++;

    // Move cursor erratically
    if (tick < 20) {
      // Normal movement
      cursorX.value = 50 + Math.sin(tick * 0.2) * 30;
      cursorY.value = 50 + Math.cos(tick * 0.2) * 20;
      frustration.value = 0.2;
    } else if (tick >= 20 && tick < 40) {
      // Erratic movement (frustration building)
      cursorX.value = 50 + (Math.random() - 0.5) * 80;
      cursorY.value = 50 + (Math.random() - 0.5) * 80;
      frustration.value = Math.min(0.85, frustration.value + 0.05);

      if (tick % 5 === 0) {
        isRageClicking.value = true;
        setTimeout(() => (isRageClicking.value = false), 100);
      }
    } else if (tick === 40) {
      // Threshold crossed
      helpMode.value = true;
      cursorX.value = 50;
      cursorY.value = 70; // Move to help button
    } else if (tick > 50) {
      // Reset
      tick = 0;
      frustration.value = 0.2;
      helpMode.value = false;
    }
  }, 150);
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
    <div class="app-window" :class="{ 'help-active': helpMode }">
      <!-- Tracker Overlay -->
      <div class="sentiment-overlay">
        <div class="score-bar">
          <div
            class="fill"
            :style="{
              width: `${frustration * 100}%`,
              background: frustration > 0.7 ? '#ec4899' : '#3b82f6',
            }"
          ></div>
        </div>
        <div class="score-text">
          Frustration Score: {{ (frustration * 100).toFixed(0) }}%
        </div>
      </div>

      <!-- Fake UI -->
      <div class="fake-form">
        <div class="input-skeleton"></div>
        <div class="input-skeleton"></div>

        <transition name="fade">
          <div class="help-bubble" v-if="helpMode">
            <i class="fa-solid fa-robot"></i> Need help filling this out?
            <button class="auto-fill">Auto-fill</button>
          </div>
        </transition>

        <button class="submit-btn" :class="{ simple: helpMode }">Submit</button>
      </div>

      <!-- Fake Cursor -->
      <div
        class="fake-cursor"
        :class="{ clicking: isRageClicking }"
        :style="{ left: `${cursorX}%`, top: `${cursorY}%` }"
      >
        <i class="fa-solid fa-arrow-pointer"></i>
        <div class="click-ring" v-if="isRageClicking"></div>
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

.app-window {
  width: 100%;
  max-width: 400px;
  height: 300px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
  transition: all 0.5s;
}

.app-window.help-active {
  border-color: #ec4899;
  box-shadow: 0 10px 40px -10px rgba(236, 72, 153, 0.2);
}

.sentiment-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.score-bar {
  height: 4px;
  background: var(--vp-c-divider);
  border-radius: 2px;
  margin-bottom: 6px;
  overflow: hidden;
}

.fill {
  height: 100%;
  transition: all 0.2s;
}

.score-text {
  font-size: 0.7rem;
  font-family: monospace;
  color: var(--vp-c-text-2);
  text-align: right;
}

.fake-form {
  padding: 60px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  justify-content: center;
}

.input-skeleton {
  height: 40px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
}

.submit-btn {
  height: 40px;
  background: var(--vp-c-brand-1);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s;
}

.submit-btn.simple {
  height: 50px;
  font-size: 1.1rem;
}

.help-bubble {
  background: #ec4899;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auto-fill {
  background: white;
  color: #ec4899;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.75rem;
}

.fake-cursor {
  position: absolute;
  font-size: 1.2rem;
  color: var(--vp-c-text-1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: all 0.15s linear;
  pointer-events: none;
  z-index: 20;
}

.fake-cursor.clicking {
  transform: scale(0.9);
}

.click-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: rgba(236, 72, 153, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: clickRipple 0.4s ease-out forwards;
}

@keyframes clickRipple {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 40px;
    height: 40px;
    opacity: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
