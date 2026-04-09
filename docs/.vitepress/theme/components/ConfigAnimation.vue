<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const layers = ref([
  { id: 1, name: "Built-in Defaults", opacity: 1, scale: 1, active: true },
  { id: 2, name: "Global Config", opacity: 0, scale: 0.8, active: false },
  { id: 3, name: "Local Options", opacity: 0, scale: 0.8, active: false },
  { id: 4, name: "Runtime Overrides", opacity: 0, scale: 0.8, active: false },
]);

let timer;
let step = 0;

const runCycle = () => {
  // Reset
  layers.value.forEach((l, i) => {
    l.opacity = i === 0 ? 1 : 0;
    l.scale = i === 0 ? 1 : 0.8;
    l.active = i === 0;
  });
  step = 0;

  timer = setInterval(() => {
    step++;
    if (step < layers.value.length) {
      const prev = layers.value[step - 1];
      const cur = layers.value[step];

      prev.opacity = 0.4;
      prev.scale = 0.9;
      prev.active = false;

      cur.opacity = 1;
      cur.scale = 1;
      cur.active = true;
    } else {
      clearInterval(timer);
      setTimeout(runCycle, 3000);
    }
  }, 1500);
};

onMounted(() => {
  runCycle();
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="layers-stack">
      <div
        v-for="layer in layers"
        :key="layer.id"
        class="config-layer"
        :class="{ active: layer.active }"
        :style="{
          opacity: layer.opacity,
          transform: `translateY(${(layer.id - 1) * -40}px) scale(${layer.scale})`,
          zIndex: layer.id,
        }"
      >
        <div class="layer-content">
          <div class="layer-badge">Level {{ layer.id }}</div>
          <div class="layer-name">{{ layer.name }}</div>
          <div class="layer-code">
            retry:
            {{
              layer.id === 1
                ? "1"
                : layer.id === 2
                  ? "3"
                  : layer.id === 3
                    ? "5"
                    : "10"
            }}
          </div>
        </div>
      </div>
    </div>

    <div class="result-box">
      <div class="result-label">Effective Config:</div>
      <div class="result-value">
        retry:
        <span class="highlight">{{
          layers[step >= layers.length ? layers.length - 1 : step].id === 1
            ? "1"
            : layers[step].id === 2
              ? "3"
              : layers[step].id === 3
                ? "5"
                : "10"
        }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animation-container {
  margin: 2rem 0;
  padding: 4rem 2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.layers-stack {
  position: relative;
  height: 200px;
  width: 100%;
  max-width: 400px;
  display: flex;
  justify-content: center;
}

.config-layer {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
  transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.config-layer.active {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 15px 45px -10px rgba(99, 102, 241, 0.3);
}

.layer-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.layer-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 8px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 4px;
  text-transform: uppercase;
}

.layer-name {
  flex: 1;
  font-weight: 700;
  font-size: 1rem;
  color: var(--vp-c-text-1);
}

.layer-code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  color: var(--vp-c-brand-1);
}

.result-box {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 1rem 2rem;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.result-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.result-value {
  font-family: var(--vp-font-family-mono);
  font-size: 1rem;
  font-weight: 700;
}

.highlight {
  color: var(--vp-c-brand-1);
}

@media (max-width: 640px) {
  .config-layer {
    padding: 1rem;
  }
  .layer-content {
    gap: 0.75rem;
  }
}
</style>
