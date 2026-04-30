<script setup>
import { onMounted, ref } from "vue";
import LogoDots from "./LogoDots.vue";

const suggestions = [
  {
    text: "Getting Started",
    link: "/guide/getting-started",
    icon: "fa-rocket",
  },
  { text: "Core Engine", link: "/guide/core-engine", icon: "fa-gears" },
  { text: "Frameworks", link: "/frameworks/react/", icon: "fa-cubes" },
  { text: "Examples", link: "/examples/forms", icon: "fa-wand-magic-sparkles" },
];
</script>

<template>
  <div class="not-found-premium">
    <LogoDots />

    <div class="content-wrapper">
      <div class="error-code-container">
        <h1 class="error-code">404</h1>
        <div class="error-code-overlay">404</div>
        <div class="error-code-glow">404</div>
      </div>

      <div class="text-content">
        <h2 class="title">State Lost in Transit</h2>
        <p class="description">
          The flow you're looking for has entered an unrecoverable state. The
          request was cancelled or the route has been decommissioned.
        </p>
      </div>

      <div class="actions">
        <a href="/" class="primary-btn">
          <i class="fa-solid fa-house"></i>
          Return Home
        </a>
      </div>

      <div class="suggestions">
        <p class="suggestions-label">Try these active flows instead:</p>
        <div class="suggestions-grid">
          <a
            v-for="item in suggestions"
            :key="item.text"
            :href="item.link"
            class="suggestion-card"
          >
            <i :class="['fa-solid', item.icon]"></i>
            <span>{{ item.text }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-premium {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.content-wrapper {
  max-width: 800px;
  width: 100%;
  text-align: center;
  z-index: 10;
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-code-container {
  position: relative;
  margin-bottom: 40px;
  user-select: none;
  height: clamp(180px, 35vh, 280px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-code {
  font-size: clamp(8rem, 25vw, 18rem);
  font-weight: 900;
  line-height: 1;
  margin: 0;
  color: var(--vp-c-text-1);
  letter-spacing: -0.05em;
  opacity: 0.05;
}

.error-code-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(8rem, 25vw, 18rem);
  font-weight: 900;
  color: transparent;
  -webkit-text-stroke: 2px var(--vp-c-brand-1);
  animation: glitch 4s infinite linear;
  letter-spacing: -0.05em;
}

.error-code-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(8rem, 25vw, 18rem);
  font-weight: 900;
  color: var(--vp-c-brand-1);
  filter: blur(30px);
  opacity: 0.2;
  animation: pulse-glow 2s infinite alternate ease-in-out;
  letter-spacing: -0.05em;
}

@keyframes glitch {
  0% {
    transform: translate(0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  2% {
    transform: translate(-5px, 2px);
    clip-path: polygon(0 15%, 100% 15%, 100% 30%, 0 30%);
  }
  4% {
    transform: translate(5px, -2px);
    clip-path: polygon(0 60%, 100% 60%, 100% 75%, 0 75%);
  }
  6% {
    transform: translate(0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  100% {
    transform: translate(0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
}

@keyframes pulse-glow {
  from {
    opacity: 0.15;
    transform: scale(1);
  }
  to {
    opacity: 0.4;
    transform: scale(1.02);
  }
}

.text-content {
  margin-bottom: 48px;
}

.title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.1;
  margin-bottom: 20px;
  color: var(--vp-c-text-1);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.description {
  font-size: 1.25rem;
  color: var(--vp-c-text-1);
  opacity: 0.7;
  max-width: 580px;
  margin: 0 auto;
  line-height: 1.6;
  font-weight: 500;
}

.actions {
  margin-bottom: 80px;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 48px;
  background: var(--vp-c-brand-1);
  color: white;
  font-weight: 900;
  font-size: 1.1rem;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.4);
}

.primary-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 60px -12px rgba(99, 102, 241, 0.5);
  filter: brightness(1.1);
}

.suggestions {
  padding-top: 64px;
  border-top: 1px solid var(--vp-c-divider);
}

.suggestions-label {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: var(--vp-c-brand-1);
  margin-bottom: 32px;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.suggestion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 24px;
  color: var(--vp-c-text-2);
  text-decoration: none !important;
  font-weight: 700;
  transition: all 0.3s ease;
}

.suggestion-card i {
  font-size: 1.75rem;
  color: var(--vp-c-brand-1);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.suggestion-card:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
  background: var(--vp-c-brand-soft);
  transform: translateY(-6px);
}

.suggestion-card:hover i {
  transform: scale(1.25) rotate(5deg);
}

@media (max-width: 640px) {
  .suggestions-grid {
    grid-template-columns: 1fr 1fr;
  }
  .suggestion-card {
    padding: 24px 16px;
    font-size: 0.9rem;
  }
}
</style>
