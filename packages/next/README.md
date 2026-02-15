# @asyncflowstate/next

Next.js optimized integration for **AsyncFlowState**. Handle SSR, Server Actions, and App Router transitions with declarative loading, error, and success states.

## Installation

```bash
pnpm add @asyncflowstate/next @asyncflowstate/react @asyncflowstate/core
# or
npm install @asyncflowstate/next @asyncflowstate/react @asyncflowstate/core
```

## Transitions & Revalidation

### `useTransitionFlow`

Perfect for React 19 and Next.js 15. Wraps execution in `startTransition` and provides automatic cache revalidation.

```tsx
import { useTransitionFlow } from "@asyncflowstate/next";

const flow = useTransitionFlow(submitAction, {
  refresh: true, // router.refresh() on success
  revalidatePath: "/dash", // Declarative revalidation hint
  scrollToTop: true,
});

return (
  <button onClick={() => flow.execute()} disabled={flow.isPending}>
    {flow.isPending ? "Processing..." : "Submit"}
  </button>
);
```

### Features

- **Server Action Support**: Seamlessly wrap Next.js Server Actions with `useServerActionFlow`.
- **SSR Friendly**: Built-in handling for hydration and server-side state.
- **App Router Integrated**: Works perfectly with `useTransition` and Next.js navigation.
- **Automatic Revalidation**: Declaratively trigger `revalidatePath` or `revalidateTag` via success hooks.

## License

MIT
