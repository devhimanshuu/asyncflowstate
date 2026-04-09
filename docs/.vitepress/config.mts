import { defineConfig } from "vitepress";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  title: "AsyncFlowState",
  description:
    "The industry-standard engine for predictable async UI behavior. Eliminate boilerplate in React, Vue, Svelte, Angular, Solid & Next.js.",

  head: [
    ["link", { rel: "icon", href: "/logo.png", type: "image/png" }],
    [
      "link",
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
    ],
    [
      "link",
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "",
      },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
      },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css",
      },
    ],
    [
      "meta",
      {
        name: "keywords",
        content:
          "async, state management, react, vue, svelte, angular, solidjs, nextjs, typescript, loading state, error handling",
      },
    ],
    ["meta", { property: "og:title", content: "AsyncFlowState" }],
    [
      "meta",
      {
        property: "og:description",
        content:
          "The industry-standard engine for predictable async UI behavior.",
      },
    ],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ],

  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    logo: "/logo.png",
    siteTitle: "AsyncFlowState",

    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      {
        text: "Frameworks",
        items: [
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> React',
            link: "/frameworks/react/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" class="dark:invert" /> Next.js',
            link: "/frameworks/next/nextjs",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Vue <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/vue/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/svelte/svelte-original.svg" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Svelte <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/svelte/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Angular <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/angular/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/solidjs/solidjs-original.svg" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> SolidJS <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/solidjs/",
          },
        ],
      },
      {
        text: "API",
        items: [
          { text: "Core Engine", link: "/api/core" },
          { text: "React Hooks", link: "/api/react" },
          { text: "Next.js Hooks", link: "/api/nextjs" },
          {
            text: 'Vue Composables <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/vue",
          },
          {
            text: 'Svelte Stores <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/svelte",
          },
          {
            text: 'Angular Services <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/angular",
          },
          {
            text: 'SolidJS Primitives <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/solidjs",
          },
          { text: "Global Config", link: "/api/configuration" },
        ],
      },
      {
        text: "Releases",
        items: [
          {
            text: 'Latest: v2.0.2 <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/release-notes#v2-0-2-stable-release",
          },
          {
            text: "Previous",
            link: "/release-notes#previous-version-details",
          },
          {
            text: "Changelog",
            link: "https://github.com/devhimanshuu/asyncflowstate/blob/main/CHANGELOG.md",
          },
          {
            text: "Contributing",
            link: "https://github.com/devhimanshuu/asyncflowstate/blob/main/CONTRIBUTING.md",
          },
        ],
      },
    ],

    sidebar: [
      {
        text: '<i class="fa-solid fa-rocket" style="margin-right: 4px; font-size: 0.9em; opacity: 0.7;"></i> Introduction',
        collapsed: false,
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          {
            text: "What is AsyncFlowState?",
            link: "/guide/what-is-asyncflowstate",
          },
          { text: "Why AsyncFlowState?", link: "/guide/why" },
          { text: "FAQ", link: "/guide/faq" },
        ],
      },
      {
        text: '<i class="fa-solid fa-graduation-cap" style="margin-right: 4px; font-size: 0.9em; opacity: 0.7;"></i> Tutorials',
        collapsed: false,
        items: [
          {
            text: "Building a Resilient Form",
            link: "/guide/tutorials/resilient-form",
          },
          {
            text: "Optimistic UI Patterns",
            link: "/guide/tutorials/optimistic-patterns",
          },
          {
            text: "Chaining Complex Flows",
            link: "/guide/tutorials/chaining-flows",
          },
          {
            text: "The Purgatory Pattern",
            link: "/guide/tutorials/purgatory-pattern",
          },
        ],
      },
      {
        text: '<i class="fa-solid fa-gears" style="margin-right: 4px; font-size: 0.9em; opacity: 0.7;"></i> Fundamentals',
        collapsed: false,
        items: [
          { text: "Core Engine", link: "/guide/core-engine" },
          { text: "State Management", link: "/guide/state-management" },
          { text: "Configuration", link: "/guide/configuration" },
        ],
      },
      {
        text: '<i class="fa-solid fa-bolt-lightning" style="margin-right: 4px; font-size: 0.9em; opacity: 0.7;"></i> Advanced Features',
        collapsed: false,
        items: [
          {
            text: "Retry & Error Handling",
            link: "/guide/retry-error-handling",
          },
          {
            text: 'Dead Letter Queue <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/dead-letter-queue",
          },
          {
            text: 'Optimistic UI & Rollbacks <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/optimistic-ui",
          },
          {
            text: 'Global Undo (Purgatory) <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/purgatory",
          },
          {
            text: 'Concurrency & Quantum <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/concurrency",
          },
          {
            text: 'Flow Composition <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/composition",
          },
          {
            text: 'Worker Offloading <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/worker-offloading",
          },
          {
            text: 'Predictive Prefetching <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/predictive",
          },
          {
            text: 'Ghost Workflows <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/ghost-workflows",
          },
          {
            text: 'Streaming & AI Skeletons <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/streaming",
          },
          {
            text: 'Cross-Tab Sync <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/cross-tab-sync",
          },
          { text: "Smart Persistence", link: "/guide/persistence" },
          { text: "Middleware & Interceptors", link: "/guide/middleware" },
          {
            text: 'Testing & Jitter <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/testing",
          },
          {
            text: 'Visual Debugger & Time-Travel <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/visual-debugger",
          },
          { text: "Performance", link: "/guide/performance" },
        ],
      },
      {
        text: '<i class="fa-solid fa-cubes" style="margin-right: 4px; font-size: 0.9em; opacity: 0.7;"></i> Frameworks',
        collapsed: false,
        items: [
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> React',
            link: "/frameworks/react/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" class="dark:invert" /> Next.js',
            link: "/frameworks/next/nextjs",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Vue <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/vue/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/svelte/svelte-original.svg" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Svelte <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/svelte/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Angular <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/angular/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/solidjs/solidjs-original.svg" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> SolidJS <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/solidjs/",
          },
        ],
      },
      {
        text: '<i class="fa-solid fa-wand-magic-sparkles" style="margin-right: 4px; font-size: 0.9em; opacity: 0.7;"></i> Interactive Examples',
        collapsed: false,
        items: [
          { text: "Form Handling", link: "/examples/forms" },
          { text: "Real-World Patterns", link: "/examples/real-world" },
          {
            text: 'Advanced Patterns <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/examples/advanced-patterns",
          },
        ],
      },
      {
        text: '<i class="fa-solid fa-book-open-reader" style="margin-right: 4px; font-size: 0.9em; opacity: 0.7;"></i> API Reference',
        collapsed: true,
        items: [
          { text: "Core API", link: "/api/core" },
          { text: "React API", link: "/api/react" },
          { text: "Next.js API", link: "/api/nextjs" },
          {
            text: 'Vue API <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/vue",
          },
          {
            text: 'Svelte API <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/svelte",
          },
          {
            text: 'Angular API <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/angular",
          },
          {
            text: 'SolidJS API <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/solidjs",
          },
          { text: "Configuration", link: "/api/configuration" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/devhimanshuu/asyncflowstate",
      },
      {
        icon: "npm",
        link: "https://www.npmjs.com/package/@asyncflowstate/core",
      },
    ],

    search: {
      provider: "local",
      options: {
        detailedView: true,
      },
    },

    editLink: {
      pattern:
        "https://github.com/devhimanshuu/asyncflowstate/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    footer: {
      message:
        '<div class="flex items-center justify-center gap-2 mb-2 font-medium">Built with <i class="fa-solid fa-bolt-lightning text-amber-500 text-xs"></i> by <span class="text-(--vp-c-brand-1) font-black tracking-tight">AsyncFlowState</span> Contributors</div><div class="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40">Open Source · MIT License</div>',
      copyright: "Copyright © 2026 AsyncFlowState",
    },

    outline: {
      level: [2, 3],
    },
  },
});
