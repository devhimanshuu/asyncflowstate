<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const state = ref("idle");
let timer;

const runCycle = () => {
  state.value = "loading";
  timer = setTimeout(() => {
    state.value = "success";
    timer = setTimeout(() => {
      state.value = "idle";
    }, 2500);
  }, 2000);
};

onMounted(() => {
  runCycle();
  timer = setInterval(runCycle, 6000);
});

onUnmounted(() => {
  clearInterval(timer);
  clearTimeout(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="state-machine">
      <div class="state-node" :class="{ active: state === 'idle' }">
        <div class="icon"><i class="fa-solid fa-moon"></i></div>
        <div class="label">Idle</div>
      </div>
      <div class="arrow" :class="{ active: state !== 'idle' }"></div>
      <div class="state-node" :class="{ active: state === 'loading' }">
        <div class="icon" :class="{ spin: state === 'loading' }">
          <i class="fa-solid fa-spinner"></i>
        </div>
        <div class="label">Loading</div>
        <div class="glow" v-if="state === 'loading'"></div>
      </div>
      <div class="arrow" :class="{ active: state === 'success' }"></div>
      <div class="state-node" :class="{ active: state === 'success' }">
        <div class="icon success-icon">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <div class="label">Success</div>
        <div class="glow success-glow" v-if="state === 'success'"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animation-container {
  margin: 2rem 0;
  padding: 3rem 2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}

.state-machine {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
}

.state-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: var(--vp-c-bg);
  border-radius: 50%;
  width: 100px;
  height: 100px;
  justify-content: center;
  border: 2px solid var(--vp-c-divider);
  opacity: 0.5;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.state-node.active {
  opacity: 1;
  transform: scale(1.15);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.2);
}

.icon {
  font-size: 1.8rem;
  line-height: 1;
  color: var(--vp-c-brand-1);
}

.icon.success-icon {
  color: var(--vp-c-success-1, #10b981);
}

.spin {
  animation: spin 1.5s linear infinite;
}

.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: var(--vp-c-brand-1);
  filter: blur(25px);
  opacity: 0.25;
  border-radius: 50%;
  z-index: -1;
  animation: pulse 1.5s ease-in-out infinite;
}

.success-glow {
  background: var(--vp-c-success-1, #10b981);
}

.state-node.active:last-child {
  border-color: var(--vp-c-success-1, #10b981);
}

.label {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-1);
}

.arrow {
  width: 40px;
  height: 4px;
  background: var(--vp-c-divider);
  border-radius: 2px;
  position: relative;
  transition: all 0.4s ease;
  overflow: hidden;
}

.arrow::after {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    var(--vp-c-brand-1),
    transparent
  );
  transition: all 0.4s ease;
}

.arrow.active::after {
  animation: slide 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.2;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.35;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.2;
  }
}

@keyframes slide {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@media (max-width: 640px) {
  .state-machine {
    flex-direction: column;
    gap: 1rem;
  }
  .arrow {
    width: 4px;
    height: 30px;
  }
  .arrow::after {
    background: linear-gradient(
      180deg,
      transparent,
      var(--vp-c-brand-1),
      transparent
    );
    animation: slide-down 1.5s linear infinite;
  }
}

@keyframes slide-down {
  0% {
    top: -100%;
    left: 0;
  }
  100% {
    top: 100%;
    left: 0;
  }
}
</style>
