# Global Undo (Purgatory) <i class="fa-solid fa-sparkles text-amber-500"></i>

<PurgatoryAnimation />

Purgatory is a high-end UX pattern that holds an action in suspension for a configured duration before actually executing it. This gives the user a window of time to **undo** destructive actions (like deleting a resource or sending an email) before they ever hit the server.

## Quick Start

Enable Purgatory by configuring the `purgatory` option.

```ts
import { useFlow } from '@asyncflowstate/react';

const { loading, triggerUndo } = useFlow(deleteUserAccount, {
  purgatory: {
    duration: 5000, // Wait 5 seconds before hitting the API
    showPending: true, // Keep loading state true during purgatory
  },
  onSuccess: () => toast.success('Account deleted!'),
});
```

```tsx
<button onClick={() => triggerUndo()} disabled={!loading}>
  Undo Deletion
</button>
```

## How It Works

1. User clicks the trigger. The flow enters the `loading` state immediately.
2. The action is held in an internal timer for the specified `duration`.
3. If the user calls `triggerUndo()` (or `flow.triggerUndo()`), the action is cancelled gracefully. The flow resets to `idle` without firing an API request, and without throwing an error.
4. If the timer elapses naturally, the backend request fires normally.
