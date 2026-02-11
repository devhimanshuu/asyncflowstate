# React Package - API Reference & Usage Guide

## Overview

`@asyncflowstate/react` provides declarative React hooks and components for managing async operations, loading states, and error handling.

## Quick Start

```typescript
import { useFlow } from "@asyncflowstate/react";

function MyComponent() {
  const { state, data, error, start } = useFlow(async () => {
    const res = await fetch("/api/data");
    return res.json();
  });

  return (
    <div>
      {state === "pending" && <p>Loading...</p>}
      {state === "error" && <p>Error: {error?.message}</p>}
      {state === "success" && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={start}>Fetch Data</button>
    </div>
  );
}
```

## Hooks API

### useFlow()

Manages a single async operation.

```typescript
const {
  state, // 'idle' | 'pending' | 'success' | 'error'
  data, // The result of successful execution
  error, // Error object if failed
  start, // Function to start the flow
  cancel, // Function to cancel the flow
  reset, // Function to reset to idle
  isPending, // Boolean shorthand
  isError, // Boolean shorthand
  isSuccess, // Boolean shorthand
} = useFlow(executor, options);
```

### useFlowParallel()

Executes multiple async operations concurrently.

```typescript
const { data, error, start } = useFlowParallel([
  async () => fetchUsers(),
  async () => fetchPosts(),
  async () => fetchComments(),
]);
```

### useFlowSequence()

Executes async operations sequentially with chaining.

```typescript
const { data, error, start } = useFlowSequence([
  async () => fetchUser(id),
  async (user) => fetchUserPosts(user.id),
]);
```

### useFlowList()

Manages a list of items with async operations.

```typescript
const {
  items, // Array of items
  add, // Add new items
  update, // Update items
  remove, // Remove items
  state, // Overall list state
  itemStates, // State for each item
} = useFlowList(initialItems, asyncOperation);
```

### useInfiniteFlow()

Handles infinite scrolling and pagination.

```typescript
const {
  data, // All loaded pages
  hasMore, // More data available?
  loadMore, // Load next page
  isLoading, // Currently loading?
} = useInfiniteFlow(async (page) => fetchPage(page), { pageSize: 20 });
```

### useFlowSuspense()

React Suspense integration for async states.

```typescript
const { data } = useFlowSuspense(
  async () => fetchData(),
  { suspense: true }
);

// Use in Suspense boundary
<Suspense fallback={<Loading />}>
  <YourComponent />
</Suspense>
```

## Components API

### FlowProvider

Context provider for global flow management.

```typescript
<FlowProvider options={{ debug: true }}>
  <App />
</FlowProvider>
```

### FlowNotificationProvider

Toast notifications for flow states.

```typescript
<FlowNotificationProvider
  position="top-right"
  autoHideDuration={3000}
>
  <App />
</FlowNotificationProvider>
```

### FlowDebugger

Development tool for inspecting flows.

```typescript
<FlowDebugger
  enabled={process.env.NODE_ENV === "development"}
/>
```

### ProgressiveFlow

Progressive rendering component.

```typescript
<ProgressiveFlow
  fallback={<Skeleton />}
  loading={<LoadingUI />}
  error={<ErrorUI error={error} />}
>
  <Content data={data} />
</ProgressiveFlow>
```

## Common Patterns

### Form Submission

```typescript
const { start, state, error } = useFlow(
  async (formData) => {
    const res = await fetch("/api/submit", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    return res.json();
  }
);

return (
  <form onSubmit={(e) => {
    e.preventDefault();
    start(new FormData(e.currentTarget));
  }}>
    {/* Form fields */}
    <button disabled={state === "pending"}>
      {state === "pending" ? "Submitting..." : "Submit"}
    </button>
    {error && <span className="error">{error.message}</span>}
  </form>
);
```

### Infinite Scrolling

```typescript
const { data, loadMore, isLoading, hasMore } = useInfiniteFlow(
  async (page) => {
    const res = await fetch(`/api/items?page=${page}`);
    return res.json();
  }
);

return (
  <IntersectionObserver onVisible={() => hasMore && loadMore()}>
    {data.map(item => <Item key={item.id} {...item} />)}
    {isLoading && <Loading />}
  </IntersectionObserver>
);
```

### Loading Skeleton

```typescript
const { state, data } = useFlow(fetcher);

if (state === "pending") return <Skeleton />;
if (state === "error") return <ErrorBoundary />;
return <Content data={data} />;
```

## Accessibility

All components support:

- ARIA labels and descriptions
- Keyboard navigation
- Screen reader announcements
- Focus management
- Semantic HTML

```typescript
<button
  aria-label="Fetch user data"
  aria-busy={state === "pending"}
  aria-disabled={state === "pending"}
>
  Load
</button>
```

## Types

```typescript
import type {
  UseFlowResult,
  UseFlowOptions,
  FlowProviderProps,
  FlowNotificationProps,
} from "@asyncflowstate/react";
```

## See Also

- [Full Documentation](../../documentation/)
- [React Examples](../../examples/react/)
- [Contributing Guide](../../CONTRIBUTING.md)
