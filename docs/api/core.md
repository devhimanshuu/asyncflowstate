# Core API Reference

Complete API reference for `@asyncflowstate/core`.

## Flow Class

The fundamental building block — wraps any async function with lifecycle management.

### Constructor

```ts
new Flow<TInput, TOutput>(
  action: (...args: TInput[]) => Promise<TOutput>,
  options?: FlowOptions<TInput, TOutput>
)
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `status` | `"idle" \| "loading" \| "success" \| "error"` | Current state |
| `loading` | `boolean` | `true` while executing |
| `data` | `TOutput \| null` | Last successful result |
| `error` | `Error \| null` | Last error |
| `idle` | `boolean` | `status === "idle"` |
| `success` | `boolean` | `status === "success"` |
| `failed` | `boolean` | `status === "error"` |
| `executionCount` | `number` | Total executions |
| `retryCount` | `number` | Current retry attempt |
| `progress` | `number` | Progress value (0–100) |

### Methods

#### `execute(...args): Promise<TOutput>`

Executes the action with the given arguments. Behavior depends on concurrency mode.

```ts
const result = await flow.execute(data);
```

#### `reset(): void`

Resets the flow to idle state. Clears data and error.

```ts
flow.reset();
```

#### `retry(): Promise<TOutput>`

Re-executes the last action with the same arguments.

```ts
await flow.retry();
```

#### `subscribe(callback): () => void`

Subscribes to state changes. Returns an unsubscribe function.

```ts
const unsubscribe = flow.subscribe((state) => {
  console.log(state.status, state.data, state.error);
});

// Later
unsubscribe();
```

#### `setOptions(options): void`

Updates options at runtime. Merges with existing options.

```ts
flow.setOptions({
  retry: { maxAttempts: 5 },
});
```

#### `setProgress(value): void`

Manually set progress value (0–100).

```ts
flow.setProgress(50); // 50% complete
```

#### `getSnapshot(): FlowSnapshot`

Returns a serializable snapshot of the current state.

```ts
const snapshot = flow.getSnapshot();
```

#### `destroy(): void`

Cleans up all subscriptions and timers.

```ts
flow.destroy();
```

---

## FlowOptions

```ts
interface FlowOptions<TInput, TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: Error) => void;
  onStart?: (input: TInput) => void;

  retry?: RetryOptions;
  concurrency?: "keep" | "restart" | "enqueue";
  loading?: LoadingOptions;
  autoReset?: AutoResetOptions;

  optimisticResult?: TOutput;
  debounce?: number;
  throttle?: number;
}
```

### RetryOptions

```ts
interface RetryOptions {
  maxAttempts?: number;  // default: 1
  delay?: number;        // default: 1000
  backoff?: "fixed" | "linear" | "exponential";  // default: "fixed"
  shouldRetry?: (error: Error, attempt: number) => boolean;
}
```

### LoadingOptions

```ts
interface LoadingOptions {
  minDuration?: number;  // default: 0
  delay?: number;        // default: 0
}
```

### AutoResetOptions

```ts
interface AutoResetOptions {
  enabled?: boolean;  // default: false
  delay?: number;     // default: 3000
}
```

---

## FlowSequence

Execute flows in order, passing results between steps.

```ts
import { FlowSequence } from "@asyncflowstate/core";

const sequence = new FlowSequence(steps);
const result = await sequence.execute(initialInput);
```

### Step Definition

```ts
interface FlowStep<TIn, TOut> {
  name: string;
  flow: Flow<TIn, TOut>;
  mapInput?: (previousResult: any) => TIn;
}
```

---

## FlowParallel

Execute multiple flows simultaneously.

```ts
import { FlowParallel } from "@asyncflowstate/core";

const parallel = new FlowParallel(flows);
const results = await parallel.execute();
```

| Property | Type | Description |
|----------|------|-------------|
| `loading` | `boolean` | `true` if any flow is loading |
| `data` | `TOutput[]` | Array of results |
| `error` | `Error \| null` | First error encountered |
| `progress` | `number` | Aggregate progress |

---

## Utility Functions

### createFlowError

Create typed, structured errors:

```ts
import { createFlowError } from "@asyncflowstate/core";

const error = createFlowError("NOT_FOUND", {
  message: "User not found",
  status: 404,
});
```

### Constants

```ts
// Default values
DEFAULT_RETRY_ATTEMPTS    // 1
DEFAULT_RETRY_DELAY       // 1000
DEFAULT_BACKOFF           // "fixed"
DEFAULT_CONCURRENCY       // "keep"
DEFAULT_MIN_DURATION      // 0
DEFAULT_LOADING_DELAY     // 0
PROGRESS_MIN              // 0
PROGRESS_MAX              // 100
```
