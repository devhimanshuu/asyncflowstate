<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/remix <span style="font-size: 14px; background: #00000022; color: #000000; padding: 4px 10px; border-radius: 20px; vertical-align: middle; margin-left: 10px;">v3.0.0 Stable</span></h1>
  <p><b>Remix-optimized behavior orchestration for AsyncFlowState.</b></p>

  <p>
    <a href="https://asyncflowstate-js.pages.dev/frameworks/remix"><img src="https://img.shields.io/badge/Documentation-Link-blue.svg" alt="Documentation" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License: MIT" /></a>
    <a href="https://www.npmjs.com/package/@asyncflowstate/remix"><img src="https://img.shields.io/npm/v/@asyncflowstate/remix?color=indigo" alt="NPM Version" /></a>
  </p>
</div>

---

## Installation

```bash
pnpm add @asyncflowstate/remix @asyncflowstate/react @asyncflowstate/core
```

## Quick Start

### Basic Action Flow

```tsx
import { useActionFlow } from "@asyncflowstate/remix";

export function CreatePost() {
  const flow = useActionFlow({
    onSuccess: () => toast.success("Post created!"),
  });

  return (
    <form method="post" onSubmit={flow.form().onSubmit}>
      <input name="title" />
      <button type="submit" disabled={flow.isSubmitting}>
        {flow.isSubmitting ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}
```

## Comprehensive Examples

### 1. Optimistic UI with Deep-Diff Rollback

Instantly update your UI and let AsyncFlowState handle the rollback if the Remix Action fails.

```tsx
const flow = useActionFlow({
  optimisticResult: (prev) => ({ ...prev, liked: true }),
  rollbackOnError: true,
});
```

### 2. AI-Powered: Speculative Navigation

Predict which action the user will take and pre-warm the server-side state.

```tsx
const flow = useActionFlow({
  predictive: { prefetchOnHover: true },
});

return (
  <button onMouseEnter={flow.prewarm} onClick={() => flow.execute()}>
    Quick Save
  </button>
);
```

### 3. Multi-Step Sequences

Orchestrate complex sequences involving multiple Remix Actions or external APIs.

```tsx
const sequence = useFlowSequence([
  { name: "Step 1", flow: action1 },
  { name: "Step 2", flow: action2 },
]);
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** Self-healing actions that adapt to user behavior patterns.
- **Speculative Execution:** Low-latency interactions via intent prediction.
- **Ambient Intelligence:** Background monitoring of Remix navigation lifecycle.
- **Collaborative Mesh:** Sync action states across multiple browser tabs.
- **Edge-First Fetching:** Optimized for Remix on Cloudflare Workers and Vercel Edge.
- **Telemetry Dashboard:** Live monitoring of action health and latency.

## License

MIT © [AsyncFlowState Contributors](https://github.com/devhimanshuu/asyncflowstate)
