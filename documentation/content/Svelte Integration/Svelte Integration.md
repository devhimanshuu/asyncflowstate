# Svelte Integration

<cite>
**Referenced Files in This Document**
- [packages/svelte/src/stores/createFlow.ts](file://packages/svelte/src/stores/createFlow.ts)
- [examples/svelte/svelte-examples.svelte](file://examples/svelte/svelte-examples.svelte)
</cite>

AsyncFlowState heavily embraces Svelte's native **Store** reactivity system in the `@asyncflowstate/svelte` integration. Every utility automatically implements the active `Writable`/`Readable` paradigms mapping seamlessly with the standard Svelte auto-subscriptions syntax (`$`).

## Installation

```bash
pnpm add @asyncflowstate/svelte @asyncflowstate/core
```

## State Subscriptions

### `createFlow`

The fundamental pipeline for wrapping single executions. Note the `$` prefixes capturing reactive data updates globally.

```svelte
<script>
  import { createFlow } from '@asyncflowstate/svelte';

  const userFlow = createFlow(async (id) => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  });
</script>

<button
  on:click={() => userFlow.execute('123')}
  disabled={$userFlow.loading}
>
  {$userFlow.loading ? 'Fetching...' : 'Load'}
</button>

{#if $userFlow.data}
  <p>{$userFlow.data.name}</p>
{/if}

{#if $userFlow.error}
  <p class="error">{$userFlow.error.message}</p>
{/if}
```

## List & Sequence Execution

### `createFlowList`

When managing individual components dynamically tied to separate operations (e.g., delete buttons across a table block), you don't want global UI blocking. Use lists:

```svelte
<script>
  import { createFlowList } from '@asyncflowstate/svelte';

  const deleteList = createFlowList(async (id) => api.delete(id));
  export let items = [];
</script>

{#each items as item}
  <button
    on:click={() => deleteList.execute(item.id, item.id)}
    disabled={$deleteList.states[item.id]?.status === 'loading'}
  >
    {$deleteList.states[item.id]?.status === 'loading' ? 'Deleting' : 'Delete'}
  </button>
{/each}
```

### `createInfiniteFlow`

Seamless infinite scrolling tied effectively into iterative Svelte blocks tracking recursive page parameters:

```svelte
<script>
  import { createInfiniteFlow } from '@asyncflowstate/svelte';

  const feed = createInfiniteFlow(fetchData, {
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextCursor
  });
</script>

{#each $feed.pages as page}
  <div>{page.content}</div>
{/each}

<button
  on:click={() => feed.fetchNextPage()}
  disabled={$feed.isFetchingNextPage}
>
  More
</button>
```

## Best Practices

1. **Store Extraction Lifecycle:** Always ensure cleanup inside Svelte components via `.destroy()` if generating local flows that hook document event listeners `window`. E.g.:

```svelte
<script>
  import { onDestroy } from 'svelte';

  const tempFlow = createFlow(myAction);
  onDestroy(() => tempFlow.destroy());
</script>
```

2. **Signal & Middleware Expansion**: Combine core `FlowMiddleware` interceptors to run cross-store configurations or cache handlers within `createFlow`.
