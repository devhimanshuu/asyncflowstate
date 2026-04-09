# Vue Integration

<cite>
**Referenced Files in This Document**
- [packages/vue/src/composables/useFlow.ts](file://packages/vue/src/composables/useFlow.ts)
- [examples/vue/vue-examples.vue](file://examples/vue/vue-examples.vue)
</cite>

AsyncFlowState provides first-class support for Vue 3 via the `@asyncflowstate/vue` package. It uses Vue's **Composition API** to expose pure reactive state refs and lifecycle hooks, allowing seamless integration into any `<script setup>` block.

## Installation

```bash
pnpm add @asyncflowstate/vue @asyncflowstate/core
```

## Core Composables

### `useFlow`

The central building block for capturing loading, success, and error states of async executions seamlessly.

```vue
<script setup lang="ts">
import { useFlow } from '@asyncflowstate/vue';

const { loading, data, error, execute, button } = useFlow(
  async (id: string) => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  },
  {
    retry: { maxAttempts: 3 },
    onSuccess: (user) => console.log('Loaded:', user),
  }
);
</script>

<template>
  <button v-bind="button()" @click="execute('123')">
    {{ loading ? 'Loading...' : 'Fetch User' }}
  </button>
  <div v-if="data">{{ data.name }}</div>
  <div v-if="error">Error: {{ error.message }}</div>
</template>
```

### Form Handling with Validation
Vue's `useFlow` comes bundled with robust schema validation helpers tailored for form `<form onSubmit>` binding:

```vue
<script setup lang="ts">
import { useFlow } from '@asyncflowstate/vue';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
});

const { form, fieldErrors, loading } = useFlow(
  async (data) => api.login(data)
);
</script>

<template>
  <form v-bind="form({ schema, extractFormData: true })">
    <input name="email" type="email" />
    <span v-if="fieldErrors.email">{{ fieldErrors.email }}</span>

    <button type="submit" :disabled="loading">Login</button>
  </form>
</template>
```

## Advanced Workflows

### `useFlowSequence`
For pipelines that require stepped validation followed by submissions or chained interactions.

```vue
<script setup lang="ts">
import { useFlowSequence } from '@asyncflowstate/vue';

const sequence = useFlowSequence([
  { name: 'Validate', flow: validateFlow.flow },
  { name: 'Fetch Metadata', flow: metadataFlow.flow }
]);
</script>

<template>
  <button @click="sequence.execute()">Run Sequential Job ({{ sequence.progress }}%)</button>
</template>
```

### `useInfiniteFlow`
For infinite scrolling paginated tasks.

```ts
const postsFlow = useInfiniteFlow(
  async (cursor) => fetchPosts(cursor),
  {
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextCursor
  }
);

// Access via postsFlow.pages or trigger postsFlow.fetchNextPage()
```

## Global Configuration

You can provide global behaviors across your Vue application out-of-the-box via the `provideFlowConfig`:

```vue
<script setup lang="ts">
import { provideFlowConfig } from '@asyncflowstate/vue';

// Typically injected in App.vue to cascade down the tree
provideFlowConfig({
  loading: { minDuration: 300 }, // Prevent UI flashes
  retry: { backoff: 'exponential' }
});
</script>
```

## Best Practices

1. **Leverage `v-bind`**: The `button()` and `form()` helpers natively return props aligned to Vue standard elements. Utilize `v-bind="button()"` to securely manage complex disabled interactions smoothly.
2. **Watch Triggers**: Take advantage of `options.triggerOn` arrays linked to Vue `ref()` boolean flags to execute flows fully reactively without imperative function calls!
