<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/next</h1>
  <p><b>Next.js optimized integration for AsyncFlowState.</b></p>
  <p>Handle SSR, Server Actions, and App Router transitions with declarative behavior orchestration.</p>

  <p>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License: MIT" /></a>
    <a href="https://www.npmjs.com/package/@asyncflowstate/next"><img src="https://img.shields.io/npm/v/@asyncflowstate/next?color=indigo" alt="NPM Version" /></a>
  </p>
</div>

---

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
