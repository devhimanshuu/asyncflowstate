# useFlow Composable API

<cite>
**Referenced Files in This Document**
- [packages/vue/src/composables/useFlow.ts](file://packages/vue/src/composables/useFlow.ts)
</cite>

The `useFlow` composable is the foundational block of `@asyncflowstate/vue`. It encapsulates the core `Flow` state machine within Vue's Composition API `ref()` ecosystem.

## Signature

```ts
function useFlow<Args extends any[], Data, Err extends Error = Error>(
  action: (...args: Args) => Promise<Data>,
  options?: FlowOptions<Args, Data, Err>,
): UseFlowReturn<Args, Data, Err>;
```

## Returns (Vue Refs)

By design, `useFlow` returns reactive state. You do not need to wrap these in computed getters yourself; you map them straight to your `<template>`.

- `loading` (`Ref<boolean>`): True while the action is inflight.
- `status` (`Ref<'idle' | 'loading' | 'success' | 'error'>`): The string union of the current pipeline state.
- `data` (`Ref<Data | null>`): The resolved payout of the action.
- `error` (`Ref<Err | null>`): Rejects from the `action` promise.
- `progress` (`Ref<number>`): 0 to 100 percentage layout useful for tracking sequence steps or custom emissions.

## Methods

- `execute(...args: Args): Promise<Data>`: Manually fire the action flow. It manages all deduplication/concurrency internally!
- `reset()`: Resets `status`, `data`, `error` back to initial values manually.
- `destroy()`: Destroys active timeouts, unbinds window listeners. (Note: **Vue automatically cleans this up** during `onUnmounted`, so you rarely need to call this manually).

## Specialized Options

You can pass standard `FlowOptions` such as `retry`, `optimisticResult`, etc. However, Vue utilizes a few specific integrations:

### `triggerOn`

Automatically execute your flow when specified reactive sources (`ref` or `computed`) resolve truthy:

```vue
<script setup>
const isModalOpen = ref(false);

useFlow(fetchDetails, {
  triggerOn: [isModalOpen], // Automatically runs fetchDetails when modal opens
});
</script>
```

### Auto-Cleanup

Because `useFlow` is bound to the Vue lifecycle, if the component unmounts while a network request is loading, the internal state machine cleans up memory references to prevent updating dead components.
