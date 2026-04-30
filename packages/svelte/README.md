<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/svelte <span style="font-size: 14px; background: #ff3e0022; color: #ff3e00; padding: 4px 10px; border-radius: 20px; vertical-align: middle; margin-left: 10px;">v3.0.0 Stable</span></h1>
  <p><b>Official Svelte bindings for AsyncFlowState — the industry-standard engine for predictable async UI behavior.</b></p>

  <p>
    <a href="https://asyncflowstate-js.pages.dev/frameworks/svelte"><img src="https://img.shields.io/badge/Documentation-Link-blue.svg" alt="Documentation" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License: MIT" /></a>
    <a href="https://www.npmjs.com/package/@asyncflowstate/svelte"><img src="https://img.shields.io/npm/v/@asyncflowstate/svelte?color=indigo" alt="NPM Version" /></a>
  </p>
</div>

## Installation

```bash
pnpm add @asyncflowstate/svelte @asyncflowstate/core
```

## Quick Start

### Basic Usage

```svelte
<script>
  import { createFlow } from '@asyncflowstate/svelte';

  const flow = createFlow(async (id) => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  }, {
    onSuccess: (user) => console.log('Fetched:', user.name),
  });
</script>

<button on:click={() => flow.execute('user-123')} disabled={$flow.loading}>
  {$flow.loading ? 'Loading...' : 'Fetch User'}
</button>

{#if $flow.data}
  <p>{$flow.data.name}</p>
{/if}

{#if $flow.error}
  <p class="error">Error: {$flow.error.message}</p>
{/if}
```

### With Retry & Timeout

```svelte
<script>
  import { createFlow } from '@asyncflowstate/svelte';

  const flow = createFlow(fetchData, {
    timeout: 5000,
    retry: { maxAttempts: 3, backoff: 'exponential' },
  });
</script>
```

### Sequential Workflows

```svelte
<script>
  import { createFlowSequence } from '@asyncflowstate/svelte';

  const sequence = createFlowSequence([
    { name: 'Validate', flow: validateFlow.flow },
    { name: 'Submit', flow: submitFlow.flow },
    { name: 'Notify', flow: notifyFlow.flow },
  ]);
</script>

<button on:click={() => sequence.execute()} disabled={$sequence.loading}>
  Run Workflow ({$sequence.progress}%)
</button>
```

### Parallel Execution

```svelte
<script>
  import { createFlowParallel } from '@asyncflowstate/svelte';

  const parallel = createFlowParallel(
    { users: usersFlow.flow, posts: postsFlow.flow },
    'allSettled'
  );
</script>
```

### Keyed Lists (Delete Buttons)

```svelte
<script>
  import { createFlowList } from '@asyncflowstate/svelte';

  const list = createFlowList(async (id) => api.deleteItem(id));
</script>

{#each items as item}
  <button on:click={() => list.execute(item.id, item.id)}
          disabled={$list.states[item.id]?.status === 'loading'}>
    Delete
  </button>
{/each}
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** Self-healing stores that adapt to execution patterns.
- **Ambient Intelligence:** Svelte-native background predictive monitoring.
- **Speculative Execution:** Low-latency interactions via intent prediction.
- **Emotional UX:** Adaptive skeletons and transitions for Svelte transitions.
- **Collaborative Stores:** Real-time state synchronization across devices.
- **Edge-First Logic:** Native support for edge runtime optimizations.
- **Temporal Trace:** History replay for Svelte reactive state.
- **Telemetry Dashboard:** Live monitoring of all application flow stores.

## Comprehensive Examples

### 1. The Power of Auto-Subscription

Svelte's `$` syntax makes AsyncFlowState feels like a native part of the language.

```svelte
<script>
  import { createFlow } from '@asyncflowstate/svelte';

  const flow = createFlow(api.saveData, {
    optimisticResult: (prev) => ({ ...prev, saved: true }),
    rollbackOnError: true
  });
</script>

<button on:click={() => flow.execute()} disabled={$flow.loading}>
  {$flow.loading ? 'Saving...' : 'Save Changes'}
</button>

{#if $flow.isSuccess}
  <p class="success">Data synced across devices!</p>
{/if}
```

### 2. AI-Powered: Flow DNA & Speculative Execution

Let the engine predict the next user move and pre-warm the state.

```svelte
<script>
  const flow = createFlow(api.fetchDetails, {
    predictive: { prefetchOnHover: true }
  });
</script>

<div on:mouseenter={flow.prewarm} class="card">
  <button on:click={flow.execute}>
    {$flow.status === 'prewarmed' ? 'Instant View' : 'Load Details'}
  </button>
</div>
```

### 3. Enterprise Orchestration: `createFlowSequence`

Chain multiple stores with built-in progress tracking and failure recovery.

```svelte
<script>
  import { createFlowSequence } from '@asyncflowstate/svelte';

  const sequence = createFlowSequence([
    { name: "Step 1", flow: flow1 },
    { name: "Step 2", flow: flow2 },
  ]);
</script>

<progress value={$sequence.progress} max="100" />
<button on:click={sequence.execute}>Run Sequence</button>
```

### 4. Real-Time Collaboration: Cross-Tab Mesh

Synchronize state across multiple browser tabs automatically.

```svelte
<script>
  const flow = createFlow(api.updateTask, {
    crossTab: { sync: true, channel: 'tasks-mesh' }
  });
</script>
```

### 5. Multi-Keyed Flows: `createFlowList`

Perfect for lists where each item needs its own independent async state.

```svelte
<script>
  import { createFlowList } from '@asyncflowstate/svelte';
  const list = createFlowList(api.deleteItem);
</script>

{#each items as item}
  <button on:click={() => list.execute(item.id)}
          disabled={$list.states[item.id]?.loading}>
    Delete {item.name}
  </button>
{/each}
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** Self-healing stores that adapt to execution patterns.
- **Ambient Intelligence:** Svelte-native background predictive monitoring.
- **Speculative Execution:** Low-latency interactions via intent prediction.
- **Emotional UX:** Adaptive skeletons and transitions for Svelte transitions.
- **Collaborative Stores:** Real-time state synchronization across devices.
- **Edge-First Logic:** Native support for edge runtime optimizations.
- **Temporal Trace:** History replay for Svelte reactive state.
- **Telemetry Dashboard:** Live monitoring of all application flow stores.

## API Reference

| Function                               | Description                                       |
| -------------------------------------- | ------------------------------------------------- |
| `createFlow(action, options?)`         | Core store for managing async actions             |
| `createFlowSequence(steps)`            | Orchestrate sequential workflows                  |
| `createFlowParallel(flows, strategy?)` | Run flows in parallel                             |
| `createFlowList(action, options?)`     | Manage multiple keyed flow instances              |
| `createInfiniteFlow(action, options)`  | Manage paginated/infinite scrolling data fetching |

All stores implement the Svelte store contract — use `$store` for auto-subscription.

## Cleanup

Call `flow.destroy()` when you need manual cleanup (e.g., in `onDestroy`):

```svelte
<script>
  import { onDestroy } from 'svelte';

  const flow = createFlow(myAction);
  onDestroy(() => flow.destroy());
</script>
```

## License

MIT © [AsyncFlowState Contributors](https://github.com/devhimanshuu/asyncflowstate)
