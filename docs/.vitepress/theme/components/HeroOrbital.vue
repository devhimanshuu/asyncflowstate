<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vitepress";

const route = useRoute();
const isHome = ref(false);
const imageEl = ref(null);
const orbitalStyle = ref({});
let raf = null;

const updatePosition = () => {
  const img = document.querySelector(".VPHero .VPImage.image-src");
  if (img) {
    const rect = img.getBoundingClientRect();
    orbitalStyle.value = {
      position: "fixed",
      top: `${rect.top + rect.height / 2}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: "translate(-50%, -50%)",
      width: "450px",
      height: "450px",
      zIndex: "100",
      pointerEvents: "none",
    };
  }
  raf = requestAnimationFrame(updatePosition);
};

onMounted(() => {
  isHome.value = route.path === "/";
  if (isHome.value) {
    // Wait for hero to render
    setTimeout(() => {
      updatePosition();
    }, 100);
  }
});

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf);
});

// Watch route changes
import { watch } from "vue";
watch(
  () => route.path,
  (path) => {
    isHome.value = path === "/";
    if (!isHome.value && raf) {
      cancelAnimationFrame(raf);
      raf = null;
    } else if (isHome.value) {
      setTimeout(() => updatePosition(), 100);
    }
  },
);
</script>

<template>
  <div v-if="isHome" class="orbital-overlay" :style="orbitalStyle">
    <!-- Rings -->
    <div class="orbital-ring"></div>
    <div class="orbital-ring orbital-ring-2"></div>

    <!-- Primary glowing dot -->
    <div class="orbital-dot orbital-dot-1">
      <div class="dot-core"></div>
      <div class="dot-glow"></div>
      <div class="dot-trail"></div>
    </div>

    <!-- Secondary dot -->
    <div class="orbital-dot orbital-dot-2">
      <div class="dot-core dot-core-accent"></div>
      <div class="dot-glow dot-glow-accent"></div>
      <div class="dot-trail dot-trail-accent"></div>
    </div>

    <!-- Third small dot -->
    <div class="orbital-dot orbital-dot-3">
      <div class="dot-core dot-core-small"></div>
      <div class="dot-glow dot-glow-small"></div>
    </div>
  </div>
</template>

<style>
.orbital-overlay {
  pointer-events: none !important;
}

.orbital-ring {
  position: absolute;
  inset: 15px;
  border-radius: 50%;
  border: 1.5px solid rgba(99, 102, 241, 0.12);
  animation: orb-ringPulse 6s ease-in-out infinite;
}

.orbital-ring-2 {
  inset: 45px;
  border-color: rgba(6, 182, 212, 0.1);
  animation-delay: -3s;
  animation-duration: 8s;
}

.orbital-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
}

.orbital-dot-1 {
  animation: orb-orbit 8s linear infinite;
}
.orbital-dot-2 {
  animation: orb-orbit-reverse 12s linear infinite;
}
.orbital-dot-3 {
  animation: orb-orbit-inner 6s linear infinite;
}

.dot-core {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #818cf8;
  border-radius: 50%;
  top: -235px;
  left: -5px;
  box-shadow: 0 0 14px 5px rgba(129, 140, 248, 0.6);
}

.dot-glow {
  position: absolute;
  width: 36px;
  height: 36px;
  background: radial-gradient(
    circle,
    rgba(129, 140, 248, 0.5),
    transparent 70%
  );
  border-radius: 50%;
  top: -248px;
  left: -18px;
  animation: orb-glowPulse 2s ease-in-out infinite;
}

.dot-trail {
  position: absolute;
  width: 70px;
  height: 6px;
  top: -233px;
  left: -65px;
  background: linear-gradient(90deg, transparent, rgba(129, 140, 248, 0.4));
  border-radius: 50%;
  filter: blur(3px);
}

.dot-core-accent {
  background: #22d3ee;
  top: -210px;
  box-shadow: 0 0 14px 5px rgba(34, 211, 238, 0.5);
  width: 8px;
  height: 8px;
}

.dot-glow-accent {
  background: radial-gradient(
    circle,
    rgba(34, 211, 238, 0.45),
    transparent 70%
  );
  top: -222px;
  width: 28px;
  height: 28px;
  left: -14px;
}

.dot-trail-accent {
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.35));
  top: -208px;
  width: 55px;
  left: -50px;
}

.dot-core-small {
  width: 5px;
  height: 5px;
  top: -185px;
  left: -2.5px;
  background: #a5b4fc;
  box-shadow: 0 0 10px 3px rgba(165, 180, 252, 0.5);
}

.dot-glow-small {
  width: 18px;
  height: 18px;
  top: -191px;
  left: -9px;
  background: radial-gradient(
    circle,
    rgba(165, 180, 252, 0.4),
    transparent 70%
  );
}

@keyframes orb-orbit {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes orb-orbit-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

@keyframes orb-orbit-inner {
  from {
    transform: rotate(45deg);
  }
  to {
    transform: rotate(405deg);
  }
}

@keyframes orb-glowPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.8);
    opacity: 0.4;
  }
}

@keyframes orb-ringPulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.15;
    transform: scale(1.03);
  }
}

@media (max-width: 960px) {
  .orbital-overlay {
    width: 380px !important;
    height: 380px !important;
  }
  .dot-core {
    top: -180px !important;
  }
  .dot-glow {
    top: -193px !important;
  }
  .dot-trail {
    top: -178px !important;
  }
  .dot-core-accent {
    top: -155px !important;
  }
  .dot-glow-accent {
    top: -167px !important;
  }
  .dot-trail-accent {
    top: -153px !important;
  }
  .dot-core-small {
    top: -135px !important;
  }
  .dot-glow-small {
    top: -141px !important;
  }
}

@media (max-width: 640px) {
  .orbital-overlay {
    display: none !important;
  }
}
</style>
