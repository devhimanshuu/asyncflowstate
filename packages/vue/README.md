<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/vue <span style="font-size: 14px; background: #10b98122; color: #10b981; padding: 4px 10px; border-radius: 20px; vertical-align: middle; margin-left: 10px;">v2.0 Stable</span></h1>
  <p><b>Official Vue 3 bindings for AsyncFlowState — the industry-standard engine for predictable async UI behavior.</b></p>

  <p>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License: MIT" /></a>
    <a href="https://www.npmjs.com/package/@asyncflowstate/vue"><img src="https://img.shields.io/npm/v/@asyncflowstate/vue?color=indigo" alt="NPM Version" /></a>
  </p>
</div>

## Installation

```bash
pnpm add @asyncflowstate/vue @asyncflowstate/core
```

## Quick Start

### Basic Usage

```vue
<script setup lang="ts">
import { useFlow } from '@asyncflowstate/vue';

const { loading, data, error, execute, button } = useFlow(
  async (id: string) => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  },
  {
    onSuccess: (user) => console.log('Fetched:', user.name),
    onError: (err) => console.error('Failed:', err),
  }
);
</script>

<template>
  <button v-bind="button()">
    {{ loading ? 'Loading...' : 'Fetch User' }}
  </button>
  <div v-if="data">{{ data.name }}</div>
  <div v-if="error">Error: {{ error.message }}</div>
</template>
```

### Form Handling with Validation

```vue
<script setup lang="ts">
import { useFlow } from '@asyncflowstate/vue';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
});

const { loading, fieldErrors, form } = useFlow(
  async (data: any) => api.updateProfile(data),
);
</script>

<template>
  <form v-bind="form({ schema, extractFormData: true })">
    <input name="username" />
    <span v-if="fieldErrors.username">{{ fieldErrors.username }}</span>

    <input name="email" />
    <span v-if="fieldErrors.email">{{ fieldErrors.email }}</span>

    <button type="submit" :disabled="loading">Submit</button>
  </form>
</template>
```

### Global Configuration

```vue
<script setup lang="ts">
import { provideFlowConfig } from '@asyncflowstate/vue';

provideFlowConfig({
  onError: (err) => toast.error(err.message),
  retry: { maxAttempts: 3, backoff: 'exponential' },
  loading: { minDuration: 300 },
});
</script>
```

### Sequential Workflows

```vue
<script setup lang="ts">
import { useFlowSequence } from '@asyncflowstate/vue';

const sequence = useFlowSequence([
  { name: 'Validate', flow: validateFlow },
  { name: 'Submit', flow: submitFlow, mapInput: (prev) => prev.data },
  { name: 'Notify', flow: notifyFlow },
]);
</script>

<template>
  <button @click="sequence.execute()" :disabled="sequence.loading">
    Run Workflow
  </button>
  <p>Progress: {{ sequence.progress }}%</p>
</template>
```

### Parallel Execution

```vue
<script setup lang="ts">
import { useFlowParallel } from '@asyncflowstate/vue';

const parallel = useFlowParallel(
  { users: usersFlow, posts: postsFlow },
  'allSettled'
);
</script>
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v2.0

*   **Dead Letter Queue (DLQ):** Recover from failed operations with centralized replays.
*   **Global Purgatory (Undo):** Native `v-undo` patterns and programmable delay.
*   **Deep-Diff Rollbacks:** Reliable optimistic state that survives complex failures.
*   **Worker Offloading:** Offload reactive updates to Web Workers seamlessly.
*   **Streaming & AI Ready:** First-class support for `AsyncIterable` and `ReadableStream`.
*   **Cross-Tab Sync:** State consistency across the browser session.

## API Reference

| Composable | Description |
|---|---|
| `useFlow(action, options?)` | Core composable for managing async actions |
| `useFlowSequence(steps)` | Orchestrate sequential workflows |
| `useFlowParallel(flows, strategy?)` | Run flows in parallel |
| `useFlowList(action, options?)` | Manage multiple keyed flow instances |
| `useInfiniteFlow(action, options)` | Manage paginated/infinite scrolling data fetching |
| `provideFlowConfig(config)` | Provide global configuration via provide/inject |

## License

MIT © [AsyncFlowState Contributors](https://github.com/devhimanshuu/asyncflowstate)
