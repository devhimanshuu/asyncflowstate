# Next.js Package - API Reference & Usage Guide

## Overview

`@asyncflowstate/next` provides Next.js-specific hooks and utilities for integrating AsyncFlowState with Server Actions, React Transitions, and the App Router.

## Quick Start

### Using Server Actions

```typescript
"use server";

export async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}
```

```typescript
"use client"

import { useServerActionFlow } from "@asyncflowstate/next";
import { fetchUserData } from "./actions";

export function UserProfile({ userId }: { userId: string }) {
  const { state, data, error, execute } = useServerActionFlow(
    fetchUserData
  );

  return (
    <div>
      <button onClick={() => execute(userId)}>
        {state === "pending" ? "Loading..." : "Load User"}
      </button>
      {state === "error" && <p>Error: {error?.message}</p>}
      {state === "success" && <p>User: {data?.name}</p>}
    </div>
  );
}
```

## Hooks API

### useServerActionFlow()

Manages Server Action execution with automatic state management.

```typescript
const {
  state, // 'idle' | 'pending' | 'success' | 'error'
  data, // Server Action return value
  error, // Error object if failed
  execute, // Function to execute the action
  isPending, // Boolean: is currently executing?
  isError, // Boolean: did error occur?
  isSuccess, // Boolean: was successful?
} = useServerActionFlow(serverAction, options);
```

#### Options

```typescript
interface UseServerActionFlowOptions {
  // Callback when action succeeds
  onSuccess?: (data: any) => void;

  // Callback when action fails
  onError?: (error: Error) => void;

  // Retry configuration
  retry?: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: "linear" | "exponential";
  };

  // Cache results
  cache?: {
    enabled: boolean;
    ttlMs: number;
  };
}
```

### useTransitionFlow()

Wraps React's `useTransition` for better async state management.

```typescript
const {
  state, // Current transition state
  isPending, // Is transition pending?
  execute, // Execute transition
} = useTransitionFlow();

const handleClick = () => {
  execute(async () => {
    await someServerAction();
  });
};
```

## Advanced Features

### Form Integration with Server Actions

```typescript
"use client"

import { useServerActionFlow } from "@asyncflowstate/next";

export function SubmitForm({ action }: { action: Function }) {
  const { state, execute, error } = useServerActionFlow(action);

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await execute(formData);
      console.log("Success:", result);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <form action={handleSubmit}>
      <input type="text" name="email" required />
      <button type="submit" disabled={state === "pending"}>
        {state === "pending" ? "Submitting..." : "Submit"}
      </button>
      {error && <span className="error">{error.message}</span>}
    </form>
  );
}
```

### Optimistic Updates

```typescript
"use client"

import { useTransitionFlow } from "@asyncflowstate/next";
import { updateUserAction } from "./actions";

export function UserSettings() {
  const { execute, isPending } = useTransitionFlow();
  const [optimisticName, setOptimisticName] = useState(user.name);

  const handleUpdate = (newName: string) => {
    setOptimisticName(newName); // Optimistic update

    execute(async () => {
      try {
        const result = await updateUserAction(newName);
      } catch {
        setOptimisticName(user.name); // Revert on error
      }
    });
  };

  return (
    <input
      value={optimisticName}
      onChange={(e) => handleUpdate(e.target.value)}
      disabled={isPending}
    />
  );
}
```

### Error Handling with Retry

```typescript
const { state, data, error, execute } = useServerActionFlow(fetchDataAction, {
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
    backoff: "exponential",
  },
  onError: (error) => {
    // Custom error handling
    console.error("Action failed after retries:", error);
  },
});
```

### Caching Results

```typescript
const { execute, data } = useServerActionFlow(expensiveQuery, {
  cache: {
    enabled: true,
    ttlMs: 60000, // Cache for 1 minute
  },
});

// Subsequent calls with same args return cached result
await execute("userId123");
await execute("userId123"); // Returns cached data
```

## Server Actions Best Practices

### Type-Safe Server Actions

```typescript
"use server";

import { useServerActionFlow } from "@asyncflowstate/next";

type GetUserResponse = {
  id: string;
  name: string;
  email: string;
};

export async function getUser(id: string): Promise<GetUserResponse> {
  const user = await db.users.findById(id);
  return user;
}
```

### Validation

```typescript
"use server";

import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function updateUser(data: unknown) {
  const validated = userSchema.parse(data);
  // Process validated data
}
```

### Error Handling

```typescript
"use server";

export async function deleteItem(id: string) {
  try {
    const item = await db.items.findById(id);
    if (!item) {
      throw new Error("Item not found");
    }
    await db.items.delete(id);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete: ${error.message}`);
    }
    throw error;
  }
}
```

## Streaming Response

```typescript
"use server";

export async function* streamData(query: string) {
  for await (const chunk of getChatCompletionStream(query)) {
    yield chunk;
  }
}
```

## Middleware Integration

```typescript
// middleware.ts
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Protect server actions
  if (request.nextUrl.pathname.startsWith("/api/actions")) {
    const token = request.headers.get("authorization");
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }
  }
}
```

## Types

```typescript
import type {
  UseServerActionFlowResult,
  UseServerActionFlowOptions,
  UseTransitionFlowResult,
} from "@asyncflowstate/next";
```

## Performance Tips

1. **Memoize Server Actions**: Use `useCallback` to prevent unnecessary re-renders
2. **Leverage Caching**: Enable cache option for expensive queries
3. **Batch Operations**: Combine multiple operations when possible
4. **Progressive Enhancement**: Ensure forms work without JavaScript
5. **Error Boundaries**: Wrap components in error boundaries

## Debugging

Enable debug mode:

```typescript
const { execute, state } = useServerActionFlow(action, {
  debug: true, // Logs all state changes
});
```

## See Also

- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Full Documentation](../../documentation/)
- [Next.js Examples](../../examples/next/)
- [Contributing Guide](../../CONTRIBUTING.md)
