# Svelte Package - API Reference & Usage Guide

## Overview

`@asyncflowstate/svelte` provides Svelte store factories for the AsyncFlowState engine.

## Stores

### createFlow(action, options?)

Core store for managing a single async action. Implements the Svelte store contract.

```typescript
import { createFlow } from "@asyncflowstate/svelte";

const flow = createFlow(async (id: string) => api.fetchUser(id), {
  retry: { maxAttempts: 3, backoff: "exponential" },
});

// Use with $flow auto-subscription
$flow.loading; // boolean
$flow.data; // TData | null
$flow.error; // TError | null
$flow.status; // FlowStatus
$flow.progress; // number
```

### createFlowSequence(steps)

Store for orchestrating sequential async workflows.

```typescript
import { createFlowSequence } from "@asyncflowstate/svelte";

const sequence = createFlowSequence([
  { name: "Auth", flow: loginFlow.flow },
  { name: "Fetch", flow: dataFlow.flow, mapInput: (auth) => auth.token },
]);

await sequence.execute();
```

### createFlowParallel(flows, strategy?)

Store for running multiple flows in parallel.

```typescript
import { createFlowParallel } from "@asyncflowstate/svelte";

const parallel = createFlowParallel(
  { users: usersFlow.flow, posts: postsFlow.flow },
  "allSettled",
);

await parallel.execute();
```

### createFlowList(action, options?)

Store for managing multiple keyed flow instances.

```typescript
import { createFlowList } from "@asyncflowstate/svelte";

const list = createFlowList(async (id: string) => api.deleteItem(id));
list.execute("item-1", "item-1");
```

### createInfiniteFlow(action, options)

Store for paginated/infinite scrolling data fetching.

```typescript
import { createInfiniteFlow } from "@asyncflowstate/svelte";

const infinite = createInfiniteFlow(
  async (cursor) => api.getPostsPage(cursor),
  {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  },
);
```

## Types

```typescript
import type {
  SvelteFlowOptions,
  SvelteInfiniteFlowOptions,
} from "@asyncflowstate/svelte";
```
