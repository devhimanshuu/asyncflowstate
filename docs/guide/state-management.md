# State Management

Understanding how AsyncFlowState manages state is key to using it effectively.

## Flow States

Every flow has exactly one of these states at any given time:

| State       | `status`    | `loading` | `data`    | `error` | Description                     |
| ----------- | ----------- | --------- | --------- | ------- | ------------------------------- |
| **Idle**    | `"idle"`    | `false`   | `null`    | `null`  | Initial state, ready to execute |
| **Loading** | `"loading"` | `true`    | `null`\*  | `null`  | Action is in progress           |
| **Success** | `"success"` | `false`   | `TOutput` | `null`  | Action completed successfully   |
| **Error**   | `"error"`   | `false`   | `null`    | `Error` | Action failed with an error     |

<small>\* During optimistic updates, `data` holds the optimistic result while loading.</small>

## Reading State

### In React

```tsx
const flow = useFlow(async () => api.fetchUser());

// Direct state properties
flow.status; // "idle" | "loading" | "success" | "error"
flow.loading; // boolean shorthand
flow.data; // TOutput | null
flow.error; // Error | null

// Derived state
flow.idle; // status === "idle"
flow.success; // status === "success"
flow.failed; // status === "error"
```

### In Vue

```vue
<script setup>
const { status, loading, data, error, execute } = useFlow(fetchUser);
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <div v-else-if="data">{{ data.name }}</div>
</template>
```

### In Svelte

```svelte
<script>
const flow = createFlow(fetchUser);
</script>

{#if $flow.loading}
  <p>Loading...</p>
{:else if $flow.error}
  <p>{$flow.error.message}</p>
{:else if $flow.data}
  <p>{$flow.data.name}</p>
{/if}
```

## State Transitions

### Normal Flow

```
idle → loading → success
```

### Error Flow

```
idle → loading → error
```

### Retry Flow

```
idle → loading → error → loading (retry 1) → error → loading (retry 2) → success
```

### Reset Flow

```
success → idle (manual or auto-reset)
error → idle (manual reset)
```

## Auto-Reset

Automatically return to idle after success:

```ts
const flow = useFlow(saveData, {
  autoReset: {
    enabled: true,
    delay: 3000, // Reset to idle after 3 seconds
  },
});
```

This is perfect for:

- Toast-style success messages that disappear
- Submit buttons that return to their original state
- Status indicators that clear themselves

## Manual Reset

```ts
const flow = useFlow(saveData);

// After error, user wants to try again
flow.reset(); // Returns to idle state
```

## Execution Count

Track how many times a flow has been executed:

```ts
const flow = useFlow(saveData);

console.log(flow.executionCount); // 0
await flow.execute(data);
console.log(flow.executionCount); // 1
```

## State Snapshots

For debugging or persistence, you can capture the full state:

```ts
const snapshot = flow.getSnapshot();
// {
//   status: "success",
//   data: { id: 1, name: "John" },
//   error: null,
//   loading: false,
//   executionCount: 1,
//   lastExecutedAt: 1704067200000,
// }
```
