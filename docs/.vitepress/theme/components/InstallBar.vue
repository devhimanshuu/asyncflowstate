<script setup>
import { ref } from "vue";

const frameworks = [
  {
    name: "React",
    id: "react",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
    command: "npm install @asyncflowstate/react @asyncflowstate/core",
  },
  {
    name: "Next.js",
    id: "nextjs",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
    command:
      "npm install @asyncflowstate/next @asyncflowstate/react @asyncflowstate/core",
    darkInvert: true,
  },
  {
    name: "Vue",
    id: "vue",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg",
    command: "npm install @asyncflowstate/vue @asyncflowstate/core",
  },
  {
    name: "Svelte",
    id: "svelte",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/svelte/svelte-original.svg",
    command: "npm install @asyncflowstate/svelte @asyncflowstate/core",
  },
  {
    name: "Angular",
    id: "angular",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg",
    command: "npm install @asyncflowstate/angular @asyncflowstate/core",
  },
  {
    name: "Solid",
    id: "solid",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/solidjs/solidjs-original.svg",
    command: "npm install @asyncflowstate/solid @asyncflowstate/core",
  },
  {
    name: "Nuxt",
    id: "nuxt",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nuxtjs/nuxtjs-original.svg",
    command:
      "npm install @asyncflowstate/nuxt @asyncflowstate/vue @asyncflowstate/core",
  },
  {
    name: "Remix",
    id: "remix",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
    command:
      "npm install @asyncflowstate/remix @asyncflowstate/react @asyncflowstate/core",
    remixTint: true,
  },
  {
    name: "Astro",
    id: "astro",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/astro/astro-original.svg",
    command: "npm install @asyncflowstate/astro @asyncflowstate/core",
    darkInvert: true,
  },
];

const activeFramework = ref(frameworks[0]);
const copied = ref(false);

const copyCommand = () => {
  navigator.clipboard.writeText(activeFramework.value.command);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>

<template>
  <div class="afs-framework-install-wrapper">
    <!-- Framework Selectors -->
    <div class="framework-selectors">
      <button
        v-for="fw in frameworks"
        :key="fw.id"
        class="fw-btn"
        :class="{ active: activeFramework.id === fw.id }"
        @click="activeFramework = fw"
        :title="fw.name"
      >
        <img
          :src="fw.icon"
          :alt="fw.name"
          :class="{ 'dark-invert': fw.darkInvert, 'remix-tint': fw.remixTint }"
        />
      </button>
    </div>

    <!-- Command Bar -->
    <div class="afs-install-bar" @click="copyCommand">
      <div
        class="flex items-center gap-2 text-[11px] opacity-40 font-bold select-none uppercase tracking-widest"
      >
        <i class="fa-solid fa-terminal text-[10px]"></i>
        {{ activeFramework.name }} Install
      </div>
      <div class="flex items-center justify-between gap-3 w-full">
        <code class="afs-install-code">{{ activeFramework.command }}</code>
        <button class="copy-btn" :class="{ copied }">
          <i v-if="!copied" class="fa-regular fa-copy"></i>
          <i v-else class="fa-solid fa-check"></i>
        </button>
      </div>

      <!-- Tooltip / Indicator -->
      <Transition name="fade">
        <div v-if="copied" class="copy-toast">Copied to clipboard!</div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.afs-framework-install-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.framework-selectors {
  display: flex;
  justify-content: center;
  gap: 8px;
  background: var(--vp-c-bg-soft);
  padding: 6px;
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
}

.fw-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.5;
  filter: grayscale(1);
}

.fw-btn:hover {
  opacity: 0.8;
  filter: grayscale(0.5);
  background: var(--vp-c-bg-mute);
}

.fw-btn.active {
  opacity: 1;
  filter: grayscale(0);
  background: var(--vp-c-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border: 1px solid var(--vp-c-divider);
}

.fw-btn img {
  width: 20px;
  height: 20px;
}

.dark-invert {
  filter: invert(1);
}

.remix-tint {
  filter: grayscale(1) invert(0.5) sepia(1) hue-rotate(180deg) saturate(3);
}

.afs-install-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 20px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  width: 100%;
  max-width: 660px;
  margin: 0 auto;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.afs-install-bar:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-mute);
}

.afs-install-code {
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  letter-spacing: -0.02em;
  background: none;
  white-space: nowrap;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-btn {
  opacity: 0.4;
  transition: all 0.2s ease;
  font-size: 14px;
}

.afs-install-bar:hover .copy-btn {
  opacity: 1;
  color: var(--vp-c-brand-1);
}

.copy-btn.copied {
  color: #10b981;
  opacity: 1;
}

.copy-toast {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  background: var(--vp-c-brand-1);
  color: white;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: bold;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(10px);
}

@media (max-width: 640px) {
  .framework-selectors {
    flex-wrap: wrap;
    justify-content: center;
    padding: 4px;
    border-radius: 12px;
  }
  .fw-btn {
    width: 32px;
    height: 32px;
  }
  .afs-install-bar {
    padding: 10px 16px;
    border-radius: 16px;
  }
  .afs-install-code {
    font-size: 11px;
  }
  .copy-toast {
    font-size: 10px;
    padding: 2px 8px;
    right: 10px;
  }
}
</style>
