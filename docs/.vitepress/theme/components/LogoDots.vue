<script setup>
import { onMounted, ref } from "vue";

const dots = ref([]);
const numDots = 60;
const lines = ref([]);
const numLines = 15;

const generateDots = () => {
  const newDots = [];
  for (let i = 0; i < numDots; i++) {
    newDots.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * -10,
      duration: Math.random() * 10 + 5,
      opacity: Math.random() * 0.4 + 0.1,
      angle: Math.random() * 360,
      distance: Math.random() * 50 + 20,
    });
  }
  dots.value = newDots;

  const newLines = [];
  for (let i = 0; i < numLines; i++) {
    newLines.push({
      id: i,
      x1: Math.random() * 100,
      y1: Math.random() * 100,
      x2: Math.random() * 100,
      y2: Math.random() * 100,
      delay: Math.random() * -5,
      duration: Math.random() * 8 + 4,
    });
  }
  lines.value = newLines;
};

onMounted(() => {
  generateDots();
});
</script>

<template>
  <div class="premium-geometric-bg">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>

    <svg class="lines-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line
        v-for="line in lines"
        :key="line.id"
        :x1="line.x1"
        :y1="line.y1"
        :x2="line.x2"
        :y2="line.y2"
        class="geo-line"
        :style="{
          animationDelay: `${line.delay}s`,
          animationDuration: `${line.duration}s`,
        }"
      />
    </svg>

    <div
      v-for="dot in dots"
      :key="dot.id"
      class="particle"
      :style="{
        left: `${dot.x}%`,
        top: `${dot.y}%`,
        width: `${dot.size}px`,
        height: `${dot.size}px`,
        animationDelay: `${dot.delay}s`,
        animationDuration: `${dot.duration}s`,
        opacity: dot.opacity,
        '--dist': `${dot.distance}px`,
        '--angle': `${dot.angle}deg`,
      }"
    ></div>
  </div>
</template>

<style scoped>
:global(.VPHero .image-container) {
  position: relative !important;
  z-index: 1;
}

:global(.VPHero .image) {
  z-index: 2;
  position: relative;
}

.premium-geometric-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: visible;
  mask-image: radial-gradient(circle at center, black, transparent 80%);
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: pulse-orb 10s infinite alternate ease-in-out;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: var(--vp-c-brand-1);
  top: 10%;
  right: -10%;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: #06b6d4;
  bottom: 10%;
  right: 10%;
  animation-delay: -5s;
}

.lines-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

.geo-line {
  stroke: var(--vp-c-brand-1);
  stroke-width: 0.1;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: draw-line 8s infinite linear;
}

.particle {
  position: absolute;
  background: var(--vp-c-brand-1);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--vp-c-brand-1);
  animation: float-particle infinite ease-in-out;
}

@keyframes float-particle {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.1;
  }
  50% {
    transform: translate(
        calc(cos(var(--angle)) * var(--dist)),
        calc(sin(var(--angle)) * var(--dist))
      )
      scale(1.5);
    opacity: 0.6;
  }
}

@keyframes pulse-orb {
  from {
    transform: scale(1) translate(0, 0);
  }
  to {
    transform: scale(1.2) translate(30px, -20px);
  }
}

@keyframes draw-line {
  0% {
    stroke-dashoffset: 200;
    opacity: 0;
  }
  20% {
    opacity: 0.5;
  }
  80% {
    opacity: 0.5;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0;
  }
}

.dark .premium-geometric-bg {
  opacity: 0.8;
}

.dark .orb {
  opacity: 0.25;
}
</style>
