# <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" style="width: 42px; height: 42px; display: inline-block; margin-right: 12px; vertical-align: middle;" alt="React Logo" /> React Integration

The `@asyncflowstate/react` package provides hooks, helpers, and accessibility features tailored for React 18+.

## Installation

```bash
npm install @asyncflowstate/react @asyncflowstate/core
```

## Core Async Hook (useFlow)

The `useFlow` hook is the primary feature for managing async actions in React components. It replaces scattered `useState` boilerplate with a single, type-safe API that tracks loading, error, and success states automatically.

### Example

```tsx
import { useFlow } from "@asyncflowstate/react";

function DeleteButton({ itemId }) {
  const flow = useFlow(
    async (id: string) => {
      await api.deleteItem(id);
      return id;
    },
    {
      onSuccess: () => toast.success("Item deleted"),
      onError: (err) => toast.error(err.message),
      retry: { maxAttempts: 2 },
    },
  );

  return (
    <button {...flow.button()} onClick={() => flow.execute(itemId)}>
      {flow.loading ? "Deleting..." : "Delete"}
    </button>
  );
}
```

### Return Value

| Property         | Type                                          | Description                       |
| ---------------- | --------------------------------------------- | --------------------------------- |
| `status`         | `"idle" \| "loading" \| "success" \| "error"` | Current state                     |
| `loading`        | `boolean`                                     | Whether currently executing       |
| `data`           | `TOutput \| null`                             | Last successful result            |
| `error`          | `Error \| null`                               | Last error                        |
| `execute`        | `(...args) => Promise<TOutput>`               | Trigger the action                |
| `reset`          | `() => void`                                  | Reset to idle state               |
| `button`         | `() => ButtonProps`                           | Accessible button props           |
| `form`           | `(opts) => FormProps`                         | Form submission props             |
| `fieldErrors`    | `Record<string, string>`                      | Validation field errors           |
| `errorRef`       | `Ref`                                         | Auto-focus ref for error messages |
| `executionCount` | `number`                                      | How many times executed           |

## Accessible Button Helper

The `button()` helper automatically binds accessibility attributes (`aria-busy`, `aria-disabled`), disables the button during loading, and wires up the click handler. This ensures a polished, screen-reader-friendly UI with zero extra logic.

### Example

```tsx
<button {...flow.button()}>
  {flow.loading ? "Processing..." : "Submit"}
</button>

// Equivalent to:
<button
  onClick={() => flow.execute()}
  disabled={flow.loading}
  aria-busy={flow.loading}
  aria-disabled={flow.loading}
>
```

## Smart Form Handling

The `form()` helper integrates directly with Zod/Valibot schemas to provide automatic `FormData` extraction, submission prevention during loading, and field-level validation errors natively mapped from form submissions.

### Example

```tsx
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

function EditProfile() {
  const flow = useFlow(updateProfile);

  return (
    <form {...flow.form({ schema, extractFormData: true })}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" />
        {flow.fieldErrors.name && (
          <span className="error">{flow.fieldErrors.name}</span>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
        {flow.fieldErrors.email && (
          <span className="error">{flow.fieldErrors.email}</span>
        )}
      </div>

      <button type="submit" disabled={flow.loading}>
        {flow.loading ? "Saving..." : "Save Profile"}
      </button>

      {flow.error && (
        <p ref={flow.errorRef} role="alert">
          {flow.error.message}
        </p>
      )}
    </form>
  );
}
```

## Global Configuration Provider

The `FlowProvider` feature allows you to define application-wide defaults for retries, loading delays, and error handling. Local flows can override these settings or merge with them.

### Example

```tsx
import { FlowProvider } from "@asyncflowstate/react";

function App() {
  return (
    <FlowProvider
      config={{
        onError: (err) => {
          Sentry.captureException(err);
          toast.error(err.message);
        },
        retry: {
          maxAttempts: 3,
          backoff: "exponential",
        },
        loading: {
          minDuration: 400,
        },
      }}
    >
      <Routes />
    </FlowProvider>
  );
}
```

