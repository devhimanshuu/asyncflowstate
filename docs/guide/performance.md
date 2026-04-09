# Performance

<PerformanceAnimation />

Best practices for optimal performance with AsyncFlowState.

## Bundle Size

AsyncFlowState is designed to be lightweight:

| Package | Size (gzipped) |
|---------|----------------|
| `@asyncflowstate/core` | ~3 KB |
| `@asyncflowstate/react` | ~2 KB |
| `@asyncflowstate/vue` | ~1.5 KB |
| `@asyncflowstate/svelte` | ~1 KB |

All packages are **tree-shakeable** — unused exports are eliminated by your bundler.

## Minimizing Re-renders

### React

`useFlow` uses fine-grained subscriptions. Components only re-render when the state properties they read actually change.

```tsx
// <i class="fa-solid fa-check"></i> Good — only re-renders when `loading` changes
function SaveButton() {
  const { loading, button } = useFlow(saveData);
  return <button {...button()}>{loading ? "..." : "Save"}</button>;
}
```

### Avoid Creating Flows in Render

```tsx
// <i class="fa-solid fa-xmark"></i> Bad — creates a new Flow instance every render
function Component() {
  const flow = useFlow(async () => await fetch(url));
}

// <i class="fa-solid fa-check"></i> Good — stable function reference
const fetchData = async () => await fetch(url);
function Component() {
  const flow = useFlow(fetchData);
}
```

## Loading UX Performance

### Prevent Loading Flashes

When an API responds in under 100ms, showing and hiding a spinner causes a jarring flash. Use `minDuration`:

```ts
const flow = useFlow(fastApi, {
  loading: { minDuration: 400 },
});
// Loading state lasts at least 400ms, even if API responds in 50ms
```

### Delay Loading Indicators

For actions that are usually instant, don't show a spinner unless it's actually slow:

```ts
const flow = useFlow(quickSave, {
  loading: { delay: 200 },
});
// Loading state only becomes true after 200ms
// If the action completes before 200ms, no spinner appears
```

## Concurrency Best Practices

| Pattern | Strategy | Why |
|---------|----------|-----|
| Form submit | `"keep"` | Prevent duplicate submissions |
| Search input | `"restart"` | Cancel stale results |
| File upload | `"enqueue"` | Process in order |
| Data refresh | `"restart"` | Always use latest data |

## Retry Performance

Choose the right backoff strategy:

| Strategy | Server Load | User Wait | Use Case |
|----------|-------------|-----------|----------|
| `"fixed"` | Consistent | Predictable | Known recovery time |
| `"linear"` | Decreasing | Growing | Moderate backoff |
| `"exponential"` | Minimal | Can be long | Third-party APIs, rate limits |

::: tip Production Config
```ts
// Recommended production defaults
{
  loading: { minDuration: 400 },
  retry: { maxAttempts: 3, backoff: "exponential", delay: 1000 },
  concurrency: "keep",
}
```
:::
