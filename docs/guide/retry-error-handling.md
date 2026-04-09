# Retry & Error Handling

<RetryAnimation />

AsyncFlowState provides a robust retry system with multiple backoff strategies and fine-grained control.

## Basic Retry

```ts
const flow = useFlow(fetchData, {
  retry: {
    maxAttempts: 3,
  },
});
```

This will attempt the action up to 3 times, with a default 1-second delay between attempts.

## Backoff Strategies

### Fixed (Default)

Same delay between every retry attempt.

```ts
retry: { maxAttempts: 3, delay: 1000, backoff: "fixed" }
// Attempt 1 → wait 1s → Attempt 2 → wait 1s → Attempt 3
```

### Linear

Delay increases linearly with each attempt.

```ts
retry: { maxAttempts: 3, delay: 1000, backoff: "linear" }
// Attempt 1 → wait 1s → Attempt 2 → wait 2s → Attempt 3
```

### Exponential

Delay doubles with each attempt. Ideal for transient server errors.

```ts
retry: { maxAttempts: 3, delay: 1000, backoff: "exponential" }
// Attempt 1 → wait 1s → Attempt 2 → wait 2s → Attempt 3 → wait 4s → Attempt 4
```

## Conditional Retry

Use `shouldRetry` to control which errors trigger a retry:

```ts
const flow = useFlow(apiCall, {
  retry: {
    maxAttempts: 3,
    backoff: "exponential",
    shouldRetry: (error, attempt) => {
      // Don't retry client errors (4xx)
      if (error.status >= 400 && error.status < 500) return false;

      // Don't retry after 3 attempts
      if (attempt >= 3) return false;

      // Retry server errors (5xx) and network failures
      return true;
    },
  },
});
```

## Error Handling

### Local Error Handling

```tsx
const flow = useFlow(saveData, {
  onError: (error) => {
    console.error("Save failed:", error);
    toast.error(error.message);
  },
});
```

### Global Error Handling

```tsx
<FlowProvider
  config={{
    onError: (error) => {
      // Report to error tracking service
      Sentry.captureException(error);
      toast.error("Something went wrong. Please try again.");
    },
  }}
>
```

### Error Display

```tsx
function SaveButton() {
  const flow = useFlow(saveData);

  return (
    <div>
      <button {...flow.button()}>Save</button>

      {flow.error && (
        <div ref={flow.errorRef} role="alert" className="error-message">
          <strong>Error:</strong> {flow.error.message}
          <button onClick={() => flow.execute(lastData)}>Retry</button>
        </div>
      )}
    </div>
  );
}
```

::: tip Error Focus
`flow.errorRef` automatically focuses the error element when it appears, making it accessible for screen readers and keyboard navigation.
:::

## Typed Errors

Use `createFlowError` for consistent, typed error handling:

```ts
import { createFlowError } from "@asyncflowstate/core";

throw createFlowError("VALIDATION_FAILED", {
  message: "Email is already taken",
  status: 409,
  fields: { email: "This email is already registered" },
});
```

## Manual Retry

Users can manually retry a failed action:

```tsx
{
  flow.error && (
    <button onClick={() => flow.retry()}>
      Try Again ({flow.retryCount}/{flow.maxAttempts})
    </button>
  );
}
```
