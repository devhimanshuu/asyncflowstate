# The Purgatory Pattern

Implement a robust "Global Undo" feature by delaying server requests and allowing users to "rescind" actions.

---

The **Purgatory** pattern (or "The Grace Period") is a sophisticated UX strategy where an action is optimistically applied to the UI, but the server request is held in "limbo" for a few seconds. If the user hits "Undo" during this time, the request is canceled entirely.

## Why "Purgatory"?

Modern users expect to be able to undo "soft" actions like:
*   **Archiving** an email.
*   **Deleting** a message.
*   **Updating** a profile setting.

Waiting for a confirmation dialog is annoying. Purgatory solves this by letting the user "archive" instantly, but giving them a 5-second window to change their mind.

## 1. Creating an Undoable Action

Using `useFlow`'s `purgatory` configuration, you can implement this in a single line.

```tsx
import { useFlow } from "@asyncflowstate/react";

function ArchiveButton({ itemId }) {
  const [isArchived, setIsArchived] = useState(false);

  const flow = useFlow(archiveItem, {
    // 1. Move the action to "Purgatory" for 5 seconds
    purgatory: {
      duration: 5000, // 5 seconds grace period
    },
    
    // 2. Update the UI instantly
    onStart: () => setIsArchived(true),
    
    // 3. Rollback if the user hits "Undo" OR server fails
    onRescind: () => {
        setIsArchived(false);
        toast.info("Action canceled");
    },
    
    onError: () => {
        setIsArchived(false);
        toast.error("Failed to archive");
    }
  });

  return (
    <>
      <button 
        onClick={() => flow.execute(itemId)}
        className={isArchived ? "hidden" : "visible"}
      >
        <i class="fa-solid fa-box-archive"></i> Archive
      </button>

      {flow.inPurgatory && (
        <div className="undo-toast">
            Item archived! 
            <button onClick={() => flow.rescind()}>Undo</button>
            <ProgressBar duration={5000} />
        </div>
      )}
    </>
  );
}
```

### <i class="fa-solid fa-circle-check text-emerald-500"></i> What's happening?
*   **`flow.execute()`**: Instantly calls `onStart` and moves the item into a "limbo" state.
*   **`flow.inPurgatory`**: Becomes true for the duration specified.
*   **`flow.rescind()`**: If called while `inPurgatory` is true, it cancels the timer and never calls the server.
*   **Automatic Commit**: If the timer expires without `rescind()` being called, the server function is automatically executed.

---

## 2. Advanced: Persistent Purgatory

What if the user refreshes the page while the 5-second timer is running? By default, the action would be lost. You can enable **Smart Persistence** to ensure the commit happens even across refreshes.

```tsx {4-6}
const flow = useFlow(archiveItem, {
  purgatory: {
    duration: 5000,
    persistence: "localStorage", // action will persist until commit or rescind
    key: `archive-${itemId}`
  }
});
```

## 3. Best Practices for Undo UX

*   **Visibility**: Always show a clear "Undo" button and a visual representation of the remaining time (like a progress bar).
*   **Conflict Resolution**: If the user tries to edit the "archived" item while it's in Purgatory, you should either block the edit or automatically "Commit" the archive immediately before the edit starts.
*   **Auto-Scroll**: If an item disappears from a list, showing an "Item Archived" toast at the bottom of the screen is better than an inline undo button that jumps the list scroll.

---

::: tip Congratulations!
You've now mastered the most advanced UX pattern in the AsyncFlowState arsenal.
:::

[← Chaining Complex Flows](/guide/tutorials/chaining-flows)
