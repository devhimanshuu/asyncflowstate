# Smart Persistence (Stateful Resumption)

AsyncFlowState's **Smart Persistence** feature allows flows to survive page refreshes by persisting their state to `localStorage` or `sessionStorage`. This solves the "Fragile Web" problem where async state is lost on navigation or accidental refresh.

## The Problem

Consider these common scenarios:

1. **File Upload Interrupted**: User uploads an 80% complete file, accidentally refreshes the page, and loses all progress.
2. **Form Draft Lost**: User spends 10 minutes filling out a form, browser crashes, and all data is gone.
3. **Shopping Cart Cleared**: User adds items to cart, closes browser, and cart is empty on return.

## The Solution

Smart Persistence automatically serializes flow state to browser storage and restores it on page reload, including:

- <i class="fa-solid fa-check text-emerald-500"></i> **Success data** - Cached results available immediately
- <i class="fa-solid fa-check text-emerald-500"></i> **Loading states** - Resume interrupted operations
- <i class="fa-solid fa-check text-emerald-500"></i> **Progress tracking** - Continue from where you left off
- <i class="fa-solid fa-check text-emerald-500"></i> **Error states** - Retry failed operations
- <i class="fa-solid fa-check text-emerald-500"></i> **Execution arguments** - Resume with original parameters

---

## Basic Usage

### Simple Data Persistence

```ts
import { Flow } from "@asyncflowstate/core";

const flow = new Flow(
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
  {
    persist: {
      key: "user-profile",
      storage: "local", // or 'session'
    },
  },
);

// First execution
await flow.execute("user-123");

// On page reload, data is automatically restored
console.log(flow.data); // User data is immediately available!
```

---

## Resumable Operations

### File Upload with Progress Resumption

```ts
const flow = new Flow(
  async (file: File) => {
    const totalChunks = Math.ceil(file.size / (1024 * 1024));

    for (let i = 0; i < totalChunks; i++) {
      await uploadChunk(file, i);
      flow.setProgress(Math.round(((i + 1) / totalChunks) * 100));
    }

    return { fileId: file.name, uploadedAt: new Date() };
  },
  {
    persist: {
      key: `file-upload-${file.name}`,
      storage: "local",
      persistLoading: true, // KEY: Persist loading states
      ttl: 60 * 60 * 1000, // 1 hour

      // Called when interrupted loading is detected
      onInterruptedLoading: (state) => {
        const shouldResume = confirm(
          `Upload was interrupted at ${state.progress}%. Resume?`,
        );

        if (shouldResume) {
          flow.resume(); // Continue from where it left off
        } else {
          flow.reset(); // Start fresh
        }
      },
    },

    onSuccess: (result) => {
      console.log("Upload complete!", result);
    },
  },
);
```

---

## Configuration Options

### `persist` Object

| Option                 | Type                                     | Default          | Description                                        |
| ---------------------- | ---------------------------------------- | ---------------- | -------------------------------------------------- |
| `key`                  | `string`                                 | **required**     | Unique identifier for this flow's persisted state  |
| `storage`              | `'local' \| 'session'`                   | `'local'`        | Storage type (`localStorage` or `sessionStorage`)  |
| `persistLoading`       | `boolean`                                | `false`          | Whether to persist loading states (for resumption) |
| `persistError`         | `boolean`                                | `false`          | Whether to persist error states                    |
| `ttl`                  | `number`                                 | `86400000` (24h) | Time in ms after which persisted state is stale    |
| `onRestore`            | `(state) => boolean \| Promise<boolean>` | `undefined`      | Callback to validate/reject restoration            |
| `onInterruptedLoading` | `(state) => void`                        | `undefined`      | Callback when interrupted loading is detected      |

---

## Advanced Patterns

### 1. Form Draft Auto-Save

