# Next.js Integration

<cite>
**Referenced Files in This Document**
- [packages/next/package.json](file://packages/next/package.json)
- [packages/next/src/useServerActionFlow.ts](file://packages/next/src/useServerActionFlow.ts)
- [examples/next/server-actions-example.tsx](file://examples/next/server-actions-example.tsx)
</cite>

AsyncFlowState provides a dedicated package `@asyncflowstate/next` designed to streamline async behavior in Next.js applications. It specifically focuses on **Server Actions**, **App Router transitions**, and maintaining consistent UI states across server-client boundaries.

## Installation

```bash
pnpm add @asyncflowstate/next @asyncflowstate/react @asyncflowstate/core
```

## Why a separate package?

While `@asyncflowstate/react` works in Next.js client components, the `@asyncflowstate/next` package adds specific optimizations for Next.js patterns:

1.  **Server Action Integration**: Automatic handling of `FormData` and action transitions.
2.  **Transition Awareness**: Deep integration with `React.useTransition` for smoother navigation states.
3.  **SSR/Hydration Safety**: Engineered to avoid common hydration mismatches when managing async flags.

---

## Server Action Flows

The core of the Next.js integration is the `useServerActionFlow` hook. It allows you to wrap any Server Action and get declarative loading, error, and success states.

### Basic Form Action

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

### Manual Execution

You don't have to use it with the `action` prop. You can also trigger it manually from event handlers:

```tsx
const { execute } = useServerActionFlow(deleteUser);

const handleDelete = async (id: string) => {
  if (confirm("Are you sure?")) {
    await execute(id);
  }
};
```

---

## Optimistic UI in Next.js

Next.js often requires manual state management for complex optimistic updates. Combining `useServerActionFlow` with local state allows for robust "rollback-on-failure" patterns.

```tsx
const [optimisticStatus, setOptimisticStatus] = useState(initialStatus);

const { execute } = useServerActionFlow(updateStatusAction, {
  onStart: ([newStatus]) => setOptimisticStatus(newStatus),
  onError: () => setOptimisticStatus(initialStatus), // Rollback
});
```

---

## Advanced: Global Configuration

Since `@asyncflowstate/next` depends on `@asyncflowstate/react`, you can use the same `FlowProvider` to set global defaults for all your server action flows.

```tsx
// app/layout.tsx
import { FlowProvider } from "@asyncflowstate/react";

export default function RootLayout({ children }) {
  return (
    <FlowProvider
      config={{
        loading: { minDuration: 400 }, // Prevent loading flashes
        retry: { maxAttempts: 2 },
      }}
    >
      {children}
    </FlowProvider>
  );
}
```

---

## Best Practices

1.  **Use `minDuration`**: Next.js Server Actions can be very fast on high-speed networks. Use `loading: { minDuration: 500 }` to ensure the loading state is visible enough to be meaningful.
2.  **Combine with `useFormState`**: While `useServerActionFlow` handles the behavior and loading state, for complex server-side validation messages, you can use it alongside Next.js's built-in `useFormState`.
3.  **Error Boundaries**: While `useServerActionFlow` catches errors for UI display, critical failures should still be handled by Next.js `error.tsx` boundaries.

---

## See Also

- [useFlow Hook Documentation](./React%20Integration/useFlow%20Hook%20API.md)
- [Form Helpers](./React%20Integration/Form%20Integration%20Helpers.md)
- [Core Architecture](../Core%20Engine/Architecture.md)
