# Vue Package - API Reference & Usage Guide

## Overview

`@asyncflowstate/vue` provides Vue 3 Composition API composables for the AsyncFlowState engine.

## Composables

### useFlow(action, options?)

The core composable for managing a single async action.

```typescript
import { useFlow } from "@asyncflowstate/vue";

const {
  status,
  data,
  error,
  loading,
  execute,
  reset,
  cancel,
  button,
  form,
  fieldErrors,
  signals,
} = useFlow(async (id: string) => api.fetchUser(id), {
  retry: { maxAttempts: 3, backoff: "exponential" },
  timeout: 5000,
  onSuccess: (user) => console.log("Fetched:", user.name),
});
```

#### Return Value

| Property      | Type                          | Description                             |
| ------------- | ----------------------------- | --------------------------------------- |
| `status`      | `Ref<FlowStatus>`             | Current lifecycle phase                 |
| `data`        | `Ref<TData \| null>`          | Result of the last successful execution |
| `error`       | `Ref<TError \| null>`         | Error from the last failure             |
| `progress`    | `Ref<number>`                 | Execution progress (0-100)              |
| `loading`     | `ComputedRef<boolean>`        | Whether the flow is currently loading   |
| `isSuccess`   | `ComputedRef<boolean>`        | Whether the flow completed successfully |
| `isError`     | `ComputedRef<boolean>`        | Whether the flow is in error state      |
| `isIdle`      | `ComputedRef<boolean>`        | Whether the flow is idle                |
| `isStreaming` | `ComputedRef<boolean>`        | Whether the flow is streaming           |
| `execute`     | `(...args) => Promise`        | Execute the action                      |
| `reset`       | `() => void`                  | Reset flow to idle                      |
| `cancel`      | `() => void`                  | Cancel the running action               |
| `setProgress` | `(val) => void`               | Manually set progress                   |
| `button`      | `(props?) => object`          | Button helper for `v-bind`              |
| `form`        | `(props?) => object`          | Form helper for `v-bind`                |
| `fieldErrors` | `Ref<Record<string, string>>` | Field-level validation errors           |
| `flow`        | `Flow`                        | The underlying Flow instance            |
| `signals`     | `FlowSignals`                 | Inter-flow communication channels       |

### useFlowSequence(steps)

Orchestrate sequential async workflows.

```typescript
import { useFlowSequence } from "@asyncflowstate/vue";

const sequence = useFlowSequence([
  { name: "Auth", flow: loginFlow },
  { name: "Fetch", flow: dataFlow, mapInput: (auth) => auth.token },
]);

await sequence.execute();
```

### useFlowParallel(flows, strategy?)

Execute multiple flows in parallel.

```typescript
import { useFlowParallel } from "@asyncflowstate/vue";

const parallel = useFlowParallel(
  { users: usersFlow, posts: postsFlow },
  "allSettled",
);

await parallel.execute();
```

### useFlowList(action, options?)

Manage multiple keyed flow instances.

```typescript
import { useFlowList } from "@asyncflowstate/vue";

const list = useFlowList(async (id: string) => api.deleteItem(id));
list.execute("item-1", "item-1");
list.getStatus("item-1"); // { status: 'loading', ... }
```

### useInfiniteFlow(action, options)

Paginated/infinite scrolling data fetching.

```typescript
import { useInfiniteFlow } from "@asyncflowstate/vue";

const infinite = useInfiniteFlow(async (cursor) => api.getPostsPage(cursor), {
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  initialPageParam: undefined,
});

await infinite.fetchNextPage();
```

## Provider

### provideFlowConfig(config)

Provides global flow configuration to all child components via Vue's provide/inject.

```typescript
provideFlowConfig({
  onError: (err) => toast.error(err.message),
  retry: { maxAttempts: 3, backoff: "exponential" },
  loading: { minDuration: 300 },
});
```

## Types

```typescript
import type {
  VueFlowOptions,
  VueFlowProviderConfig,
  VueFormHelperOptions,
  VueInfiniteFlowOptions,
} from "@asyncflowstate/vue";
```
