<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/nuxt <span style="font-size: 14px; background: #00dc8222; color: #00dc82; padding: 4px 10px; border-radius: 20px; vertical-align: middle; margin-left: 10px;">v3.0.0 Stable</span></h1>
  <p><b>Nuxt 3 optimized behavior orchestration for AsyncFlowState.</b></p>

  <p>
    <a href="https://asyncflowstate-js.pages.dev/frameworks/nuxt"><img src="https://img.shields.io/badge/Documentation-Link-blue.svg" alt="Documentation" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License: MIT" /></a>
    <a href="https://www.npmjs.com/package/@asyncflowstate/nuxt"><img src="https://img.shields.io/npm/v/@asyncflowstate/nuxt?color=indigo" alt="NPM Version" /></a>
  </p>
</div>

---

## Installation

```bash
pnpm add @asyncflowstate/nuxt @asyncflowstate/vue @asyncflowstate/core
```

## Quick Start

### Basic Nuxt Flow

```vue
<script setup>
const { data, loading, execute, button } = useNuxtFlow(async (id) => {
  return await $fetch(`/api/users/${id}`);
});
</script>

<template>
  <button v-bind="button({ onClick: () => execute(123) })">
    {{ loading ? "Loading..." : "Fetch User" }}
  </button>
</template>
```

## Comprehensive Examples

### 1. Optimistic UI with Deep-Diff Rollback

Update your Nuxt state instantly and trust AsyncFlowState to revert if the `$fetch` fails.

```vue
<script setup>
const { data, execute } = useNuxtFlow(api.likePost, {
  optimisticResult: (prev) => ({
    ...prev,
    likes: prev.likes + 1,
    isLiked: true,
  }),
  rollbackOnError: true,
});
</script>
```

### 2. AI-Powered: Predictive Intent & Flow DNA

Pre-warm your Nuxt composables before the user even clicks.

```vue
<script setup>
const { status, prewarm, execute } = useNuxtFlow(api.getDetails, {
  predictive: { prefetchOnHover: true },
});
</script>

<template>
  <div @mouseenter="prewarm" class="card">
    <button @click="execute">
      {{ status === "prewarmed" ? "Instant View" : "Load Details" }}
    </button>
  </div>
</template>
```

### 3. Server-Side Rendering (SSR) Support

Seamless integration with Nuxt's `useAsyncData` and `useFetch`.

```vue
<script setup>
const { data: initialData } = await useAsyncData("user", () =>
  $fetch("/api/user"),
);

const flow = useNuxtFlow(api.updateUser, {
  initialData: initialData.value,
});
</script>
```

### 4. Cross-Tab Sync: Real-Time Coordination

Keep all open Nuxt tabs in sync with the same async state.

```vue
<script setup>
const flow = useNuxtFlow(api.updateSettings, {
  crossTab: { sync: true, channel: "nuxt-settings-mesh" },
});
</script>
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** Self-healing composables for Nuxt 3.
- **Speculative Execution:** Predicted user intent for zero-latency interactions.
- **Ambient Intelligence:** Background monitoring for Nuxt hydration and navigation.
- **Collaborative Mesh:** Real-time state synchronization across Nuxt instances.
- **Edge-First Logic:** Optimized for Nuxt Nitro on the Edge.
- **Telemetry Dashboard:** Live monitoring of Nuxt async health.

## License

MIT © [AsyncFlowState Contributors](https://github.com/devhimanshuu/asyncflowstate)
