# <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nuxtjs/nuxtjs-original.svg" style="width: 38px; height: 38px; display: inline-block; margin-right: 12px; vertical-align: middle;" alt="Nuxt Logo" /> Nuxt Integration

The `@asyncflowstate/nuxt` package provides specialized support for Nuxt 3, including auto-imports, module integration, and server-side-safe hooks.

## Installation

```bash
npm install @asyncflowstate/nuxt @asyncflowstate/vue @asyncflowstate/core
```

## Nuxt Module Configuration

To benefit from auto-imports in your Nuxt project, add the module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ["@asyncflowstate/nuxt"],
});
```

## useNuxtFlow

The `useNuxtFlow` composable is optimized for Nuxt's server/client lifecycle. It is a thin wrapper around the Vue integration that ensures compatibility with Nuxt-specific patterns like `useAsyncData` refresh and error handling.

### Example

```vue
<script setup lang="ts">
// No import needed if using the Nuxt module auto-imports!
const { loading, data, execute, button } = useNuxtFlow(async (id: string) => {
  return $fetch(`/api/users/${id}`);
});
</script>

<template>
  <button v-bind="button()">
    {{ loading ? "Loading..." : "Fetch User" }}
  </button>

  <div v-if="data">{{ data.name }}</div>
</template>
```

## Nuxt-Specific Features

### Auto-Revalidation

In Nuxt applications, `useNuxtFlow` can be configured to automatically re-execute based on Nuxt's internal route navigation or state changes.

```ts
const flow = useNuxtFlow(fetchData, {
  revalidateOnFocus: true, // Re-fetch when user returns to tab
  revalidateOnReconnect: true, // Re-fetch when internet comes back
});
```

### Server-Side Safety

`useNuxtFlow` is designed to be hydration-safe. It won't trigger async effects on the server unless explicitly requested, preventing hydration mismatches between the server-rendered HTML and client-side reactive state.

## Best Practices

Building a professional async experience in Nuxt requires leveraging its unique architecture. Follow these patterns for the best results.

### <i class="fa-solid fa-server text-brand-1 mr-2"></i> Edge & Server Features

::: tip Edge-First Flows
If deploying to Vercel or Cloudflare, combine `useNuxtFlow` with the new **Edge-First Flows** (`edge: true`) to leverage edge caching automatically without blocking the client thread.
:::

### <i class="fa-solid fa-layer-group text-cyan-500 mr-2"></i> Composition & Configuration

::: info Auto-Imports
You don't need to manually import `useNuxtFlow`. If you've added `@asyncflowstate/nuxt` to your `modules` array in `nuxt.config.ts`, Nuxt handles the imports for you globally.
:::

::: tip Global Context
Wrap your app in a global layout plugin using `useFlowConfig` to set app-wide telemetry or Flow DNA settings, ensuring every Nuxt page inherits identical async behavior.
:::
