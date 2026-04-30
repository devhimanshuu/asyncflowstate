<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/core <span style="font-size: 14px; background: #10b98122; color: #10b981; padding: 4px 10px; border-radius: 20px; vertical-align: middle; margin-left: 10px;">v3.0.0 Stable</span></h1>
  <p><b>Framework-agnostic async UI behavior orchestration engine.</b></p>

  <p>
    <a href="https://asyncflowstate-js.pages.dev/api/core"><img src="https://img.shields.io/badge/Documentation-Link-blue.svg" alt="Documentation" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License: MIT" /></a>
    <a href="https://www.npmjs.com/package/@asyncflowstate/core"><img src="https://img.shields.io/npm/v/@asyncflowstate/core?color=indigo" alt="NPM Version" /></a>
  </p>
</div>

---

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

### Streaming Support (LLM/AI)

Native support for `AsyncIterable` and `ReadableStream`. The flow status switches to `'streaming'` until completion.

```typescript
const flow = new Flow(async (prompt) => {
  const response = await ai.stream(prompt);
  return response.body; // ReadableStream
});

flow.subscribe((state) => {
  if (state.status === "streaming") {
    processChunk(state.data);
  }
});
```

### Persistent Circuit Breaker

Prevents cascading failures by "tripping" the circuit after thresholds are met. State is persisted to `localStorage`.

```typescript
const flow = new Flow(flakeyAPI, {
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 30000,
  },
  circuitBreakerKey: "user-api-circuit",
});
```

### Declarative Chaining (Signals)

Use signals to chain flows without manual `useEffect` or complex orchestration.

```typescript
const saveFlow = new Flow(saveUser);
const emailFlow = new Flow(sendEmail, {
  triggerOn: [saveFlow.signals.success],
});
```

### Event System (Debugger Support)

Subscribe to global events for monitoring or logging.

```typescript
const cleanup = Flow.onEvent((event) => {
  console.log(
    `${event.flowName} [${event.flowId}]: ${event.type}`,
    event.state,
  );
});
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** Self-healing async state that learns from environment patterns and user behavior.
- **Ambient Intelligence:** Non-intrusive monitoring that predicts and optimizes background flows.
- **Flow Choreography:** Declarative coordination of complex, multi-stage async workflows.
- **Speculative Execution:** Run flows before users even click, based on high-confidence intent prediction.
- **Emotional UX:** Adaptive UI transitions and skeleton states that respond to user sentiment and system load.
- **Flow Mesh:** Cross-tab and cross-device orchestration with leader election and shared state.
- **Collaborative Flows:** Sync async state in real-time across multiple users and browser sessions.
- **Temporal Replay:** Time-travel through any async flow state with full state restoration.
- **Edge-First Flows:** Optimized for Cloudflare Workers, Vercel Edge, and Deno with automatic failover.
- **Telemetry Dashboard:** Real-time visualization of all flow health, latency, and throughput.

## API Reference

### `Flow<TData, TError, TArgs>`

#### Constructor

`new Flow(action, options?)`

#### Properties

- `status`: `'idle' | 'loading' | 'streaming' | 'success' | 'error'`
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
