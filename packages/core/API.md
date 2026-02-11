# Core Package - API Reference & Usage Guide

## Overview

`@asyncflowstate/core` is a framework-agnostic, TypeScript-first engine for orchestrating complex async operations, retries, and state management.

## Quick Start

```typescript
import { Flow } from "@asyncflowstate/core";

// Create and execute a flow
const flow = new Flow(async () => {
  const response = await fetch("/api/data");
  return response.json();
});

flow.subscribe((state) => console.log(state));
await flow.start();
```

## Core API

### Flow Class

The main class for managing async operations.

#### Constructor

```typescript
new Flow<TResult>(
  executor: FlowExecutor<TResult>,
  options?: FlowOptions<TResult>
)
```

#### Methods

- **`start()`** - Initiates the flow execution
- **`cancel()`** - Cancels the flow execution
- **`reset()`** - Resets flow to idle state
- **`subscribe(listener)`** - Subscribes to state changes
- **`getState()`** - Gets current flow state

#### Events

- **`pending`** - Flow starts executing
- **`success`** - Flow completed successfully
- **`error`** - Flow encountered an error
- **`cancelled`** - Flow was cancelled
- **`retrying`** - Flow is retrying

### sequence()

Execute multiple operations sequentially.

```typescript
import { sequence } from "@asyncflowstate/core";

const result = await sequence([
  () => fetchUser(id),
  (user) => fetchPosts(user.id),
  (posts) => enrichPosts(posts),
]);
```

### parallel()

Execute multiple operations in parallel.

```typescript
import { parallel } from "@asyncflowstate/core";

const [users, posts, comments] = await parallel([
  () => fetchUsers(),
  () => fetchPosts(),
  () => fetchComments(),
]);
```

## Advanced Features

### Error Handling

```typescript
const flow = new Flow(fetchData, {
  onError: (error) => {
    console.error("Flow failed:", error);
  },
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
    backoff: "exponential",
  },
});
```

### Persistence

```typescript
import { withPersistence } from "@asyncflowstate/core";

const persistedFlow = withPersistence(flow, {
  storage: localStorage,
  key: "my-flow-state",
});
```

### Middleware

```typescript
flow.use((context) => {
  console.log("Flow started:", context);
  return (next) => {
    const startTime = Date.now();
    return async () => {
      const result = await next();
      console.log("Duration:", Date.now() - startTime);
      return result;
    };
  };
});
```

## Testing

```typescript
import { createMockFlow } from "@asyncflowstate/core";

const mockFlow = createMockFlow(() => ({ data: "test" }));
await mockFlow.start();
```

## Storage API

```typescript
import { createStorage } from "@asyncflowstate/core";

const storage = createStorage(window.localStorage);
await storage.set("key", { data: "value" });
const data = await storage.get("key");
```

## Types

All types are exported from the main package:

```typescript
import type {
  FlowState,
  FlowExecutor,
  FlowOptions,
  FlowListener,
  RetryOptions,
} from "@asyncflowstate/core";
```

## See Also

- [Full Documentation](../../documentation/)
- [Examples](../../examples/core/)
- [Contributing Guide](../../CONTRIBUTING.md)
