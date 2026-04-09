# createFlow Store API

<cite>
**Referenced Files in This Document**
- [packages/svelte/src/stores/createFlow.ts](file://packages/svelte/src/stores/createFlow.ts)
</cite>

Svelte thrives on minimal abstraction syntax, hence `@asyncflowstate/svelte` integrates flawlessly via standard custom Stores.

## Signature

```ts
import { createFlow } from "@asyncflowstate/svelte";

const userFlow = createFlow(action, options);
```

## Consuming Reactivity

Because `createFlow` implements Svelte's `Writable<State>` contract, any modifications or loading state triggers inside the engine safely alert your DOM implicitly when referenced with `$` syntax:

```svelte
<button
  on:click={() => userFlow.execute('123')}
  disabled={$userFlow.loading}
>
  {$userFlow.loading ? '...' : 'Go'}
</button>
```

Underneath the hood, the entire orchestrator maps to UI progression flawlessly. You never need to call `.update()` or `.set()` yourself; the `.execute()` sequence internally sets the data streams natively.

## Cleanup Requirements

Because `Flow` creates active memory subscriptions managing the state-machine intervals or visibility event listeners tracking browser data, it natively exports a `.destroy()` garbage collection utility.

Ensure you properly invoke cleanup loops within non-root level Svelte components to wipe dangling configurations on unmount!

```svelte
<script>
  import { onDestroy } from 'svelte';
  import { createFlow } from '@asyncflowstate/svelte';

  const isolatedFlow = createFlow(someExpensiveAction);

  onDestroy(() => {
    isolatedFlow.destroy();
  });
</script>
```
