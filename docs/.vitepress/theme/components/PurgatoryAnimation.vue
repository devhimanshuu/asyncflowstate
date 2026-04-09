<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const state = ref('idle');
const countdown = ref(5);
let timer;
let intTimer;

const triggerAction = () => {
  if (state.value !== 'idle') return;
  state.value = 'purgatory';
  countdown.value = 5;
  
  intTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(intTimer);
      state.value = 'loading';
      setTimeout(() => {
        state.value = 'success';
        timer = setTimeout(() => reset(), 2000);
      }, 1500);
    }
  }, 1000);
};

const triggerUndo = () => {
  if (state.value !== 'purgatory') return;
  clearInterval(intTimer);
  state.value = 'undo';
  timer = setTimeout(() => reset(), 2000);
};

const reset = () => {
  state.value = 'idle';
  countdown.value = 5;
  clearInterval(intTimer);
  clearTimeout(timer);
};

onMounted(() => {
  setTimeout(() => triggerAction(), 500);
});

onUnmounted(() => {
  clearInterval(intTimer);
  clearTimeout(timer);
});
</script>

<template>
  <div class="animation-container">
     <div class="header">
      <div class="pill" :class="state">
        <span v-if="state === 'idle'">Waiting for User</span>
        <span v-else-if="state === 'purgatory'"><i class="fa-solid fa-hourglass-half"></i> Deletion pending... ({{ countdown }}s)</span>
        <span v-else-if="state === 'loading'"><i class="fa-solid fa-satellite-dish"></i> Processing...</span>
        <span v-else-if="state === 'success'"><i class="fa-solid fa-check"></i> User Deleted!</span>
        <span v-else-if="state === 'undo'"><i class="fa-solid fa-rotate-left"></i> Action Undone (Saved)</span>
      </div>
    </div>
    <div class="actions">
      <button class="btn destructive" @click="triggerAction" :disabled="state !== 'idle'">
        Delete Account
      </button>
      <button class="btn secondary" @click="triggerUndo" :disabled="state !== 'purgatory'" :class="{ pulse: state === 'purgatory' }">
        Undo Delete
      </button>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.header {
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.pill {
  padding: 10px 24px;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 200px;
  text-align: center;
}

.pill.idle { background: var(--vp-c-default-soft); color: var(--vp-c-text-2); }
.pill.purgatory { background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.3); color: #eab308; }
.pill.loading { background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); color: #3b82f6; }
.pill.success { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; }
.pill.undo { background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); color: #a855f7; }

.actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  border: none;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.destructive {
  background: #ef4444;
  color: white;
}

.secondary {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.pulse {
  animation: pulsing 1.5s infinite;
  box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
  border-color: #4ade80;
  color: #22c55e;
}

@keyframes pulsing {
  0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); }
  100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
}
</style>
