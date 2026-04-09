<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const likeState = ref("unliked");
const isFloating = ref(false);
let timer;

const runSimulation = () => {
  // Step 1: Click
  likeState.value = "loading"; // Standard loading
  isFloating.value = true;

  setTimeout(() => {
    // Both success
    likeState.value = "liked";
    isFloating.value = false;

    // Reset
    timer = setTimeout(() => {
      likeState.value = "unliked";
      timer = setTimeout(runSimulation, 1500);
    }, 2500);
  }, 1500);
};

onMounted(() => {
  timer = setTimeout(runSimulation, 1000);
});

onUnmounted(() => {
  clearTimeout(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="side-by-side">
      <!-- Standard UX -->
      <div class="demo-card">
        <div class="demo-title">Standard UX</div>
        <div class="mock-post">
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>

          <button
            class="action-btn"
            :class="{
              loading: likeState === 'loading',
              active: likeState === 'liked',
            }"
          >
            <span v-if="likeState === 'unliked'"
              ><i class="fa-regular fa-heart"></i> Like</span
            >
            <span v-else-if="likeState === 'loading'" class="loader"
              ><i class="fa-solid fa-hourglass-half"></i> Waiting...</span
            >
            <span v-else class="liked-heart"
              ><i class="fa-solid fa-heart text-red-500"></i> Liked</span
            >
          </button>
        </div>
      </div>

      <!-- Optimistic UX -->
      <div class="demo-card optimistic-card">
        <div class="demo-title highlight">Optimistic UI</div>
        <div class="mock-post">
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>

          <button class="action-btn active optimistic-btn">
            <span v-if="likeState === 'unliked'"
              ><i class="fa-regular fa-heart"></i> Like</span
            >
            <span v-else class="liked-heart">
              <i class="fa-solid fa-heart text-red-500"></i> Liked
              <span class="floating-heart" v-if="isFloating"
                ><i class="fa-solid fa-heart text-red-500"></i
              ></span>
            </span>
          </button>

          <div
            class="network-status"
            :class="{ visible: likeState === 'loading' }"
          >
            Saving to server...
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
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}

.side-by-side {
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: center;
}

@media (max-width: 640px) {
  .side-by-side {
    flex-direction: column;
  }
}

.demo-card {
  flex: 1;
  max-width: 320px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.optimistic-card {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.25);
}

.demo-title {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  text-align: center;
}

.highlight {
  color: var(--vp-c-brand-1);
}

.mock-post {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-text {
  height: 12px;
  background: var(--vp-c-divider);
  border-radius: 6px;
  width: 100%;
}

.skeleton-text.short {
  width: 60%;
}

.action-btn {
  margin-top: 1rem;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.action-btn.active {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.liked-heart {
  animation: heartBump 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.floating-heart {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  animation: floatUp 1.2s ease-out forwards;
  opacity: 0;
  pointer-events: none;
}

.network-status {
  position: absolute;
  bottom: -30px;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateY(-10px);
}

.network-status.visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes heartBump {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes floatUp {
  0% {
    transform: translate(-50%, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -40px) scale(1.5);
    opacity: 0;
  }
}
</style>
