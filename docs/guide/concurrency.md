# Concurrency Control

<ConcurrencyAnimation />

Concurrency control determines what happens when `execute()` is called while a flow is already loading.

## Strategies

### `"keep"` (Default)

**Ignores** the new call while the current one is in progress. This prevents double submissions.

```ts
const flow = useFlow(saveData, {
  concurrency: "keep",
});

await flow.execute(data1); // Starts
flow.execute(data2); // Ignored — first call is still running
```

**Best for:** Form submissions, payments, delete operations.

### `"restart"`

**Cancels** the current execution and starts a new one. The previous result is discarded.

```ts
const flow = useFlow(search, {
  concurrency: "restart",
});

flow.execute("react"); // Starts search for "react"
flow.execute("react nav"); // Cancels previous, starts new search
```

**Best for:** Search, autocomplete, filtering.

### `"enqueue"`

**Queues** the new call to execute after the current one completes.

```ts
const flow = useFlow(processItem, {
  concurrency: "enqueue",
});

flow.execute(item1); // Starts immediately
flow.execute(item2); // Waits for item1 to finish
flow.execute(item3); // Waits for item2 to finish
```

**Best for:** File uploads, batch processing, ordered operations.

## Debounce

Delay execution until the user stops triggering it:

```ts
const flow = useFlow(search, {
  debounce: 300, // Wait 300ms after last call
});

// User types "r", "re", "rea", "reac", "react"
// Only searches for "react" after 300ms of no typing
```

## Throttle

Limit execution to once per time window:

```ts
const flow = useFlow(trackScroll, {
  throttle: 200, // At most once every 200ms
});

// Scroll event fires 60 times/sec
// trackScroll only executes 5 times/sec
```

## Combining Strategies

```ts
const flow = useFlow(autoSave, {
  concurrency: "restart",
  debounce: 1000,
  onSuccess: () => setLastSaved(new Date()),
});

// User types → debounced → if previous save is running, restart it
```
