<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/solid <span style="font-size: 14px; background: #2c4f7c22; color: #2c4f7c; padding: 4px 10px; border-radius: 20px; vertical-align: middle; margin-left: 10px;">v3.0.0 Stable</span></h1>
  <p><b>Official SolidJS bindings for AsyncFlowState — the industry-standard engine for predictable async UI behavior.</b></p>

  <p>
    <a href="https://asyncflowstate-js.pages.dev/frameworks/solidjs"><img src="https://img.shields.io/badge/Documentation-Link-blue.svg" alt="Documentation" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License: MIT" /></a>
    <a href="https://www.npmjs.com/package/@asyncflowstate/solid"><img src="https://img.shields.io/npm/v/@asyncflowstate/solid?color=indigo" alt="NPM Version" /></a>
  </p>
</div>

## Installation

```bash
pnpm add @asyncflowstate/solid @asyncflowstate/core
```

## Quick Start

### Basic Usage

```tsx
import { createFlow } from "@asyncflowstate/solid";
import { Show } from "solid-js";

function UserCard() {
  const flow = createFlow(async (id: string) => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  });

  return (
    <div>
      <button
        onClick={() => flow.execute("user-123")}
        disabled={flow.loading()}
      >
        {flow.loading() ? "Loading..." : "Fetch User"}
      </button>

      <Show when={flow.data()}>{(user) => <p>{user().name}</p>}</Show>

      <Show when={flow.error()}>
        {(err) => <p class="error">{err().message}</p>}
      </Show>
    </div>
  );
}
```

### With Retry & Optimistic Updates

```tsx
const flow = createFlow(likePost, {
  optimisticResult: (prev, [postId]) => ({
    ...prev,
    likes: prev.likes + 1,
  }),
  rollbackOnError: true,
  retry: { maxAttempts: 3, backoff: "exponential" },
});
```

### Global Configuration

```tsx
import { FlowProvider } from "@asyncflowstate/solid";

function App() {
  return (
    <FlowProvider
      config={{
        onError: (err) => toast.error(err.message),
        retry: { maxAttempts: 3 },
      }}
    >
      <MyApp />
    </FlowProvider>
  );
}
```

### Sequential Workflows

```tsx
import { createFlowSequence } from "@asyncflowstate/solid";

const sequence = createFlowSequence([
  { name: "Validate", flow: validateFlow.flow },
  { name: "Submit", flow: submitFlow.flow },
]);

<button onClick={() => sequence.execute()} disabled={sequence.loading()}>
  Run Workflow ({sequence.progress()}%)
</button>;
```

### Keyed Lists

```tsx
import { createFlowList } from "@asyncflowstate/solid";
import { For } from "solid-js";

const list = createFlowList(async (id: string) => api.deleteItem(id));

<For each={items()}>
  {(item) => (
    <button
      onClick={() => list.execute(item.id, item.id)}
      disabled={list.getStatus(item.id).status === "loading"}
    >
      Delete
    </button>
  )}
</For>;
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** Self-healing signals that learn from runtime patterns.
- **Ambient Intelligence:** Background predictive monitoring for SolidJS.
- **Speculative Execution:** Zero-latency signal updates via intent prediction.
- **Emotional UX:** Signal-aware adaptive UI transitions.
- **Collaborative Primitives:** Multi-user state synchronization with fine-grained reactivity.
- **Edge-First Flows:** Optimized for high-performance edge execution.
- **Temporal Replay:** Full time-travel through SolidJS signal states.
- **Telemetry Dashboard:** Live monitoring of all application reactive flows.

## Comprehensive Examples

### 1. Fine-Grained Optimistic UI

Update your UI instantly and trust AsyncFlowState to revert to the exact previous state if the network fails.

```tsx
import { createFlow } from "@asyncflowstate/solid";

