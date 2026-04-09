# SolidJS Primitives

Complete API reference for `@asyncflowstate/solid`.

## createFlow

Core primitive for generating fine-grained reactive signals in SolidJS.

```ts
function createFlow<TInput, TOutput>(
  action: (...args: TInput[]) => Promise<TOutput>,
  options?: FlowOptions<TInput, TOutput>
): SolidFlow<TInput, TOutput>
```

### Signal Accessors

All state properties are accessed via zero-argument signal getter functions.

| Property | Type | Description |
|----------|------|-------------|
| `status()` | `Accessor<FlowStatus>` | Current state: `idle`, `loading`, etc. |
| `loading()`| `Accessor<boolean>`| Fine-grained loading signal |
| `data()`   | `Accessor<T \| null>`| Fine-grained data signal |
| `error()`  | `Accessor<Error \| null>`| Fine-grained error signal |
| `progress()`| `Accessor<number>`| Current operation progress |

### Methods

| Method | Type | Description |
|--------|------|-------------|
| `execute` | `(...args) => Promise<T>` | Trigger action |
| `reset` | `() => void` | Reset signals |
| `retry` | `() => Promise<T>` | Retry last execution |

---

## FlowProvider

Provides global configuration using SolidJS Context.

```tsx
import { FlowProvider } from "@asyncflowstate/solid";

<FlowProvider config={{ retry: { maxAttempts: 3 } }}>
  <App />
</FlowProvider>
```

---

## createFlowSequence

Chains multiple asynchronous processes into a single sequential workflow with its own aggregate state, return as a set of fine-grained signals.

```ts
const sequence = createFlowSequence(steps);
// sequence.loading()
// sequence.currentStep()
// await sequence.execute(args)
```
