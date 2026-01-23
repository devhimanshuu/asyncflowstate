# AsyncFlowState Examples

This directory contains examples showing how to use AsyncFlowState in different scenarios.

## 📁 Directory Structure

```
examples/
├── basic/              # Core Flow class examples (no framework)
│   └── core-examples.ts
└── react/              # React hook examples
    └── react-examples.tsx
```

## 🎯 Quick Start

### Basic (Core)

```typescript
import { Flow } from "@asyncflowstate/core";

const flow = new Flow(async (data) => {
  const response = await fetch("/api/save", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
});

// Subscribe to state changes
flow.subscribe((state) => {
  console.log("Status:", state.status);
  console.log("Data:", state.data);
  console.log("Error:", state.error);
});

// Execute
await flow.execute({ name: "John" });
```

### React

```tsx
import { useFlow } from "@asyncflowstate/react";

function SaveButton() {
  const flow = useFlow(async () => {
    const response = await fetch("/api/save", { method: "POST" });
    return response.json();
  });

  return (
    <button {...flow.button()}>{flow.loading ? "Saving..." : "Save"}</button>
  );
}
```

- [Main README](../README.md)
- [TypeScript Types](../packages/core/src/flow.ts)

````

## 📖 Examples Overview

### Basic Examples (`basic/core-examples.ts`)

1. **Simple Async Action** - Basic usage with subscribe
2. **Retry Logic** - Automatic retries with backoff
3. **Optimistic UI** - Instant feedback before server response
4. **Prevent Double Submission** - Ignore rapid clicks
5. **Cancellation** - Cancel ongoing requests
6. **Auto Reset** - Reset to idle after success

### React Examples (`react/react-examples.tsx`)

1. **Login Form** - Form with error handling
2. **Like Button** - Optimistic UI pattern
3. **Delete with Confirmation** - Stateful deletion
4. **Profile Form** - Form with button helper
5. **Search with Debounce** - Debounced input
6. **File Upload** - File handling
7. **Data Fetcher** - Fetch with retry

## 🔧 Running Examples

### Core Examples

```bash
# Compile and run
npx ts-node examples/basic/core-examples.ts
````

### React Examples

The React examples are meant to be imported into your React application:

```tsx
import { LoginForm, LikeButton } from "./examples/react/react-examples";

function App() {
  return <LoginForm />;
}
```

## 💡 Common Patterns

### Loading State

```tsx
const flow = useFlow(fetchData);

if (flow.loading) return <Spinner />;
if (flow.error) return <Error error={flow.error} />;
if (flow.data) return <Content data={flow.data} />;
```

### Optimistic Update

```tsx
const flow = useFlow(likePost, {
  optimisticResult: { ...post, likes: post.likes + 1 },
});
```

### Retry on Error

```tsx
const flow = useFlow(fetchData, {
  retry: {
    maxAttempts: 3,
    delay: 1000,
    backoff: "exponential",
  },
});
```

### Auto-Reset Success State

```tsx
const flow = useFlow(saveData, {
  autoReset: {
    enabled: true,
    delay: 3000, // Reset after 3 seconds
  },
});
```

### Prevent Double Clicks

```tsx
const flow = useFlow(submitForm, {
  concurrency: "keep", // Ignore new requests while loading
});
```

## 📚 More Resources

- [Main README](../README.md)
- [Core API Reference](../packages/core/README.md)
- [React API Reference](../packages/react/README.md)
- [TypeScript Types](../packages/core/src/flow.ts)
