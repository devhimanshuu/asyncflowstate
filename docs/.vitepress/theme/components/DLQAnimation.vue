<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const queue = ref([]);
let idCounter = 1;
let simInterval;

const spawnFailure = () => {
  const types = ["Timeout", "500 Internal", "Network Drop"];
  const id = `err_${idCounter++}`;
  
  queue.value.unshift({
    id,
    type: types[Math.floor(Math.random() * types.length)],
    time: "Just now"
  });

  if (queue.value.length > 4) {
    queue.value.pop();
  }
};

const replay = (id) => {
  const item = queue.value.find(i => i.id === id);
  if (item) {
    item.replaying = true;
    setTimeout(() => {
      queue.value = queue.value.filter(i => i.id !== id);
    }, 1000);
  }
};

onMounted(() => {
  // spawn some initial items
  spawnFailure();
  setTimeout(spawnFailure, 1000);
  
  simInterval = setInterval(() => {
    if (Math.random() > 0.5) spawnFailure();
  }, 2500);
});

onUnmounted(() => {
  clearInterval(simInterval);
});
</script>

<template>
  <div class="animation-container">
    <div class="header">
      <div class="title"><i class="fa-regular fa-envelope-open"></i> Dead Letter Queue</div>
      <div class="badge">{{ queue.length }} errors pending</div>
    </div>
    
    <div class="list">
      <transition-group name="list-anim">
        <div class="row" v-for="item in queue" :key="item.id" :class="{ returning: item.replaying }">
          <div class="icon"><i class="fa-solid fa-skull-crossbones text-red-500"></i></div>
          <div class="details">
            <div class="name">API Request Failed</div>
            <div class="desc">{{ item.type }} - {{ item.time }}</div>
          </div>
          <button class="action-btn" @click="replay(item.id)">Replay</button>
        </div>
      </transition-group>
      <div v-if="queue.length === 0" class="empty">CQ is empty.</div>
    </div>
  </div>
</template>

<style scoped>
.animation-container {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.title {
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 4px 10px;
  border-radius: 99px;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 250px;
}

.row {
  display: flex;
  align-items: center;
  background: var(--vp-c-bg);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s;
}

.row.returning {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
  transform: translateX(20px);
  opacity: 0;
}

.icon {
  margin-right: 12px;
  font-size: 1.2rem;
}

.details {
  flex: 1;
}

.name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

.desc {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.action-btn {
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.action-btn:hover {
  filter: brightness(1.1);
}

.empty {
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
  margin-top: 2rem;
}

.list-anim-enter-active, .list-anim-leave-active {
  transition: all 0.4s ease;
}
.list-anim-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.list-anim-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
