# Vue Composables

Complete API reference for `@asyncflowstate/vue`.

## useFlow

Primary composable for managing async actions with reactive Refs in Vue 3.

```ts
function useFlow<TInput, TOutput>(
  action: (...args: TInput[]) => Promise<TOutput>,
  options?: FlowOptions<TInput, TOutput>
): UseFlowResult<TInput, TOutput>
```

### Return Value (Reactive Refs)

| Property | Type | Description |
|----------|------|-------------|
| `status` | `Ref<string>` | Current flow status |
| `loading` | `Ref<boolean>` | `true` if action is currently running |
| `data` | `Ref<T \| null>` | Last successful execution result |
| `error` | `Ref<Error \| null>` | Last execution error |
| `execute` | `(...args) => Promise<T>` | Trigger action execution |
| `reset` | `() => void` | Reset state to idle |
| `button` | `() => object` | Generates `v-bind` props for buttons |
| `form` | `(opts) => object` | Generates `v-bind` props for forms |
| `fieldErrors` | `Reactive<Record>` | Live validation errors |
| `executionCount`| `Ref<number>` | Total completion counter |

---

## provideFlowConfig

Sets global configuration for all descendants using Vue's provide/inject.

```ts
import { provideFlowConfig } from "@asyncflowstate/vue";

provideFlowConfig({
  loading: { minDuration: 400 },
  retry: { maxAttempts: 3 }
});
```

---

## useFlowSequence

Executes a sequence of steps where each step depends on the last.

```ts
const sequence = useFlowSequence(steps);
// sequence.loading
// sequence.currentStep
// await sequence.execute(args)
```

---

## useFlowParallel

Aggregates multiple flows into a single loading/data state.

```ts
const parallel = useFlowParallel([flow1, flow2]);
// parallel.loading
// parallel.data (array)
```
