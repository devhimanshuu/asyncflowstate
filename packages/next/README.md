<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/next <span style="font-size: 14px; background: #6366f122; color: #6366f1; padding: 4px 10px; border-radius: 20px; vertical-align: middle; margin-left: 10px;">v3.0.0 Stable</span></h1>
  <p><b>Next.js optimized integration for AsyncFlowState.</b></p>
  <p>Handle SSR, Server Actions, and App Router transitions with declarative behavior orchestration.</p>

  <p>
    <a href="https://asyncflowstate-js.pages.dev/frameworks/next"><img src="https://img.shields.io/badge/Documentation-Link-blue.svg" alt="Documentation" /></a>
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

## Comprehensive Examples

### 1. Server Actions with Transitions

Native integration with React 19 / Next.js 15 `useTransition` for smooth navigation and automatic cache revalidation.

```tsx
import { useTransitionFlow } from "@asyncflowstate/next";
import { updateProfileAction } from "./actions";

function ProfileForm() {
  const flow = useTransitionFlow(updateProfileAction, {
    revalidatePath: "/profile", // Automatic revalidation on success
    onSuccess: () => toast.success("Profile updated!"),
  });

  return (
    <form action={flow.execute}>
      <input name="username" />
      <button type="submit" disabled={flow.isPending}>
        {flow.isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

### 2. Edge-First Architecture

Optimized for the Edge Runtime. AsyncFlowState automatically leverages Edge Cache and detects environmental telemetry.

```tsx
export const runtime = "edge";

const flow = useServerActionFlow(apiAction, {
  edge: {
    cache: "force-cache",
    ttl: 3600,
  },
});
```

### 3. AI-Powered: Speculative Navigation

Predict user navigation intent and pre-warm server action states before the user clicks.

```tsx
const flow = useServerActionFlow(detailsAction, {
  predictive: { prefetchOnHover: true },
});

return (
  <Link href="/details" onMouseEnter={flow.prewarm}>
    View Details
  </Link>
);
```

### 4. Collaborative Server State: Cross-Tab Mesh

Synchronize Server Action results across multiple open tabs for the same user session.

```tsx
const flow = useServerActionFlow(updateSettings, {
  crossTab: { sync: true, channel: "user-session-mesh" },
});
```

### 5. Multi-Step Server Sequences

Orchestrate complex server-side workflows with individual step tracking and aggregate progress.

```tsx
const sequence = useFlowSequence([
  { name: "Auth", flow: loginAction },
  { name: "Sync", flow: syncAction },
]);
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** Self-healing Server Actions that optimize based on user patterns.
- **Speculative Navigation:** Intent-based pre-fetching and execution.
- **Ambient ISR Monitoring:** Background orchestration for incremental static regeneration.
- **Collaborative Server State:** Real-time state synchronization across Next.js instances.
- **Edge-First Flows:** Optimized integration with Next.js Edge Runtime.
- **Temporal Replay:** Full history replay for complex multi-step Server Action flows.
- **Telemetry Dashboard:** Live monitoring of Server Action health and performance.

## License

MIT
