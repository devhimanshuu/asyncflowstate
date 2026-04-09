<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/solid <span style="font-size: 14px; background: #2c4f7c22; color: #2c4f7c; padding: 4px 10px; border-radius: 20px; vertical-align: middle; margin-left: 10px;">v2.0 Stable</span></h1>
  <p><b>Official SolidJS bindings for AsyncFlowState — the industry-standard engine for predictable async UI behavior.</b></p>

  <p>
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

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v2.0

- **Dead Letter Queue (DLQ):** Recover from failed operations with centralized replays.
- **Global Purgatory (Undo):** Signals-based delay patterns and programmable undo.
- **Deep-Diff Rollbacks:** Reliable optimistic state that survives complex failures.
- **Worker Offloading:** Offload reactive updates to Web Workers seamlessly.
- **Streaming & AI Ready:** First-class support for `AsyncIterable` and `ReadableStream`.
- **Cross-Tab Sync:** State consistency across the browser session.

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
