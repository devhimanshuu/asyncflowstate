<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const flasherState = ref('idle');
const smoothState = ref('idle');
let timer;

const runSimulation = () => {
  // Reset
  flasherState.value = 'idle';
  smoothState.value = 'idle';
  
  // Wait, then trigger very fast network request (50ms)
  timer = setTimeout(() => {
    // 1. Without minDuration
    flasherState.value = 'loading';
    setTimeout(() => {
      flasherState.value = 'success';
    }, 50); // Fast response causes UI jitter
    
    // 2. With minDuration (enforced UX delay)
    smoothState.value = 'loading';
    setTimeout(() => {
       // Network finished in 50ms, but UI waits until 400ms
    }, 50);
    setTimeout(() => {
      smoothState.value = 'success';
    }, 600); // Wait 600ms minimum duration for a smooth experience!
    
    // Reset cycle
    timer = setTimeout(runSimulation, 2500);

  }, 1000);
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
    <div class="comparison-grid">
      
      <!-- Bad UX -->
      <div class="card bad-ux">
        <div class="card-header">
          <span class="bad-icon"><i class="fa-solid fa-xmark"></i></span> Without minDuration
        </div>
        <div class="visual">
          <button class="mock-btn" :class="flasherState">
            <span v-if="flasherState === 'idle'">Load Data</span>
            <span v-else-if="flasherState === 'loading'" class="loader">
              <span class="spinner"></span>
            </span>
            <span v-else class="success-txt">Done!</span>
          </button>
        </div>
        <div class="caption">Network responds in 50ms. Causes an ugly UI flash.</div>
      </div>

      <!-- Good UX -->
      <div class="card good-ux">
        <div class="card-header">
          <span class="good-icon"><i class="fa-solid fa-check"></i></span> With minDuration (600ms)
        </div>
        <div class="visual">
          <button class="mock-btn smooth" :class="smoothState">
            <span v-if="smoothState === 'idle'">Load Data</span>
            <span v-else-if="smoothState === 'loading'" class="loader">
              <span class="spinner smooth-spinner"></span> Loading...
            </span>
            <span v-else class="success-txt">Done!</span>
          </button>
        </div>
        <div class="caption">FlowState prevents UI jitter by enforcing a minimum readable loading time.</div>
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
  box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05);
}

.comparison-grid {
  display: flex;
  gap: 2rem;
}

@media (max-width: 640px) {
  .comparison-grid {
    flex-direction: column;
  }
}

.card {
  flex: 1;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.card-header {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--vp-c-divider);
}

.bad-icon { color: #ef4444; }
.good-icon { color: #10b981; }

.visual {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.mock-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  min-width: 140px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.mock-btn.success {
  background: var(--vp-c-success-1, #10b981);
}

.mock-btn.loading {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.smooth {
  transition: all 0.4s ease;
}

.loader {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0,0,0,0.1);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.smooth-spinner {
  animation: spin 1s linear infinite;
}

.caption {
  margin-top: 2rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  text-align: center;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
