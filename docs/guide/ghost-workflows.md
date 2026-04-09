# Ghost Workflows <i class="fa-solid fa-sparkles text-amber-500"></i>

<GhostAnimation />

Ghost Workflows are for actions that happen so fast that the user shouldn't even know they are happening.

Think of an Instagram "Like" button. When you spam "Like" 50 times in 2 seconds, the UI shouldn't block, and you shouldn't see 50 loading spinners.

Enabling Ghost mode queues these actions onto a background thread without ever forcing the Flow into a `loading` state, leaving the UI completely clean.

## Usage

Enable the `ghost` property.

```ts
const likeFlow = useFlow(likePost, {
  ghost: {
    enabled: true,
    strategy: "queue", // Process them sequentially in the background
  },
});
```

With this setting:

- `likeFlow.loading` will **always** be false.
- `likeFlow.execute()` never halts the UI.
- If multiple calls are made simultaneously, they are managed via the queue strategy without interrupting the user.