## Accessibility First

AsyncFlowState offers built-in features for standard ARIA live region announcements and auto-focusing on error elements, ensuring compliance and an intuitive experience for users relying on assistive technology.

### Example (LiveRegion Announcements)

```tsx
const flow = useFlow(saveData, {
  a11y: {
    announceSuccess: "Data saved successfully",
    announceError: (err) => `Error: ${err.message}`,
    liveRegionRel: "polite",
  },
});
```

### Example (Auto Error Focus)

The `flow.errorRef` automatically focuses the error message container when an execution fails, bringing the error immediately to the user's attention.

```tsx
{
  flow.error && (
    <div ref={flow.errorRef} role="alert" tabIndex={-1}>
      {flow.error.message}
    </div>
  );
}
```

## Sequential Workflows

Chain multiple async operations together sequentially. The `useFlowSequence` feature automatically passes the output of one step as the input to the next, while tracking progress through the sequence.

### Example

```tsx
import { useFlowSequence } from "@asyncflowstate/react";

const steps = [
  { name: "Validate", flow: validateFlow },
  { name: "Upload", flow: uploadFlow, mapInput: (prev) => prev.fileId },
  { name: "Notify", flow: notifyFlow, mapInput: (prev) => prev.url },
];

const sequence = useFlowSequence(steps);

<button onClick={() => sequence.execute(initialData)}>
  {sequence.loading
    ? `Step ${sequence.currentStep + 1}/${steps.length}...`
    : "Start Process"}
</button>;
```

## Parallel Processing

Execute multiple independent flows simultaneously while tracking an aggregated loading state and catching the first error encountered using `useFlowParallel`.

### Example

```tsx
import { useFlowParallel } from "@asyncflowstate/react";

const parallel = useFlowParallel([usersFlow, postsFlow, commentsFlow]);

// parallel.data — array of results
// parallel.error — first error encountered
```

## Best Practices

Building a professional async experience requires more than just catching errors. Follow these patterns to ensure your React applications feel fast, resilient, and accessible.

### <i class="fa-solid fa-gauge-high text-brand-1 mr-2"></i> User Experience (UX)

::: tip Rule of 400ms
Next JS or React actions can feel "jittery" if they return too quickly, causing a loading spinner to flash for just a few frames. Use `loading: { minDuration: 400 }` to ensure your UI feels stable and predictable.
:::

::: tip Optimistic UI First
For interactions like "Likes" or "Toggles", don't wait for the server. Use `onStart` to update your local state immediately, and use AsyncFlowState's automatic rollback features in `onError` if the request fails.
:::

### <i class="fa-solid fa-shield-halved text-emerald-500 mr-2"></i> Resilience & Reliability

::: info Global vs Local Retries
Define common retry policies (e.g., 3 attempts on network error) in your `FlowProvider`. Only override them locally for destructive actions (like "Delete") where retries might be dangerous without idempotency.
:::

::: warning Avoid `useEffect` for Triggering
AsyncFlowState is designed for **event-driven** flows. Prefer triggering `execute()` inside user-initiated callbacks (like `handleSubmit`) instead of reacting to state changes in `useEffect`, which can lead to infinite loops.
:::

### <i class="fa-solid fa-universal-access text-purple-400 mr-2"></i> Accessibility (A11y)

::: info The `errorRef` is Non-Negotiable
Always attach `flow.errorRef` to your error message container. This ensures that when a server fails, the focus is immediately moved to the error announcement, allowing screen reader users to understand what went wrong without manual searching.
:::

::: tip Button States
The `flow.button()` helper handles `disabled` and `aria-busy`. Ensure your CSS provides a clear visual indicator for the `disabled` state to prevent users from spam-clicking during slow network requests.
:::
