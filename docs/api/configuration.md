# Configuration Reference

<ConfigAnimation />

Complete reference for all AsyncFlowState configuration options.

## Quick Reference

```ts
const flow = useFlow(action, {
  // Callbacks
  onSuccess: (data) => {},
  onError: (error) => {},
  onStart: (input) => {},

  // Retry
  retry: {
    maxAttempts: 3,
    delay: 1000,
    backoff: "exponential",
    shouldRetry: (error, attempt) => true,
  },

  // Concurrency
  concurrency: "keep", // "keep" | "restart" | "enqueue"

  // Loading UX
  loading: {
    minDuration: 400,
    delay: 200,
  },

  // Auto-reset
  autoReset: {
    enabled: true,
    delay: 3000,
  },

  // Optimistic
  optimisticResult: expectedData,

  // Rate limiting
  debounce: 300,
  throttle: 200,

  // React-specific
  a11y: {
    announceSuccess: "Saved successfully",
    announceError: (err) => `Error: ${err.message}`,
    liveRegionRel: "polite",
  },
});
```

## Detailed Options

### Callbacks

#### `onSuccess(data: TOutput): void`

Called when the action completes successfully. Receives the result data.

#### `onError(error: Error): void`

Called when the action fails (after all retry attempts). Receives the error.

#### `onStart(input: TInput): void`

Called when execution begins, before the action runs. Useful for optimistic updates.

---

### Retry Options

#### `retry.maxAttempts`

- **Type:** `number`
- **Default:** `1` (no retry)
- Maximum number of total execution attempts.

#### `retry.delay`

- **Type:** `number` (ms)
- **Default:** `1000`
- Base delay between retry attempts.

#### `retry.backoff`

- **Type:** `"fixed" | "linear" | "exponential"`
- **Default:** `"fixed"`
- How the delay scales between attempts.

| Strategy        | Attempt 1 | Attempt 2 | Attempt 3 | Attempt 4 |
| --------------- | --------- | --------- | --------- | --------- |
| `"fixed"`       | 1000ms    | 1000ms    | 1000ms    | 1000ms    |
| `"linear"`      | 1000ms    | 2000ms    | 3000ms    | 4000ms    |
| `"exponential"` | 1000ms    | 2000ms    | 4000ms    | 8000ms    |

#### `retry.shouldRetry`

- **Type:** `(error: Error, attempt: number) => boolean`
- Custom predicate to control whether to retry.

---

### Concurrency

#### `concurrency`

- **Type:** `"keep" | "restart" | "enqueue"`
- **Default:** `"keep"`

| Mode        | Behavior                          |
| ----------- | --------------------------------- |
| `"keep"`    | Ignore new calls while loading    |
| `"restart"` | Cancel current, start new         |
| `"enqueue"` | Queue for after current completes |

---

### Loading UX

#### `loading.minDuration`

- **Type:** `number` (ms)
- **Default:** `0`
- Minimum time the loading state is shown, preventing UI flashes.

#### `loading.delay`

- **Type:** `number` (ms)
- **Default:** `0`
- Delay before `loading` becomes `true`. If the action completes before this delay, no loading state is shown.

---

### Auto-Reset

#### `autoReset.enabled`

- **Type:** `boolean`
- **Default:** `false`
- Whether to automatically reset to idle after success.

#### `autoReset.delay`

- **Type:** `number` (ms)
- **Default:** `3000`
- How long to wait after success before resetting.

---

### Optimistic UI

#### `optimisticResult`

- **Type:** `TOutput`
- When set, `data` is immediately set to this value when execution starts. On success, it's replaced with the real result. On error, it reverts to `null`.

---

### Rate Limiting

#### `debounce`

- **Type:** `number` (ms)
- Delays execution until the specified time has passed since the last call.

#### `throttle`

- **Type:** `number` (ms)
- Limits execution to at most once per specified time window.

---

### Accessibility (React-only)

#### `a11y.announceSuccess`

- **Type:** `string | (data: TOutput) => string`
- Text announced to screen readers on success.

#### `a11y.announceError`

- **Type:** `string | (error: Error) => string`
- Text announced to screen readers on error.

#### `a11y.liveRegionRel`

- **Type:** `"polite" | "assertive"`
- **Default:** `"polite"`
- Politeness level for ARIA live region announcements.

---

---

### Persistence & Resiliency

#### `persist`

- **Type:** `object`
- Configuration for state persistence.
  - `key: string`: Unique key for storage.
  - `storage: "local" | "session"`: Storage type (Default: `"local"`).
  - `persistLoading: boolean`: Survive refreshes while loading.
  - `ttl: number`: Expiration time in ms.

#### `circuitBreaker`

- **Type:** `object`
- Configuration for the Circuit Breaker pattern.
  - `failureThreshold: number`: Failures before opening circuit.
  - `resetTimeout: number`: Time to wait before half-opening.

#### `timeout`

- **Type:** `number` (ms)
- Maximum execution time before automatic cancellation.

#### `precondition`

- **Type:** `() => boolean | Promise<boolean>`
- Guard function that must return true for execution to proceed.

---

### Advanced Orchestration

#### `middleware`

- **Type:** `FlowMiddleware[]`
- Array of hooks to intercept lifecycle events.

#### `triggerOn`

- **Type:** `(FlowSignal | boolean | subscribable)[]`
- External sources that automatically trigger execution.

#### `sync`

- **Type:** `object`
- Cross-tab synchronization.
  - `channel: string`: BroadcastChannel name.
  - `syncLoading: boolean`: Whether to sync active status.

---

### Performance & Cache

#### `dedupKey`

- **Type:** `string`
- Unique key to share in-flight promises between multiple flows.

#### `staleTime`

- **Type:** `number` (ms)
- Window during which successful results are served from cache.

#### `autoProgress`

- **Type:** `object`
- Simulated progress automation.
  - `duration: number`: Time to reach target.
  - `end: number`: Target percentage (0-100).

---

## FlowProvider Config

All the above options, plus:

#### `overrideMode`

- **Type:** `"merge" | "replace"`
- **Default:** `"merge"`
- `"merge"`: Local options are deep-merged with global (local wins for overlapping keys)
- `"replace"`: If local options exist, they completely replace global options
