<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const tabs = ref([
  {
    id: 1,
    type: "leader",
    status: "fetching",
    label: "Leader Tab",
    data: null,
  },
  { id: 2, type: "follower", status: "waiting", label: "Tab 2", data: null },
  { id: 3, type: "follower", status: "waiting", label: "Tab 3", data: null },
]);

let timer;

const runSimulation = () => {
  tabs.value.forEach((t) => {
    t.status = t.type === "leader" ? "fetching" : "waiting";
    t.data = null;
  });

  setTimeout(() => {
    // Leader gets data
    const data = "Data_v3";
    tabs.value[0].status = "success";
    tabs.value[0].data = data;

    // Broadcast
    setTimeout(() => {
      tabs.value[1].status = "synced";
      tabs.value[1].data = data;
      tabs.value[2].status = "synced";
      tabs.value[2].data = data;

      setTimeout(runSimulation, 3000);
    }, 400);
  }, 1500);
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
    <div class="browser">
      <div class="tab-bar">
        <div class="tab" v-for="t in tabs" :key="t.id" :class="t.type">
          <i class="fa-brands fa-chrome" v-if="t.type === 'leader'"></i>
          <i class="fa-regular fa-window-maximize" v-else></i>
          {{ t.label }}
        </div>
      </div>

      <div class="content">
        <div class="mesh-network">
          <div class="node leader">
            <div class="icon">👑</div>
            <div class="state" :class="tabs[0].status">
              <i
                class="fa-solid fa-cloud-arrow-down"
                v-if="tabs[0].status === 'fetching'"
              ></i>
              <i class="fa-solid fa-check" v-else></i>
              {{ tabs[0].status === "fetching" ? "Fetching API..." : "Cached" }}
            </div>
            <div class="data" v-if="tabs[0].data">{{ tabs[0].data }}</div>
          </div>

          <div class="arrows">
            <div class="arrow" :class="{ active: tabs[1].status === 'synced' }">
              <i class="fa-solid fa-arrow-right-arrow-left"></i>
              BroadcastChannel
            </div>
          </div>

          <div class="followers">
            <div class="node" v-for="t in [tabs[1], tabs[2]]" :key="t.id">
              <div class="state" :class="t.status">
                <i
                  class="fa-regular fa-clock"
                  v-if="t.status === 'waiting'"
                ></i>
                <i class="fa-solid fa-bolt" v-else></i>
                {{
                  t.status === "waiting" ? "Waiting cache..." : "Instant Load"
                }}
              </div>
              <div class="data" v-if="t.data">{{ t.data }}</div>
            </div>
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
  display: flex;
  justify-content: center;
}

.browser {
  width: 100%;
  max-width: 500px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

.tab-bar {
  display: flex;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 8px 8px 0;
  gap: 4px;
}

.tab {
  padding: 8px 16px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab.leader {
  color: #f97316; /* orange */
}

.content {
  padding: 2rem;
}

.mesh-network {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.node {
  background: var(--vp-c-bg-soft);
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  position: relative;
  min-width: 120px;
}

.node.leader {
  border-color: #f97316;
}

.icon {
  position: absolute;
  top: -12px;
  left: -12px;
  font-size: 1.5rem;
}

.state {
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.state.fetching {
  color: #3b82f6;
  animation: pulse 1s infinite;
}
.state.success {
  color: #22c55e;
}
.state.waiting {
  color: var(--vp-c-text-3);
}
.state.synced {
  color: #f97316;
}

.data {
  background: var(--vp-c-bg);
  padding: 4px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
  border: 1px solid var(--vp-c-divider);
}

.arrows {
  flex: 1;
  display: flex;
  justify-content: center;
}

.arrow {
  font-size: 0.7rem;
  font-family: monospace;
  color: var(--vp-c-text-3);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: color 0.3s;
}

.arrow.active {
  color: #f97316;
}

.followers {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
