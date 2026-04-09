<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/svelte <span style="font-size: 14px; background: #ff3e0022; color: #ff3e00; padding: 4px 10px; border-radius: 20px; vertical-align: middle; margin-left: 10px;">v2.0 Stable</span></h1>
  <p><b>Official Svelte bindings for AsyncFlowState — the industry-standard engine for predictable async UI behavior.</b></p>

  <p>
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

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v2.0

*   **Dead Letter Queue (DLQ):** Recover from failed operations with centralized replays.
*   **Global Purgatory (Undo):** Native undo patterns and programmable delay.
*   **Deep-Diff Rollbacks:** Reliable optimistic state that survives complex failures.
*   **Worker Offloading:** Offload reactive updates to Web Workers seamlessly.
*   **Streaming & AI Ready:** First-class support for `AsyncIterable` and `ReadableStream`.
*   **Cross-Tab Sync:** State consistency across the browser session.

## API Reference

| Function | Description |
|---|---|
| `createFlow(action, options?)` | Core store for managing async actions |
| `createFlowSequence(steps)` | Orchestrate sequential workflows |
| `createFlowParallel(flows, strategy?)` | Run flows in parallel |
| `createFlowList(action, options?)` | Manage multiple keyed flow instances |
| `createInfiniteFlow(action, options)` | Manage paginated/infinite scrolling data fetching |

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
