<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const items = ref([
  { id: 1, name: 'Trigger', icon: 'fa-play', color: 'brand', active: false },
  { id: 2, name: 'Logger', icon: 'fa-list-ul', color: 'accent', active: false },
  { id: 3, name: 'Sentry', icon: 'fa-bug', color: 'error', active: false },
  { id: 4, name: 'Toast', icon: 'fa-bell', color: 'warning', active: false },
  { id: 5, name: 'API', icon: 'fa-cloud', color: 'brand', active: false },
]);

const activeIndex = ref(-1);
let timer;

const startAnimation = () => {
  activeIndex.value = -1;
  timer = setInterval(() => {
    activeIndex.value++;
    if (activeIndex.value >= items.value.length) {
      activeIndex.value = -1;
      clearInterval(timer);
      setTimeout(startAnimation, 2000);
    }
  }, 800);
};

onMounted(() => {
  startAnimation();
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="pipeline">
      <div 
        v-for="(item, index) in items" 
        :key="item.id"
        class="pipeline-node"
        :class="{ active: index === activeIndex, passed: index < activeIndex }"
      >
        <div class="node-icon" :class="item.color">
          <i class="fa-solid" :class="item.icon"></i>
        </div>
        <div class="node-name">{{ item.name }}</div>
        
        <div v-if="index < items.length - 1" class="connector">
          <div class="connector-line"></div>
          <div class="connector-pulse" :class="{ animate: index === activeIndex }"></div>
        </div>
      </div>
    </div>
    
    <div class="terminal">
      <div class="terminal-header">
        <div class="dots"><span></span><span></span><span></span></div>
        <div class="title">middleware.log</div>
      </div>
      <div class="terminal-body font-mono text-xs">
        <div v-if="activeIndex >= 1" class="line text-accent opacity-80 animate-in">> [Logger] Initializing flow...</div>
        <div v-if="activeIndex >= 2" class="line text-error opacity-80 animate-in">> [Sentry] Tracing error context...</div>
        <div v-if="activeIndex >= 3" class="line text-warning opacity-80 animate-in">> [Toast] Action in progress...</div>
        <div v-if="activeIndex >= 4" class="line text-brand opacity-80 animate-in">> [API] Fetching from endpoint...</div>
        <div v-if="activeIndex === -1" class="line opacity-30">Waiting for trigger...</div>
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
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  overflow: hidden;
}

.pipeline {
  display: flex;
  align-items: center;
  gap: 0;
  width: 100%;
  max-width: 600px;
  justify-content: space-between;
}

.pipeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
}

.node-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: var(--vp-c-text-2);
}

.pipeline-node.active .node-icon {
  transform: scale(1.2);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

.pipeline-node.passed .node-icon {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  opacity: 0.6;
}

.node-name {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.6;
  white-space: nowrap;
}

.pipeline-node.active .node-name {
  opacity: 1;
  color: var(--vp-c-brand-1);
}

.connector {
  position: absolute;
  left: 48px;
  top: 24px;
  width: calc(100% + 20px);
  height: 2px;
  z-index: -1;
}

.connector-line {
  width: 100%;
  height: 100%;
  background: var(--vp-c-divider);
}

.connector-pulse {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0%;
  background: var(--vp-c-brand-1);
}

.connector-pulse.animate {
  animation: pulse 0.8s linear forwards;
}

@keyframes pulse {
  0% { width: 0%; left: 0; }
  100% { width: 100%; left: 0; }
}

.terminal {
  width: 100%;
  max-width: 450px;
  background: #1e1e2e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
}

.terminal-header {
  background: #2b2b3b;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dots { display: flex; gap: 6px; }
.dots span { width: 8px; height: 8px; border-radius: 50%; background: #444; }
.dots span:nth-child(1) { background: #ff5f56; }
.dots span:nth-child(2) { background: #ffbd2e; }
.dots span:nth-child(3) { background: #27c93f; }

.title { font-size: 0.7rem; color: #999; font-weight: 600; }

.terminal-body {
  padding: 16px;
  min-height: 120px;
  color: #cdd6f4;
}

.line { margin-bottom: 6px; }

.animate-in {
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 0.8; transform: translateX(0); }
}

.text-brand { color: #89b4fa; }
.text-accent { color: #94e2d5; }
.text-error { color: #f38ba8; }
.text-warning { color: #f9e2af; }
</style>
