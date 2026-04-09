# Optimistic UI Patterns

Implement instant user feedback with automatic rollbacks for a high-performance, polished user experience.

---

Optimistic UI is the key difference between a "good" app and a "premium" app. It’s the strategy of updating the UI **before** the server confirms the action, making your app feel instantaneous.

## What is Optimistic UI?

Instead of showing a loading spinner when a user clicks "Like" or "Toggle", you update the heart icon to red immediately. 
*   **Success**: The server confirms, and nothing changes (the UI already looks correct).
*   **Failure**: The server fails, and **AsyncFlowState automatically rolls back** the UI to its previous state.

## 1. Implementing an Optimistic Toggle

Let's say we have a simple "Like" button. In basic async code, you'd wait for the `POST` request to finish. With AsyncFlowState, you can update the state in `onStart`.

```tsx
const toggleLike = (id: string, isLiked: boolean) => api.post(`/likes/${id}`);

function LikeButton({ id, initialLiked }) {
  const [isLiked, setIsLiked] = useState(initialLiked);

  const flow = useFlow(toggleLike, {
    // 1. Update UI immediately
    onStart: () => setIsLiked(!isLiked),
    
    // 2. Roll back if the server fails
    onError: () => {
      setIsLiked(isLiked); // revert to original state
      toast.error("Could not save your like. Reverting...");
    },
    
    // 3. Confirm (optional)
    onSuccess: (data) => {
        // ... any final confirmation logic
    }
  });

  return (
    <button 
      onClick={() => flow.execute(id, isLiked)}
      className={isLiked ? "liked" : ""}
    >
      <i class={isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
      {flow.loading && <span class="mini-spinner"></span>}
    </button>
  );
}
```

## 2. Using the `optimistic` Config Helper

To make this even easier, AsyncFlowState's `onStart` actually receives the **previous state** by default if you use a state-management adapter.

### <i class="fa-solid fa-lightbulb text-brand"></i> Pro Tip: Purgatory (Global Undo)
For even more advanced patterns, see the [Global Undo (Purgatory)](/guide/purgatory) documentation. It allows you to delay the server request by a "grace period" (e.g., 3 seconds) where the user can hit "Undo" before any request is even sent.

---

::: tip Rule of Thumb
Use Optimistic UI for **non-destructive, cheap actions** (Likes, Toggles, Archiving). 
Avoid it for **destructive, expensive actions** (Deleting an account, Purchasing an item, Resetting settings).
:::

[Back to Resilient Form Tutorial ←](/guide/tutorials/resilient-form)
