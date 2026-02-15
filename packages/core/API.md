# Core Package - API Reference & Usage Guide

## Overview

`@asyncflowstate/core` is a framework-agnostic, TypeScript-first engine for orchestrating complex async operations, retries, and state management.

## Quick Start

```typescript
import { Flow } from "@asyncflowstate/core";

// Create and execute a flow
const flow = new Flow(async (id: string) => {
  const response = await fetch(`/api/user/${id}`);
  return response.json();
});

flow.subscribe((state) => console.log(state));
await flow.execute("user-123");
```

## Core API

### Flow Class

The main class for managing async operations.

#### Constructor

```typescript
new Flow<TData, TError, TArgs>(
  action: (...args: TArgs) => Promise<TData> | AsyncIterable<any> | ReadableStream<any>,
  options?: FlowOptions<TData, TError, TArgs>
)
```

#### Properties

- **`status`** - Current lifecycle phase: `'idle' | 'loading' | 'streaming' | 'success' | 'error'`
- **`data`** - Result of the last successful execution (or accumulated stream data)
- **`error`** - Error object from the last failure
- **`progress`** - Execution progress (0-100)
- **`state`** - Read-only snapshot of the full state
- **`signals`** - Inter-flow communication channels (`start`, `success`, `error`, `cancel`, `stream`, `reset`, `restore`)

#### Methods

- **`execute(...args)`** - Initiates the flow execution. Handles debouncing/throttling/circuit breaking.
- **`cancel()`** - Aborts the current execution
- **`reset()`** - Resets flow to idle state and clears data/error
- **`subscribe(listener)`** - Subscribes to state changes
- **`setOptions(options)`** - Updates options at runtime
- **`setProgress(val)`** - Manually update progress during execution

### FlowSequence

Execute multiple flows sequentially.

```typescript
import { FlowSequence } from "@asyncflowstate/core";

const sequence = new FlowSequence([
  { name: "Auth", flow: loginFlow },
  { name: "Fetch", flow: dataFlow, mapInput: (auth) => auth.token },
]);

await sequence.execute();
```

### FlowParallel

Execute multiple flows in parallel.

```typescript
import { FlowParallel } from "@asyncflowstate/core";

const parallel = new FlowParallel([flow1, flow2], "all");
await parallel.execute();
```

## Advanced Features

### Resilience & Circuit Breaker

```typescript
const flow = new Flow(fetchData, {
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 30000,
  },
  circuitBreakerKey: "api-service-v1", // Persisted to localStorage
});
```

### Declarative Chaining

```typescript
const upload = new Flow(uploadFile);
const process = new Flow(processFile, {
  triggerOn: [upload.signals.success],
});
```

### Streaming Support

If the action returns an `AsyncIterable` or `ReadableStream`, the flow treats it as a stream, accumulates data (if strings), and emits `stream` signals for each chunk.

### Middleware

```typescript
flow.use({
  onStart: (context) => console.log("Started", context),
  onSuccess: (data) => console.log("Success", data),
  onStream: (chunk) => console.log("Chunk", chunk),
});
```

## Types

```typescript
import type {
  FlowState,
  FlowStatus,
  FlowOptions,
  FlowEvent,
  RetryOptions,
  CircuitBreakerOptions,
} from "@asyncflowstate/core";
```
