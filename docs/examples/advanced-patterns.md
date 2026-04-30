# Advanced Patterns <i class="fa-solid fa-sparkles text-amber-500"></i>

This section showcases the premium features of AsyncFlowState 3.0 in real-world scenarios.

## 1. Purgatory (Global Undo)

The "Delete User" pattern is a classic use-case for Purgatory. Instead of confirming via a popup, you trigger a "pending" state that delays the actual destructive request.

<PurgatoryAnimation />

```tsx
const { loading, triggerUndo } = useFlow(deleteUser, {
  purgatory: { duration: 5000 },
});

return (
  <div>
    <button onClick={deleteUser} disabled={loading}>
      Delete Account
    </button>
    {loading && (
      <div className="undo-toast">
        Deleting in 5 seconds...
        <button onClick={triggerUndo}>UNDO</button>
      </div>
    )}
  </div>
);
```

---

## 2. Dead Letter Queue Dashboard

Failed critical actions shouldn't just "disappear." Use the Dead Letter Queue to build an admin interface for replaying failed requests (e.g. failed payment log).

<DLQAnimation />

```ts
import { DeadLetterQueue } from '@asyncflowstate/core';

function FailureDashboard() {
  const dlq = DeadLetterQueue.getInstance();
  const [entries, setEntries] = useState(dlq.getAll());

  useEffect(() => {
    return dlq.subscribe(setEntries);
  }, []);

  return (
    <div>
      {entries.map(err => (
        <div key={err.id}>
          <span>{err.error}</span>
          <button onClick={() => dlq.replay(err.id)}>Retry Now</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 3. Ghost Workflows (Silent Sync)

Ghost workflows are perfect for background "Likes" or "Save Draft" patterns where showing a spinner would be obstructive.

<GhostAnimation />

```ts
const { execute } = useFlow(likePost, {
  ghost: { enabled: true, strategy: "queue" },
});

// User can spam this button 20 times!
// UI stays at 60fps, requests happen silently in order.
const onLike = () => execute(postId);
```

---

## 4. Web Worker Offloading

Offload heavy computations (like image processing or large data filters) to a background thread to keep the main event loop free.

<WorkerAnimation />

```ts
const imageFlow = useFlow(generateThumbnail);

// The actual thumbnail generation happens in a separate Worker thread
// No UI jank during the process!
const handleUpload = (file) => imageFlow.worker(file);
```

---

## 5. Composition (Smart Pipes)

Stitch together multiple reliable steps into a single reusable workflow.

<CompositionAnimation />

```ts
import { pipe } from "@asyncflowstate/core";

// Create a complex workflow from simple atoms
const checkoutFlow = pipe(
  validateInventory,
  processPayment,
  sendConfirmationEmail,
);

// Executing checkoutFlow ensures all steps run in order
// with consistent error handling and loading states.
await checkoutFlow.execute(orderData);
```
