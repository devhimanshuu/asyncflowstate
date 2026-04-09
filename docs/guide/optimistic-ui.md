# Optimistic UI

<OptimisticAnimation />

Show instant results to create a snappy user experience, and gracefully rollback on failure.

## How It Works

1. User triggers an action (e.g., toggles a "like" button)
2. UI **immediately** shows the expected result
3. The actual API call happens in the background
4. On **success**: the optimistic result is replaced with real data
5. On **error**: the optimistic result is reverted

## Basic Usage

```tsx
const flow = useFlow(async (liked: boolean) => api.toggleLike(postId, liked), {
  optimisticResult: !currentLiked,
});
```

## Complete Example

```tsx
function LikeButton({ postId, initialLiked }) {
  const [liked, setLiked] = useState(initialLiked);

  const flow = useFlow(
    async (newLiked) => {
      return await api.toggleLike(postId, newLiked);
    },
    {
      optimisticResult: !liked,
      onStart: ([newLiked]) => setLiked(newLiked),  // Optimistic
      onSuccess: (result) => setLiked(result.liked), // Confirm
      onError: () => setLiked(liked),                // Rollback
    }
  );

  return (
    <button {...flow.button()} onClick={() => flow.execute(!liked)}>
      {liked ? "<i class="fa-solid fa-heart text-red-500"></i>" : "<i class="fa-regular fa-heart"></i>"} {liked ? "Liked" : "Like"}
    </button>
  );
}
```

## Optimistic with Core Engine

```ts
import { Flow } from "@asyncflowstate/core";

const updateFlow = new Flow(async (data) => api.update(data), {
  optimisticResult: { ...currentData, ...pendingChanges },
});

// After execute():
// - flow.data immediately has the optimistic result
// - On success, flow.data updates to the real response
// - On error, flow.data reverts to null and flow.error is set
```

::: warning Important
Optimistic UI works best for idempotent operations where the expected result is predictable. For complex server-side logic, consider using the `onStart`/`onError` pattern for manual control.
:::

## Deep-Diff Rollbacks <i class="fa-solid fa-sparkles text-amber-500"></i>

If an optimistic flow fails, you might want to know exactly _what_ part of the state actually reverted. This allows you to specifically animate "bouncing back" the exact elements that failed, rather than aggressively re-rendering the entire view.

AsyncFlowState internally calculates deep Object Diffing using `fast-json-patch` patterns when an optimistic update fails.

```ts
const { loading, rollbackDiff } = useFlow(updateMegaDocument, {
  optimisticResult: hugeProjectState,
});

// If the API call fails, the state automatically reverts.
// the `rollbackDiff` property is populated with the exact JSON patches:
console.log(rollbackDiff);
/*
[
  { "op": "replace", "path": "/project/title", "value": "Old Title" },
  { "op": "remove", "path": "/project/tags/3" }
]
*/
```
