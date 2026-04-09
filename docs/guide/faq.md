# Frequently Asked Questions

Common questions about using AsyncFlowState in production environments.

---

## <i class="fa-solid fa-circle-question text-brand"></i> General Questions

### Why not just use TanStack Query (React Query)?
AsyncFlowState and TanStack Query solve different problems.
*   **TanStack Query** is primarily a **data-fetching/caching** library. It's great for `GET` requests and server state.
*   **AsyncFlowState** is a **behavior engine**. It focus on the **UX of actions** (POST/PUT/DELETE). It handles double-click prevention, automatic ARIA management, retry jitter, dead letter queues, and complex concurrency (exhaust, switch, enqueue) that Query doesn't natively aim to solve.

::: tip Use Both
Many production apps use TanStack Query for data fetching and AsyncFlowState for all user-initiated actions (forms, buttons, toggles).
:::

### Is this production-ready?
Yes. AsyncFlowState is built with TypeScript, has 100% test coverage, and is used in enterprise applications where predictable async behavior is critical. It has zero runtime dependencies, making it safe for any stack.

---

## <i class="fa-solid fa-microchip text-brand"></i> Architecture

### What is the bundle size?
The core engine is extremely lightweight (~4KB gzipped). Framework adapters are even smaller (~1KB) as they simply map the core logic to framework-specific primitives (Signals, Hooks, Observables).

### Can I use it without a framework?
Absolutely. `@asyncflowstate/core` is framework-agnostic. You can use it in vanilla JS/TS projects, Web Components, or even Node.js background workers.

---

## <i class="fa-solid fa-bolt-lightning text-brand"></i> Advanced Usage

### Does it support Server Components (RSC) and Next.js?
Yes. While the `useFlow` hook is a Client Component feature (since it manages UI state), it integrates perfectly with **Next.js Server Actions**. You can pass your Server Action directly into `useFlow`.

### How do I handle global errors?
You can define an `onError` handler in the `FlowProvider` (or framework equivalent). This handler will catch all errors across your app, allowing you to trigger global toasts or send logs to services like Sentry.

```tsx
<FlowProvider config={{ 
  onError: (err) => Sentry.captureException(err) 
}}>
  <App />
</FlowProvider>
```

### What is the "Quantum" strategy?
The **Quantum** strategy is a unique concurrency behavior where multiple identical requests are "merged" into one. If 10 components request the same user profile simultaneously, only one server request is made, and all 10 components receive the same result.

---

## <i class="fa-solid fa-flask text-brand"></i> Testing & Debugging

### How do I mock my flows in tests?
Since AsyncFlowState is just a wrapper around your async functions, you can mock the underlying functions as you normally would with Vitest or Jest.

```tsx
// Mocking the API
vi.mock('./api', () => ({
  fetchData: vi.fn().mockResolvedValue({ status: 'ok' })
}));

// Test your component as usual
render(<MyComponent />);
expect(screen.getByText('Loading...')).toBeInTheDocument();
```

### Can I simulate network lag?
Yes. Using the `jitter` and `minDuration` features, you can simulate realistic network conditions during manual testing to ensure your UI doesn't "flicker" or fail under pressure.

---

## <i class="fa-solid fa-weight-hanging text-brand"></i> Performance

### Does this use `eval` or anything unsafe?
No. AsyncFlowState is built with strict adherence to security best practices. It uses standard JavaScript features and is fully CSP-compliant.

### Is there a "Core-Only" version?
Yes. If you don't need UI hooks and only want the async state machine, you can install `@asyncflowstate/core` standalone. This saves even more bundle space for background workers.

---

## <i class="fa-solid fa-ghost text-brand"></i> Advanced Patterns

### What is "Ghost Workflows"?
"Ghost Workflows" are background operations that don't trigger any loading indicators but still handle retries and error logging. Perfect for analytics or pre-fetching data.

### Is Purgatory state persisted?
By default, Purgatory (undo) state is kept in memory. However, if you enable **Persistent Purgatory**, users can still undo an action even after refreshing the page or reopening the tab.

### What is "Purgatory"?
"Purgatory" is our term for a **Global Undo State**. It allows you to hold async operations in a "limbo" state where the UI updates optimistically, but the actual server request is delayed. If the user hits "Undo", the request is never sent.

---

## <i class="fa-solid fa-shield-halved text-brand"></i> Reliability

### How does the retry jitter work?
If multiple clients fail at the same time, we don't want them to "stampede" your server by retrying simultaneously. AsyncFlowState adds a randomized delay (jitter) to each retry attempt, spreading the load and increasing the chance of success.

### What happens if the user closes the tab?
If you enable **Smart Persistence**, the flow state is saved to `localStorage`. When the user returns, the library can resume the operation or handle the failure appropriately, depending on your configuration.

---

::: info Still have questions?
Can't find what you're looking for? [Open an issue on GitHub](https://github.com/devhimanshuu/asyncflowstate/issues) or join our community Discord.
:::
