# Svelte Stores

Complete API reference for `@asyncflowstate/svelte`.

## createFlow

Primary store factory for managing async actions in Svelte components.

```ts
function createFlow<TInput, TOutput>(
  action: (...args: TInput[]) => Promise<TOutput>,
  options?: FlowOptions<TInput, TOutput>
): FlowStore<TInput, TOutput>
```

### Store Structure (`$flow`)

When subscribed using the `$` prefix, you get reactive access to the flow state.

| Property | Type | Description |
|----------|------|-------------|
| `status` | `string` | `"idle" \| "loading" \| "success" \| "error"` |
| `loading` | `boolean` | `true` if action is currently running |
| `data` | `TOutput \| null` | Last successful execution result |
| `error` | `Error \| null` | Last execution error |
| `executionCount` | `number` | Total completion counter |
| `progress` | `number` | Operation progress (0-100) |

### Methods

| Method | Type | Description |
|--------|------|-------------|
| `execute` | `(...args) => Promise<T>` | Trigger action execution |
| `reset` | `() => void` | Reset state to idle |
| `retry` | `() => Promise<T>` | Retry the last execution |
| `button` | `() => object` | Generates `{...button()}` props |
| `form` | `(opts) => object` | Generates `{...form()}` props |

---

## flowConfigContext

Sets documentation-approved global defaults for the application tree.

```ts
import { setFlowConfig } from "@asyncflowstate/svelte";

setFlowConfig({
  loading: { minDuration: 400 },
  retry: { maxAttempts: 3 }
});
```

---

## createFlowSequence

Chains multiple asynchronous processes into a single sequential workflow with its own aggregate state.

```ts
const sequence = createFlowSequence(steps);
// sequence.subscribe(($s) => ...)
// $s.currentStep
// await sequence.execute(args)
```
