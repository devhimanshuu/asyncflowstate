# <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg" style="width: 38px; height: 38px; display: inline-block; margin-right: 12px; vertical-align: middle;" alt="Vue Logo" /> Vue Integration

The `@asyncflowstate/vue` package provides Vue 3 Composition API composables with reactive refs and provide/inject configuration.

## Installation

```bash
npm install @asyncflowstate/vue @asyncflowstate/core
```

## Core Composable (useFlow)

The `useFlow` composable is the main feature you'll interact with in Vue. It exposes all state as fully reactive Vue Refs.

### Example

```vue
<script setup lang="ts">
import { useFlow } from "@asyncflowstate/vue";

const { loading, data, error, execute, button } = useFlow(
  async (id: string) => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },
  {
    onSuccess: (user) => console.log("Fetched:", user.name),
    onError: (err) => console.error("Failed:", err),
  },
);
</script>

<template>
  <button v-bind="button()">
    {{ loading ? "Loading..." : "Fetch User" }}
  </button>

  <div v-if="error" class="error">
    {{ error.message }}
  </div>

  <div v-if="data" class="user-card">
    <h2>{{ data.name }}</h2>
    <p>{{ data.email }}</p>
  </div>
</template>
```

## Return Value

All return values are Vue `ref` objects for full reactivity:

| Property  | Type                      | Description             |
| --------- | ------------------------- | ----------------------- |
| `status`  | `Ref<string>`             | Current flow state      |
| `loading` | `Ref<boolean>`            | Loading indicator       |
| `data`    | `Ref<T \| null>`          | Last result             |
| `error`   | `Ref<Error \| null>`      | Last error              |
| `execute` | `(...args) => Promise<T>` | Trigger the action      |
| `reset`   | `() => void`              | Reset to idle           |
| `button`  | `() => object`            | Accessible button attrs |

## Button Attributes Helper

Easily generate all the accessible and stateful attributes needed for your interactive buttons using the `button()` helper feature.

### Example

```vue
<template>
  <button v-bind="button()">
    {{ loading ? "Saving..." : "Save" }}
  </button>
</template>
```

Generates: `{ onClick, disabled, 'aria-busy', 'aria-disabled' }`

## Form Handling

Bind schemas and handle complex form layouts effortlessly using `form()` for Vue templates.

### Example

```vue
<script setup>
import { useFlow } from "@asyncflowstate/vue";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

const { form, fieldErrors, loading, error } = useFlow(updateProfile);
</script>

<template>
  <form v-bind="form({ schema, extractFormData: true })">
    <input name="name" />
    <span v-if="fieldErrors.name">{{ fieldErrors.name }}</span>

    <input name="email" type="email" />
    <span v-if="fieldErrors.email">{{ fieldErrors.email }}</span>

    <button type="submit" :disabled="loading">
      {{ loading ? "Saving..." : "Save" }}
    </button>
  </form>
</template>
```

## Global Configuration

Provide app-wide defaults at the root level using Vue's Provide/Inject pattern.

### Example

Use provide/inject for app-wide defaults:

```ts
// main.ts or App.vue setup
import { provideFlowConfig } from "@asyncflowstate/vue";

provideFlowConfig({
  retry: { maxAttempts: 3, backoff: "exponential" },
  loading: { minDuration: 400 },
  onError: (err) => ElMessage.error(err.message),
});
```

## Advanced Workflows

## Sequential Workflows

Chain async operations so the output of one immediately feeds the next, using the `useFlowSequence` feature.

### Example

```vue
<script setup>
import { useFlowSequence } from "@asyncflowstate/vue";

const sequence = useFlowSequence([
  { name: "Validate", flow: validateFlow },
  { name: "Upload", flow: uploadFlow, mapInput: (prev) => prev.id },
]);
</script>
```

## State Observation

Because all returned values are standard Vue Refs, you can attach native watchers to react to flow lifecycle changes natively.

### Example

```vue
<script setup>
import { watch } from "vue";

const { status, data } = useFlow(fetchData);

watch(status, (newStatus) => {
  if (newStatus === "success") {
    router.push("/dashboard");
  }
});
</script>
```

## Best Practices

Building a professional async experience in Vue requires leveraging the Composition API effectively. Follow these patterns for the best results.

### <i class="fa-solid fa-code text-brand-1 mr-2"></i> Composition API Patterns

::: tip Destructuring correctly
Always destructure the return of `useFlow` if you need single properties. Because they are standard Vue `Refs`, they maintain reactivity.
```ts
const { loading, data, execute } = useFlow(fetchUser);
```
:::

::: tip Prefer Callbacks over Watchers
While you *can* use `watch(status)`, it's often cleaner to use the built-in `onSuccess` and `onError` callbacks. This keeps your redirect or toast logic co-located with the flow definition.
:::

### <i class="fa-solid fa-layer-group text-cyan-500 mr-2"></i> Global State & Configuration

::: info Placement of `provideFlowConfig`
Call `provideFlowConfig` at the highest possible level (usually `App.vue` or `main.ts`). This ensures every component in your application tree can access the defaults without manual prop passing.
:::

### <i class="fa-solid fa-universal-access text-purple-400 mr-2"></i> Template UX

::: tip Using `v-bind`
The `v-bind="button()"` pattern is the most powerful way to handle accessibility. It automatically manages `:disabled`, `aria-busy`, and the `click` event, ensuring your Vue components are accessible by default.
:::

::: info Loading State "Flicker"
Just like in React, very fast backend responses can cause a flicker. Use `loading: { minDuration: 400 }` in your global config to provide a more stable visual experience for your users.
:::
