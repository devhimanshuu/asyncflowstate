# @asyncflowstate/core

> Framework-agnostic async UI behavior orchestration engine.

## Installation

```bash
npm install @asyncflowstate/core
# or
pnpm add @asyncflowstate/core
```

## Quick Start

```typescript
import { Flow } from "@asyncflowstate/core";

// 1. Create a flow for any async action
const saveFlow = new Flow(async (data) => {
  const response = await fetch("/api/save", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
});

// 2. Subscribe to state changes
saveFlow.subscribe((state) => {
  console.log("Status:", state.status); // 'idle' | 'loading' | 'success' | 'error'
  console.log("Data:", state.data);
  console.log("Error:", state.error);
});

// 3. Execute the flow
await saveFlow.execute({ name: "John" });
```

## Key Features

### Concurrency Strategies

Control what happens when `execute()` is called while an action is already running.

- `keep` (default): Ignore the new request.
- `restart`: Abort the current request and start the new one.

```typescript
const flow = new Flow(fetchData, { concurrency: "restart" });
```

### Perception & UX Polish

Prevent UI flashes by ensuring loading states show for a appropriate amount of time.

- `delay`: Wait before switching to `loading` status (prevents flicker for fast actions).
- `minDuration`: Stay in `loading` state for at least this long once switched.

```typescript
const flow = new Flow(saveData, {
  loading: {
    delay: 200, // Only show spinner if > 200ms
    minDuration: 500, // If shown, keep for at least 500ms
  },
});
```

### Resilience (Retry)

Built-in retry logic with fixed, linear, or exponential backoff.

```typescript
const flow = new Flow(flakeyAction, {
  retry: {
    maxAttempts: 3,
    delay: 1000,
    backoff: "exponential",
  },
});
```

### Optimistic UI

Update the state immediately before the action completes.

```typescript
const flow = new Flow(updateName, {
  optimisticResult: "New Name",
});

flow.execute();
console.log(flow.data); // "New Name" (instantly)
```

### Progress Tracking

Manually report progress for long-running tasks.

```typescript
const flow = new Flow(async () => {
  flow.setProgress(50); // halfway done
});

console.log(flow.progress); // 50
```

### Polling

Automatically re-execute the action at a fixed interval.

```typescript
const flow = new Flow(fetchPrice, {
  polling: {
    interval: 5000, // Every 5 seconds
    stopIf: (data) => data.isClosed, // Stop when condition met
    stopOnError: true,
  },
});

flow.execute(); // Starts execution and subsequent polls
```

### Preconditions

Prevent execution based on custom logic.

```typescript
const flow = new Flow(saveData, {
  precondition: () => isAuthenticated(),
  onBlocked: () => redirectToLogin(),
});
```

### FlowSequence

Run multiple flows in order with shared state.

```typescript
import { FlowSequence } from "@asyncflowstate/core";

const sequence = new FlowSequence([
  { name: "Auth", flow: loginFlow },
  { name: "Fetch", flow: dataFlow, mapInput: (auth) => auth.token },
]);

await sequence.execute();
```

### FlowParallel

Execute multiple flows in parallel with aggregate state. Supports `all`, `allSettled`, and `race` strategies.

```typescript
import { FlowParallel } from "@asyncflowstate/core";

const parallel = new FlowParallel([widget1Flow, widget2Flow], "all");
await parallel.execute();
console.log(parallel.state.progress); // Average progress of all flows
```

### Event System (Debugger Support)

Subscribe to global events for monitoring or logging.

```typescript
const cleanup = Flow.onEvent((event) => {
  console.log(`${event.flowName}: ${event.type}`, event.state);
});
```

## API Reference

### `Flow<TData, TError, TArgs>`

#### Constructor

`new Flow(action, options?)`

#### Properties

- `status`: `'idle' | 'loading' | 'success' | 'error'`
- `data`: `TData | null`
- `error`: `TError | null`
- `progress`: `number` (0-100)
- `isLoading`: `boolean` (Returns `false` if currently in `loading.delay` period)
- `state`: The full state snapshot.

#### Methods

- `execute(...args: TArgs): Promise<TData | undefined>`
- `cancel(): void`
- `reset(): void`
- `setProgress(value: number): void`
- `subscribe(listener: (state) => void): () => void`

## License

MIT © [AsyncFlowState Contributors](https://github.com/devhimanshuu/asyncflowstate)