function LikeButton({ post }) {
  const flow = createFlow(api.likePost, {
    // 1. Update state immediately
    optimisticResult: (prev) => ({
      ...prev,
      likes: prev().likes + 1,
      isLiked: true,
    }),
    // 2. Automatically revert on failure
    rollbackOnError: true,
    onSuccess: () => toast.success("Liked!"),
    onError: () => toast.error("Connection failed. Reverting..."),
  });

  return (
    <button onClick={() => flow.execute(post.id)} disabled={flow.loading()}>
      {flow.data()?.isLiked ? "❤️" : "🤍"} {flow.data()?.likes}
    </button>
  );
}
```

### 2. AI-Powered: Predictive Intent & Flow DNA

Pre-warm your flows before the user even clicks. AsyncFlowState learns from hover patterns to eliminate perceived latency.

```tsx
import { createFlow } from "@asyncflowstate/solid";

function ProductCard({ productId }) {
  const flow = createFlow(api.getDetails, {
    predictive: { prefetchOnHover: true },
  });

  return (
    <div onMouseEnter={flow.prewarm} class="card">
      <button onClick={() => flow.execute(productId)}>
        {flow.status() === "prewarmed" ? "Instant View" : "View Details"}
      </button>
    </div>
  );
}
```

### 3. Enterprise Orchestration: `createFlowSequence`

Manage complex, interdependent async steps with fine-grained progress tracking.

```tsx
import { createFlowSequence } from "@asyncflowstate/solid";

function SetupWizard() {
  const sequence = createFlowSequence([
    { name: "Create Account", flow: accountFlow },
    { name: "Verify Email", flow: emailFlow },
    { name: "Sync Data", flow: syncFlow },
  ]);

  return (
    <div>
      <progress value={sequence.progress()} max="100" />
      <p>Current Step: {sequence.currentStep()?.name}</p>
      <button onClick={() => sequence.execute()}>Start Setup</button>
    </div>
  );
}
```

### 4. Real-Time Collaboration: Cross-Tab Mesh

Keep your application state consistent across every open tab automatically.

```tsx
const flow = createFlow(api.updateSettings, {
  crossTab: {
    sync: true,
    channel: "user-settings",
  },
});
```

### 5. Multi-Keyed Flows: `createFlowList`

Manage multiple keyed flow instances with independent reactive signals.

```tsx
import { createFlowList } from "@asyncflowstate/solid";
const list = createFlowList(api.deleteItem);

<For each={items()}>
  {(item) => (
    <button
      onClick={() => list.execute(item.id)}
      disabled={list.getStatus(item.id).status === "loading"}
    >
      Delete {item.name}
    </button>
  )}
</For>;
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** Self-healing signals that learn from runtime patterns.
- **Ambient Intelligence:** Background predictive monitoring for SolidJS.
- **Speculative Execution:** Zero-latency signal updates via intent prediction.
- **Emotional UX:** Signal-aware adaptive UI transitions.
- **Collaborative Primitives:** Multi-user state synchronization with fine-grained reactivity.
- **Edge-First Flows:** Optimized for high-performance edge execution.
- **Temporal Replay:** Full time-travel through SolidJS signal states.
- **Telemetry Dashboard:** Live monitoring of all application reactive flows.

## API Reference

| Function                               | Description                                       |
| -------------------------------------- | ------------------------------------------------- |
| `createFlow(action, options?)`         | Core primitive for managing async actions         |
| `createFlowSequence(steps)`            | Orchestrate sequential workflows                  |
| `createFlowParallel(flows, strategy?)` | Run flows in parallel                             |
| `createFlowList(action, options?)`     | Manage multiple keyed flow instances              |
| `createInfiniteFlow(action, options)`  | Manage paginated/infinite scrolling data fetching |
| `FlowProvider`                         | Provide global configuration via context          |

All state values are SolidJS signals (accessor functions) for fine-grained reactivity.

## License

MIT © [AsyncFlowState Contributors](https://github.com/devhimanshuu/asyncflowstate)
