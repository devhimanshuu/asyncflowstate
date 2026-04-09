# Next.js API Reference

Complete API reference for `@asyncflowstate/next`.

## useServerActionFlow

Specialized React hook for Next.js Server Actions with built-in transition support and validation handling.

```ts
function useServerActionFlow<TInput, TOutput>(
  action: (...args: TInput[]) => Promise<TOutput>,
  options?: NextFlowOptions<TInput, TOutput>,
): UseFlowResult<TInput, TOutput>;
```

### Transition Awareness

`useServerActionFlow` is deeply integrated with `React.useTransition`. When `execute` is called, it automatically transitions the state using `startTransition`, allowing it to participate in Next.js App Router's loading skeletons and concurrent rendering.

| Property    | Type                       | Description                                                        |
| ----------- | -------------------------- | ------------------------------------------------------------------ |
| `executing` | `boolean`                  | `true` during Server Action execution (aliased as `loading`)       |
| `data`      | `TOutput \| null`          | Result returned from the Server Action                             |
| `error`     | `Error \| null`            | Error caught from the Server Action                                |
| `execute`   | `(formData) => Promise<T>` | Standard action trigger (can be spread into `<form action={...}>`) |

---

## ServerActionConfig

Sets global Server Action defaults.

```tsx
// app/layout.tsx
<FlowProvider
  config={{
    retry: { maxAttempts: 2, pauseOffline: true },
    loading: { minDuration: 500 }
  }}
>
```

---

## SSR & Rehydration

`@asyncflowstate/next` ensures your flow states are SSR-stable, preventing common hydration mismatches that occur with client-side async state initialization.

- Supports `staleTime` and `dedupKey` for cross-request caching.
- Native support for Next.js `Redirect` and `NotFound` errors within flows.
