<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const items = ref([]);
let spawnInterval;
let processInterval;

const start = () => {
  items.value = [];
  
  // User rapidly clicks 5 times
  let clicks = 0;
  spawnInterval = setInterval(() => {
    if (clicks < 5) {
      items.value.push({ id: clicks, status: 'queued' });
      clicks++;
    } else {
      clearInterval(spawnInterval);
    }
  }, 200);

  // Background thread processes them sequentially
  processInterval = setInterval(() => {
    const queued = items.value.find(i => i.status === 'queued');
    if (queued) {
      queued.status = 'processing';
      setTimeout(() => {
        queued.status = 'done';
      }, 700);
    } else if (items.value.every(i => i.status === 'done') && items.value.length === 5) {
      setTimeout(start, 2000);
    }
  }, 800);
};

onMounted(() => {
  start();
});

onUnmounted(() => {
  clearInterval(spawnInterval);
  clearInterval(processInterval);
});
</script>

<template>
  <div class="animation-container">
    <div class="layout">
      <div class="ui-thread">
        <div class="label">UI Thread (Always 60fps)</div>
        <button class="btn">Like Post <i class="fa-solid fa-heart text-red-500"></i></button>
        <div class="helper">Never shows loading!</div>
      </div>
      <div class="divider"></div>
      <div class="background-thread">
        <div class="label">Ghost Background Queue</div>
        <div class="queue">
          <transition-group name="ghost">
            <div class="ghost-item" v-for="item in items" :key="item.id" :class="item.status">
              <span v-if="item.status === 'queued'"><i class="fa-regular fa-clock"></i> Queued</span>
              <span v-else-if="item.status === 'processing'" class="spin"><i class="fa-solid fa-gear"></i> Processing</span>
              <span v-else><i class="fa-solid fa-check"></i> Synced</span>
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
}

.layout {
  display: flex;
  gap: 2rem;
}

.ui-thread, .background-thread {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  text-align: center;
}

.ui-thread {
  align-items: center;
  justify-content: center;
}

.btn {
  background: #ef4444;
  color: white;
  padding: 12px 24px;
  border-radius: 99px;
  font-weight: bold;
  border: none;
  cursor: default;
  transition: transform 0.1s;
}

.btn:active, .btn {
  animation: jiggle 2s infinite;
}

@keyframes jiggle {
  0% { transform: scale(1); }
  5% { transform: scale(0.95); }
  10% { transform: scale(1); }
  100% { transform: scale(1); }
}

.helper {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #10b981;
  font-weight: 600;
}

.divider {
  width: 2px;
  background: var(--vp-c-divider);
}

.queue {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 180px;
}

.ghost-item {
  padding: 8px 12px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  transition: all 0.3s;
}

.ghost-item.processing {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: rgba(100, 108, 255, 0.05);
}

.ghost-item.done {
  border-color: #10b981;
  color: #10b981;
  opacity: 0.5;
}

.spin {
  display: inline-block;
  animation: spin 2s linear infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.ghost-enter-active, .ghost-leave-active {
  transition: all 0.3s ease;
}
.ghost-enter-from { opacity: 0; transform: translateX(20px); }
.ghost-leave-to { opacity: 0; transform: scale(0.8); }
</style>