```ts
const draftFlow = new Flow(
  async (formData: { title: string; content: string }) => {
    const response = await fetch("/api/drafts", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    return response.json();
  },
  {
    persist: {
      key: "blog-post-draft",
      storage: "local",
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    debounce: 1000, // Auto-save after 1s of inactivity
  },
);

// On page load, check for draft
if (draftFlow.data) {
  populateForm(draftFlow.data);
}
```

### 2. Shopping Cart Persistence

```ts
const cartFlow = new Flow(
  async (items: CartItem[]) => {
    const response = await fetch("/api/cart", {
      method: "PUT",
      body: JSON.stringify({ items }),
    });
    return response.json();
  },
  {
    persist: {
      key: "shopping-cart",
      storage: "local",
    },
    optimisticResult: (prevData, [items]) => items,
  },
);

// Cart is automatically restored on page load
```

### 3. Background Sync Queue

```ts
const syncFlow = new Flow(
  async (operation: SyncOperation) => {
    const response = await fetch("/api/sync", {
      method: "POST",
      body: JSON.stringify(operation),
    });
    return response.json();
  },
  {
    persist: {
      key: "pending-sync",
      storage: "local",
      persistLoading: true,
      persistError: true,

      onInterruptedLoading: (state) => {
        // Automatically retry on page load
        console.log("Retrying pending sync...");
        syncFlow.resume();
      },
    },
    retry: {
      maxAttempts: 5,
      backoff: "exponential",
    },
  },
);
```

---

## Helper Utilities

### `generatePersistenceKey()`

Generate consistent persistence keys with optional scoping:

```ts
import { generatePersistenceKey } from "@asyncflowstate/core";

const key1 = generatePersistenceKey("user-profile");
// Result: "asyncflow:user-profile"

const key2 = generatePersistenceKey("file-upload", fileId);
// Result: "asyncflow:file-upload:abc123"
```

---

## Resume Method

The `resume()` method allows you to manually resume an interrupted flow:

```ts
// Resume with persisted args
await flow.resume();

// Resume with new args
await flow.resume(newFile);
```

---

## Best Practices

### 1. Use Unique Keys

```ts
// <i class="fa-solid fa-xmark text-red-500"></i> Bad: Generic key
persist: {
  key: "upload";
}

// <i class="fa-solid fa-check text-emerald-500"></i> Good: Specific key with ID
persist: {
  key: `upload-${fileId}`;
}
```

### 2. Set Appropriate TTL

```ts
// Session data: Short TTL
persist: {
  key: 'search-results',
  ttl: 5 * 60 * 1000 // 5 minutes
}

// User preferences: Long TTL
persist: {
  key: 'user-settings',
  ttl: 30 * 24 * 60 * 60 * 1000 // 30 days
}
```

### 3. Validate Before Restoring

```ts
persist: {
  key: 'form-data',
  onRestore: (state) => {
    // Only restore if data structure is valid
    return state.data && typeof state.data.email === 'string';
  }
}
```

### 4. Handle Interrupted Loading Gracefully

```ts
persist: {
  key: 'long-operation',
  persistLoading: true,
  onInterruptedLoading: (state) => {
    // Show UI to let user decide
    showResumeDialog({
      progress: state.progress,
      onResume: () => flow.resume(),
      onCancel: () => flow.reset()
    });
  }
}
```

---

## Storage Limits

Be aware of browser storage limits:

- **localStorage**: ~5-10MB per domain
- **sessionStorage**: ~5-10MB per domain (cleared on tab close)

For large data, consider:

- Storing only essential state
- Using compression
- Implementing cleanup strategies

---

## Security Considerations

1. **Don't persist sensitive data** (passwords, tokens)
2. **Validate restored data** to prevent injection attacks
3. **Use `sessionStorage`** for temporary data
4. **Implement TTL** to prevent stale data issues

---

## See Also

- [Core Flow API](../Core%20Engine/Flow%20Class.md)
- [Storage Utilities](../API%20Reference/Storage.md)
- [Persistence Examples](../../examples/basic/persistence-examples.ts)
