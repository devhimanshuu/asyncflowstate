# @asyncflowstate/react

> React hooks and helpers for elegant, accessible async UI behavior management.

## Installation

```bash
npm install @asyncflowstate/react
# or
pnpm add @asyncflowstate/react
```

This package depends on `@asyncflowstate/core` which will be installed automatically.

## Quick Start

```tsx
import { useFlow } from "@asyncflowstate/react";

function SaveButton() {
  const flow = useFlow(async (data) => {
    return await api.save(data);
  });

  return (
    <button {...flow.button()}>
      {flow.loading ? "Saving..." : "Save Changes"}
    </button>
  );
}
```

## Global Configuration with FlowProvider

Use `FlowProvider` to set default options for all flows in your application. This is perfect for global error handling, retry policies, and UX settings.

```tsx
import { FlowProvider, useFlow } from "@asyncflowstate/react";

function App() {
  return (
    <FlowProvider
      config={{
        onError: (err) => toast.error(err.message),
        retry: { maxAttempts: 3, backoff: "exponential" },
        loading: { minDuration: 300 },
      }}
    >
      <YourApp />
    </FlowProvider>
  );
}

// All flows inside will inherit the global config
function YourApp() {
  const flow = useFlow(saveData); // Automatically has retry + error handling

  return <button {...flow.button()}>Save</button>;
}
```

### Benefits of FlowProvider

- **DRY Principle**: Define error handlers, retry logic, and UX settings once
- **Consistency**: Ensure all async actions behave the same way
- **Flexibility**: Local options can override global settings
- **Nested Providers**: Different sections can have different configurations

```tsx
<FlowProvider config={{ retry: { maxAttempts: 2 } }}>
  <MainApp />

  {/* Admin section needs more retries */}
  <FlowProvider config={{ retry: { maxAttempts: 5 } }}>
    <AdminPanel />
  </FlowProvider>
</FlowProvider>
```

See [FlowProvider examples](../../examples/react/flow-provider-examples.tsx) for more patterns.

## Core Helpers

### `button()`

Injects `disabled` and `aria-busy` props automatically based on the flow's loading state. If no `onClick` is provided, it defaults to calling `flow.execute()` with no arguments.

```tsx
<button {...flow.button({ onClick: () => alert("Custom!") })}>Submit</button>
```

### `form()`

Handles `onSubmit` with `e.preventDefault()` and provides advanced orchestration features:

- **`extractFormData`**: Automatically extracts form values into a plain object.
- **`validate`**: Hook for pre-execution validation.
- **`resetOnSuccess`**: Automatically resets the form fields after successful completion.

```tsx
<form
  {...flow.form({
    extractFormData: true,
    validate: (data) => (!data.title ? { title: "Required" } : null),
    resetOnSuccess: true,
  })}
>
  <input name="title" />
  {flow.fieldErrors.title && <span>{flow.fieldErrors.title}</span>}
  <button type="submit" disabled={flow.loading}>
    Save
  </button>
</form>
```

### `LiveRegion`

A component that automatically announces success and error messages to screen readers using ARIA live regions.

```tsx
const flow = useFlow(saveAction, {
  a11y: {
    announceSuccess: "Profile updated successfully!",
    announceError: (err) => `Failed to save: ${err.message}`,
  },
});

return (
  <div>
    <flow.LiveRegion />
    {/* ... form ... */}
  </div>
);
```

### `errorRef`

Automatically manages focus for error messages. When the flow enters an error state, the element with this ref will be focused for accessibility.

```tsx
{
  flow.error && (
    <div ref={flow.errorRef} tabIndex={-1} className="error-banner">
      {flow.error.message}
    </div>
  );
}
```

## Enhanced UX Options

### Loading Perception

Control how users perceive loading states to prevent UI flickering.

```tsx
const flow = useFlow(action, {
  loading: {
    minDuration: 500, // Stay loading for at least 500ms
    delay: 200, // Don't show loading if action finishes in <200ms
  },
});
```

### Progress Tracking

Track and display the progress of long-running operations.

```tsx
const flow = useFlow(async () => {
  flow.setProgress(20);
  // ... step 1 ...
  flow.setProgress(100);
});

return <progress value={flow.progress} max="100" />;
```

## Advanced Orchestration

### `useFlowSequence`

Run multiple flows in a specific order with aggregate state and progress.

```tsx
import { useFlowSequence } from "@asyncflowstate/react";

const sequence = useFlowSequence([
  { name: "Upload", flow: uploadFlow },
  { name: "Process", flow: processFlow, mapInput: (file) => file.id },
]);

return (
  <div>
    <button onClick={() => sequence.execute()}>Start</button>
    <p>Status: {sequence.status}</p>
    <p>Step: {sequence.currentStep?.name}</p>
    <progress value={sequence.progress} max="100" />
  </div>
);
```

### `useFlowParallel`

Monitor and control multiple flows running at the same time.

```tsx
import { useFlowParallel } from "@asyncflowstate/react";

const parallel = useFlowParallel({
  profile: profileFlow,
  settings: settingsFlow,
});

return (
  <div>
    <button onClick={() => parallel.execute()}>Refresh Dashboard</button>
    {parallel.loading && <p>Loading all components...</p>}
    <p>Overall Progress: {parallel.progress}%</p>
  </div>
);
```

### `useFlowList`

Manage multiple independent instances of the same action (e.g., list items).

```tsx
import { useFlowList } from "@asyncflowstate/react";

const list = useFlowList(deleteItem);

return items.map((item) => (
  <button
    key={item.id}
    disabled={list.getStatus(item.id).status === "loading"}
    onClick={() => list.execute(item.id, item.id)}
  >
    Delete
  </button>
));
```

## Monitoring & Notifications

### `FlowDebugger`

A drop-in component to visualize all async flow activity in real-time.

```tsx
import { FlowDebugger } from "@asyncflowstate/react";

function App() {
  return (
    <>
      <Main />
      <FlowDebugger />
    </>
  );
}
```

### `FlowNotificationProvider`

Catch success or error events from ANY flow globally.

```tsx
import { FlowNotificationProvider } from "@asyncflowstate/react";

<FlowNotificationProvider
  onSuccess={(e) => toast.success(`${e.flowName} completed!`)}
  onError={(e) => toast.error(`${e.flowName} failed: ${e.state.error.message}`)}
>
  <App />
</FlowNotificationProvider>;
```

## API Reference

### `useFlow<TData, TError, TArgs>(action, options?)`

#### Returns

```typescript
{
  // State
  status: 'idle' | 'loading' | 'success' | 'error';
  data: TData | null;
  error: TError | null;
  loading: boolean;      // Respects loading.delay
  progress: number;      // 0-100
  fieldErrors: Record<string, string>;

  // Actions
  execute: (...args: TArgs) => Promise<TData | undefined>;
  reset: () => void;
  cancel: () => void;
  setProgress: (val: number) => void;

  // Helpers & Components
  button: (props?) => ButtonHTMLAttributes;
  form: (props?) => FormHTMLAttributes;
  LiveRegion: React.ComponentType;
  errorRef: React.RefObject<any>;
}
```

## License

MIT © [AsyncFlowState Contributors](https://github.com/asyncflowstate/asyncflowstate)
