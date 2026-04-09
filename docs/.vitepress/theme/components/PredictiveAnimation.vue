<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const cursorPosition = ref(-100);
const buttonState = ref("idle"); // idle, hovered
const requestState = ref("none"); // none, fetching, ready
let animationFrameId;

const animateCursor = () => {
  let direction = 1;
  let speed = 2; // px per frame

  const step = () => {
    cursorPosition.value += speed * direction;

    // Bounds checking
    if (cursorPosition.value > 200) {
      direction = -1;
      setTimeout(() => {
        requestState.value = "none";
        buttonState.value = "idle";
      }, 500); // Reset after moving away
    } else if (cursorPosition.value < -100) {
      direction = 1;
    }

    // Hover logic hit detection (simulate hovering over the button area)
    const isHovering = cursorPosition.value > 20 && cursorPosition.value < 100;

    if (isHovering && buttonState.value === "idle") {
      buttonState.value = "hovered";
      // Automatically prefetch without a click
      if (requestState.value === "none") {
        requestState.value = "fetching";
        setTimeout(() => {
          if (requestState.value === "fetching") {
            requestState.value = "ready";
          }
        }, 1000); // Simulating network lag
      }
    } else if (!isHovering && buttonState.value === "hovered") {
      buttonState.value = "idle";
    }

    animationFrameId = requestAnimationFrame(step);
  };

  animationFrameId = requestAnimationFrame(step);
};

onMounted(() => {
  animateCursor();
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});
</script>

<template>
  <div class="animation-container">
    <div class="subtitle">Intent-based Prefetching (No Click Required)</div>
    <div class="scene-zone">
      <div
        class="cursor"
        :style="{
          transform: `translateX(${cursorPosition}px) translateY(10px)`,
        }"
      >
        <i class="fa-solid fa-hand-pointer"></i>
      </div>
      <div class="mock-btn" :class="buttonState">User Profile</div>
    </div>

    <div class="network-monitor">
      <div class="net-status">
        <span class="dot" :class="requestState"></span>
        <span v-if="requestState === 'none'">Idle</span>
        <span v-else-if="requestState === 'fetching'" class="fetching-text"
          >Prefetching payload...</span
        >
        <span v-else-if="requestState === 'ready'" class="ready-text"
          >Data ready BEFORE click!
          <i class="fa-solid fa-bolt text-yellow-400"></i
        ></span>
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
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.subtitle {
  font-size: 0.8rem;
  font-family: monospace;
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
  text-transform: uppercase;
}

.scene-zone {
  position: relative;
  width: 250px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0, 0, 0, 0.02) 10px,
    rgba(0, 0, 0, 0.02) 20px
  );
  border-radius: 8px;
  border: 1px dashed var(--vp-c-divider);
}

.mock-btn {
  background: var(--vp-c-brand-1);
  color: white;
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: bold;
  transition: all 0.2s;
  z-index: 10;
}

.mock-btn.hovered {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(100, 108, 255, 0.4);
}

.cursor {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 1.5rem;
  z-index: 20;
  pointer-events: none;
}

.network-monitor {
  margin-top: 1.5rem;
  width: 100%;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 10px 16px;
  border-radius: 8px;
}

.net-status {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-family: monospace;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 12px;
  background: var(--vp-c-divider);
}

.dot.fetching {
  background: #3b82f6;
  animation: pulsenet 1s infinite alternate;
}
.dot.ready {
  background: #10b981;
}

.fetching-text {
  color: #3b82f6;
}
.ready-text {
  color: #10b981;
  font-weight: bold;
}

@keyframes pulsenet {
  from {
    opacity: 0.5;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>
