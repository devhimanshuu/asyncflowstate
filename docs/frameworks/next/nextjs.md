# <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" style="width: 42px; height: 42px; display: inline-block; margin-right: 12px; vertical-align: middle;" class="dark:invert" alt="Next.js Logo" /> Next.js Integration

The `@asyncflowstate/next` package provides optimized support for Next.js Server Actions, App Router transitions, and SSR safety.

## Installation

```bash
npm install @asyncflowstate/next @asyncflowstate/core
```

## Why a Separate Package?

While `@asyncflowstate/react` works in Next.js client components, the `@asyncflowstate/next` package adds:

1. **Server Action Integration** — Automatic `FormData` handling and action transitions
2. **Transition Awareness** — Deep integration with `React.useTransition`
3. **SSR/Hydration Safety** — Avoids common hydration mismatches

## Server Action Integration (useServerActionFlow)

The `useServerActionFlow` hook is customized for Next.js. Wrap any Server Action and get declarative loading, error, and success states that properly integrate with `React.useTransition` behind the scenes.

### Example (Form Action)

```tsx
"use client";

import { useServerActionFlow } from "@asyncflowstate/next";
import { createUser } from "./actions";

export function RegistrationForm() {
  const { execute, loading, error } = useServerActionFlow(createUser, {
    onSuccess: () => router.push("/dashboard"),
  });

  return (
    <form action={execute}>
      <input name="email" type="email" required />
      <button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Sign Up"}
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
```

### Example (Manual Execution)

```tsx
const { execute } = useServerActionFlow(deleteUser);

const handleDelete = async (id: string) => {
  if (confirm("Are you sure?")) {
    await execute(id);
  }
};
```

## Optimistic UI in Next.js

Provide instant feedback to users while the Server Action executes in the background. If the request fails, AsyncFlowState will automatically rollback the state to its original form.

### Example

```tsx
const [optimisticStatus, setOptimisticStatus] = useState(initialStatus);

const { execute } = useServerActionFlow(updateStatusAction, {
  onStart: ([newStatus]) => setOptimisticStatus(newStatus),
  onError: () => setOptimisticStatus(initialStatus), // Rollback
});
```

## Global Configuration

Just like standard React, you can define your defaults using a layout provider, optimizing Server Action settings like retry backoffs globally.

### Example

```tsx
// app/layout.tsx
import { FlowProvider } from "@asyncflowstate/next";

export default function RootLayout({ children }) {
  return (
    <FlowProvider
      config={{
        loading: { minDuration: 400 },
        retry: { maxAttempts: 2 },
      }}
    >
      {children}
    </FlowProvider>
  );
}
```

## Best Practices

Building for the App Router requires a shift in how you think about async state. Use these patterns to master Server Action orchestration.

### <i class="fa-solid fa-server text-brand-1 mr-2"></i> Server Action Orchestration

::: tip Preferred: `useServerActionFlow`
Avoid calling Server Actions directly in `onClick` handlers. Wrapping them in `useServerActionFlow` ensures you get automatic transition handling, preventing "blocking" UI states and providing built-in pending indicators.
:::

::: warning Hydration Awareness
If you are passing server-side data as the `initialData` to a flow, ensure your client component is not rendering until after the first paint to avoid hydration mismatches, or use a `key` that combines ID and version.
:::

### <i class="fa-solid fa-wind text-cyan-500 mr-2"></i> Streaming & Suspense

::: info Integrating with Suspense
While AsyncFlowState handles component-level loading, use Next.js `Suspense` and `loading.tsx` for page-level transitions. `useServerActionFlow` works flawlessly alongside them, providing the "micro-feedback" needed for button-specific states.
:::

### <i class="fa-solid fa-code-merge text-purple-400 mr-2"></i> Data Integrity

::: tip Idempotency & Retries
Retrying a Server Action can be dangerous if the action is not idempotent (e.g., charging a card twice). By default, AsyncFlowState disables retries for flows that appear to be mutations. Explicitly enable them only where safe.
:::

::: info Validation Synergy
Don't duplicate logic. Let your Zod schemas drive both server-side validation (in the Action) and client-side feedback (via `flow.form({ schema })`). This ensures a "single source of truth" for your data model.
:::
