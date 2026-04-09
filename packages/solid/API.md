# Solid Package - API Reference & Usage Guide

## Overview

`@asyncflowstate/solid` provides SolidJS fine-grained reactive primitives for the AsyncFlowState engine.

## Primitives

### createFlow(action, options?)

Core primitive for managing a single async action. Returns accessor signals.

```typescript
import { createFlow } from '@asyncflowstate/solid';

const flow = createFlow(
  async (id: string) => api.fetchUser(id),
  { retry: { maxAttempts: 3 } }
);

flow.loading()  // boolean (accessor)
flow.data()     // TData | null (accessor)
flow.error()    // TError | null (accessor)
flow.status()   // FlowStatus (accessor)
```

### createFlowSequence(steps)

Primitive for sequential workflows.

### createFlowParallel(flows, strategy?)

Primitive for parallel execution.

### createFlowList(action, options?)

Primitive for multiple keyed flow instances.

### createInfiniteFlow(action, options)

Primitive for paginated data fetching.

## Components

### FlowProvider

Global configuration via SolidJS context.

```tsx
<FlowProvider config={{ onError: (err) => toast.error(err.message) }}>
  <App />
</FlowProvider>
```

## Types

```typescript
import type {
  SolidFlowOptions,
  SolidFlowProviderConfig,
  SolidInfiniteFlowOptions,
} from '@asyncflowstate/solid';
```
