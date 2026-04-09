<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vitepress";

const route = useRoute();
const isHome = ref(false);

onMounted(() => {
  isHome.value = route.path === "/";
});

watch(
  () => route.path,
  (path) => {
    isHome.value = path === "/";
  },
);
</script>

<template>
  <Transition name="slide-up">
    <div v-if="isHome" class="release-banner-container">
      <div class="release-banner-inner">
        <!-- Glow effects -->
        <div class="glow-orb glow-1"></div>
        <div class="glow-orb glow-2"></div>

        <div class="content">
          <div class="badge-wrapper">
            <span class="pulse-ring"></span>
            <span class="badge">v2.0 STABLE</span>
          </div>
          
          <div class="text-group">
            <span class="main-text">The Production-Ready Release is Here</span>
            <span class="divider"></span>
            <span class="sub-text">TypeScript-first · Zero dependencies · 6 Adapters</span>
          </div>

          <a href="/release-notes" class="cta-link">
            <span>Explore Notes</span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.release-banner-container {
  position: sticky;
  top: var(--vp-nav-height);
  z-index: 10;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 6px 0 4px 0;
  pointer-events: none;
  perspective: 1000px;
  background: linear-gradient(to bottom, var(--vp-c-bg) 0%, transparent 100%);
}

.release-banner-inner {
  pointer-events: auto;
  position: relative;
  background: rgba(var(--vp-c-bg-soft-rgb), 0.6);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 8px 12px 8px 8px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 
    0 10px 30px -10px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(99, 102, 241, 0.05);
  overflow: hidden;
  max-width: fit-content;
  animation: banner-float 6s ease-in-out infinite;
}

.content {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 2;
}

.badge-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  font-size: 10px;
  font-weight: 900;
  padding: 6px 14px;
  border-radius: 100px;
  letter-spacing: 0.1em;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 100px;
  border: 2px solid #6366f1;
  animation: ring-pulse 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
}

.text-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-text {
  font-size: 13px;
  font-weight: 800;
  color: var(--vp-c-text-1);
  letter-spacing: -0.01em;
}

.divider {
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.1);
}

.sub-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  opacity: 0.8;
}

.cta-link {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  text-decoration: none !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.cta-link:hover {
  background: var(--vp-c-brand-soft);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateX(4px);
}

.glow-orb {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  filter: blur(25px);
  opacity: 0.15;
  z-index: 1;
}

.glow-1 {
  background: #6366f1;
  top: -20px;
  left: 20%;
  animation: glow-move 8s infinite alternate;
}

.glow-2 {
  background: #06b6d4;
  bottom: -20px;
  right: 20%;
  animation: glow-move 10s infinite alternate-reverse;
}

@keyframes ring-pulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.3, 1.4); opacity: 0; }
}

@keyframes banner-float {
  0%, 100% { transform: translateY(0) rotateX(0deg); }
  50% { transform: translateY(-4px) rotateX(2deg); }
}

@keyframes glow-move {
  from { transform: translate(0, 0); }
  to { transform: translate(40px, 10px); }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

@media (max-width: 960px) {
  .main-text { font-size: 12px; }
  .sub-text { font-size: 11px; }
  .content { gap: 12px; }
}

@media (max-width: 768px) {
  .sub-text, .divider { display: none; }
  .release-banner-inner { border-radius: 100px; padding: 6px 12px 6px 6px; }
  .main-text { font-size: 11px; }
}

@media (max-width: 480px) {
  .release-banner-container { padding: 4px 0; }
  .cta-link span { display: none; }
  .cta-link { padding: 6px 10px; }
  .badge { padding: 4px 10px; font-size: 9px; }
}
</style>
