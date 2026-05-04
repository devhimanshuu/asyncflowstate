import { defineConfig, type HeadConfig } from "vitepress";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  lang: "en-US",
  sitemap: {
    hostname: "https://asyncflowstate-js.pages.dev",
  },
  vite: {
    plugins: [tailwindcss()],
  },
  title: "AsyncFlowState",
  titleTemplate: ":title | AsyncFlowState",
  description:
    "The industry-standard engine for predictable async UI behavior. Eliminate boilerplate in React, Vue, Svelte, Angular, Solid, Next.js, Nuxt, Remix & Astro.",

  head: [
    ["link", { rel: "icon", href: "/logo.png", type: "image/png" }],
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    ["link", { rel: "dns-prefetch", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "dns-prefetch", href: "https://fonts.gstatic.com" }],
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
          "async, state management, react, vue, svelte, angular, solidjs, nextjs, nuxt, remix, astro, typescript, loading state, error handling, ai debugging, predictive intent",
      },
    ],
    ["meta", { property: "og:title", content: "AsyncFlowState" }],
    [
      "meta",
      {
        property: "og:description",
        content: "The AI-powered engine for predictable async UI behavior.",
      },
    ],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:url", content: "https://asyncflowstate-js.pages.dev/" }],
    ["meta", { property: "og:image", content: "https://asyncflowstate-js.pages.dev/logo.png" }],
    ["meta", { property: "og:image:alt", content: "AsyncFlowState - The Predictable Async UI Engine" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:site", content: "@asyncflowstate" }],
    ["meta", { name: "twitter:image", content: "https://asyncflowstate-js.pages.dev/logo.png" }],
    ["meta", { name: "theme-color", content: "#6366f1" }],
    ["link", { rel: "apple-touch-icon", href: "/logo.png" }],
    ["meta", { name: "google-site-verification", content: "ADD_YOUR_VERIFICATION_TOKEN_HERE" }],
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "AsyncFlowState",
        "operatingSystem": "Web, Node.js",
        "applicationCategory": "DeveloperApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "The industry-standard engine for predictable async UI behavior. Eliminate boilerplate in React, Vue, Svelte, Angular, Solid, Next.js, Nuxt, Remix & Astro.",
        "author": {
          "@type": "Organization",
          "name": "AsyncFlowState"
        }
      })
    ]
  ],

  transformHead: ({ pageData }) => {
    const head: HeadConfig[] = [];
    const url = `https://asyncflowstate-js.pages.dev/${pageData.relativePath.replace(/index\.md$/, "").replace(/\.md$/, "")}`;
    head.push(["link", { rel: "canonical", href: url }]);
    return head;
  },

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
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" alt="React" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> React',
            link: "/frameworks/react/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" alt="Next.js" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" class="dark:invert" /> Next.js',
            link: "/frameworks/next/nextjs",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg" alt="Vue" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Vue',
            link: "/frameworks/vue/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/svelte/svelte-original.svg" alt="Svelte" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Svelte',
            link: "/frameworks/svelte/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg" alt="Angular" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Angular',
            link: "/frameworks/angular/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/solidjs/solidjs-original.svg" alt="SolidJS" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> SolidJS',
            link: "/frameworks/solidjs/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nuxtjs/nuxtjs-original.svg" alt="Nuxt" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Nuxt <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/nuxt/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" alt="Remix" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle; filter: grayscale(1) invert(0.5) sepia(1) hue-rotate(180deg) saturate(3);" /> Remix <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/remix/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/astro/astro-original.svg" alt="Astro" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Astro <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/astro/",
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
            text: "Vue Composables",
            link: "/api/vue",
          },
          {
            text: "Svelte Stores",
            link: "/api/svelte",
          },
          {
            text: "Angular Services",
            link: "/api/angular",
          },
          {
            text: "SolidJS API",
            link: "/api/solidjs",
          },
          {
            text: 'Nuxt API <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/nuxt",
          },
          {
            text: 'Remix API <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/remix",
          },
          {
            text: 'Astro API <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/astro",
          },
          { text: "Global Config", link: "/api/configuration" },
        ],
      },
      {
        text: "Releases",
        items: [
          {
            text: 'Latest: v3.0.0 <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/release-notes#v3-0-0-stable",
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
          {
            text: "Meet the Creator",
            link: "/creator",
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
          { text: "Meet the Creator", link: "/creator" },
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
          {
            text: 'Mastering Flow DNA <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/tutorials/flow-dna",
          },
          {
            text: 'Building Collaborative Apps <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/tutorials/collaborative-apps",
          },
          {
            text: 'Edge-First Data Fetching <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/tutorials/edge-first",
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
            text: "Dead Letter Queue",
            link: "/guide/dead-letter-queue",
          },
          {
            text: "Optimistic UI & Rollbacks",
            link: "/guide/optimistic-ui",
          },
          {
            text: "Global Undo (Purgatory)",
            link: "/guide/purgatory",
          },
          {
            text: "Concurrency & Quantum",
            link: "/guide/concurrency",
          },
          {
            text: "Flow Composition",
            link: "/guide/composition",
          },
          {
            text: "Worker Offloading",
            link: "/guide/worker-offloading",
          },
          {
            text: "Predictive Prefetching",
            link: "/guide/predictive",
          },
          {
            text: "Ghost Workflows",
            link: "/guide/ghost-workflows",
          },
          {
            text: "Streaming & AI Skeletons",
            link: "/guide/streaming",
          },
          {
            text: "Cross-Tab Sync",
            link: "/guide/cross-tab-sync",
          },
          { text: "Smart Persistence", link: "/guide/persistence" },
          { text: "Middleware & Interceptors", link: "/guide/middleware" },
          {
            text: "Testing & Jitter",
            link: "/guide/testing",
          },
          {
            text: "Visual Debugger & Time-Travel",
            link: "/guide/visual-debugger",
          },
          { text: "Performance", link: "/guide/performance" },
        ],
      },
      {
        text: '<i class="fa-solid fa-wand-sparkles" style="margin-right: 4px; font-size: 0.9em; opacity: 0.7;"></i> AI & Next-Gen',
        collapsed: false,
        items: [
          {
            text: 'Flow DNA <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/flow-dna",
          },
          {
            text: 'Ambient Intelligence <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/ambient",
          },
          {
            text: 'Flow Choreography <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/choreography",
          },
          {
            text: 'Speculative Execution <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/speculative",
          },
          {
            text: 'Emotional UX <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/sentiment",
          },
          {
            text: 'Flow Mesh <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/mesh",
          },
          {
            text: 'Collaborative Flows <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/collaborative",
          },
          {
            text: 'Temporal Replay <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/temporal",
          },
          {
            text: 'Edge-First Flows <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/edge",
          },
          {
            text: 'Telemetry Dashboard <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/guide/telemetry",
          },
        ],
      },
      {
        text: '<i class="fa-solid fa-cubes" style="margin-right: 4px; font-size: 0.9em; opacity: 0.7;"></i> Frameworks',
        collapsed: false,
        items: [
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" alt="React" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> React',
            link: "/frameworks/react/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" alt="Next.js" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" class="dark:invert" /> Next.js',
            link: "/frameworks/next/nextjs",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg" alt="Vue" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Vue',
            link: "/frameworks/vue/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/svelte/svelte-original.svg" alt="Svelte" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Svelte',
            link: "/frameworks/svelte/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg" alt="Angular" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Angular',
            link: "/frameworks/angular/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/solidjs/solidjs-original.svg" alt="SolidJS" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> SolidJS',
            link: "/frameworks/solidjs/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nuxtjs/nuxtjs-original.svg" alt="Nuxt" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Nuxt <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/nuxt/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" alt="Remix" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle; filter: grayscale(1) invert(0.5) sepia(1) hue-rotate(180deg) saturate(3);" /> Remix <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/remix/",
          },
          {
            text: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/astro/astro-original.svg" alt="Astro" style="width: 14px; height: 14px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Astro <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/frameworks/astro/",
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
          {
            text: 'Nuxt API <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/nuxt",
          },
          {
            text: 'Remix API <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/remix",
          },
          {
            text: 'Astro API <span class="text-[10px] uppercase font-bold text-emerald-500 ml-1">New</span>',
            link: "/api/astro",
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
