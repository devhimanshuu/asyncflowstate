<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/react <span style="font-size: 14px; background: #6366f122; color: #6366f1; padding: 4px 10px; border-radius: 20px; vertical-align: middle; margin-left: 10px;">v3.0.0 Stable</span></h1>
  <p><b>React hooks and helpers for elegant, accessible async UI behavior management.</b></p>

  <p>
    <a href="https://asyncflowstate-js.pages.dev/frameworks/react"><img src="https://img.shields.io/badge/Documentation-Link-blue.svg" alt="Documentation" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License: MIT" /></a>
    <a href="https://www.npmjs.com/package/@asyncflowstate/react"><img src="https://img.shields.io/npm/v/@asyncflowstate/react?color=indigo" alt="NPM Version" /></a>
  </p>
</div>

---

## Installation

```bash
npm install @asyncflowstate/react
# or
pnpm add @asyncflowstate/react
```

This package depends on `@asyncflowstate/core` which will be installed automatically.

## Quick Start

```tsx
import { useFlow } from "@asyncflowstate/react";

function SaveButton() {
  const flow = useFlow(async (data) => {
    return await api.save(data);
  });

  return (
    <button {...flow.button()}>
      {flow.loading ? "Saving..." : "Save Changes"}
    </button>
  );
}
```

## Global Configuration with FlowProvider

Use `FlowProvider` to set default options for all flows in your application. This is perfect for global error handling, retry policies, and UX settings.

```tsx
import { FlowProvider, useFlow } from "@asyncflowstate/react";

function App() {
  return (
    <FlowProvider
      config={{
        onError: (err) => toast.error(err.message),
        retry: { maxAttempts: 3, backoff: "exponential" },
        loading: { minDuration: 300 },
      }}
    >
      <YourApp />
    </FlowProvider>
  );
}

// All flows inside will inherit the global config
function YourApp() {
  const flow = useFlow(saveData); // Automatically has retry + error handling

  return <button {...flow.button()}>Save</button>;
}
```

### Benefits of FlowProvider

- **DRY Principle**: Define error handlers, retry logic, and UX settings once
- **Consistency**: Ensure all async actions behave the same way
- **Flexibility**: Local options can override global settings
- **Nested Providers**: Different sections can have different configurations

```tsx
<FlowProvider config={{ retry: { maxAttempts: 2 } }}>
  <MainApp />

  {/* Admin section needs more retries */}
  <FlowProvider config={{ retry: { maxAttempts: 5 } }}>
    <AdminPanel />
  </FlowProvider>
</FlowProvider>
```

See [FlowProvider examples](../../examples/react/flow-provider-examples.tsx) for more patterns.

## Comprehensive Examples

### 1. The Classic: Optimistic UI with Deep-Diff Rollback

Update your UI instantly and trust AsyncFlowState to revert to the exact previous state if the network fails.

```tsx
import { useFlow } from "@asyncflowstate/react";

function LikeButton({ post }) {
  const flow = useFlow(api.likePost, {
    // 1. Update state immediately
    optimisticResult: (prev) => ({
      ...prev,
      likes: prev.likes + 1,
      isLiked: true,
    }),
    // 2. Automatically revert on failure
    rollbackOnError: true,
    onSuccess: () => toast.success("Liked!"),
    onError: () => toast.error("Connection failed. Reverting..."),
  });

  return (
    <button {...flow.button({ onClick: () => flow.execute(post.id) })}>
      {flow.data.isLiked ? "❤️" : "🤍"} {flow.data.likes}
    </button>
  );
}
```

### 2. Enterprise Forms: Zod Validation & Auto-Extraction

Stop manually mapping `e.target.value`. Use built-in schema validation and automatic focus management.

```tsx
import { z } from "zod";
import { useFlow } from "@asyncflowstate/react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password too short"),
});

function LoginForm() {
  const flow = useFlow(auth.login, {
    onSuccess: () => navigate("/dashboard"),
  });

  return (
    <form
      {...flow.form({ schema, extractFormData: true, resetOnSuccess: true })}
    >
      <input name="email" placeholder="Email" />
      {flow.fieldErrors.email && (
        <p className="error">{flow.fieldErrors.email}</p>
      )}

      <input name="password" type="password" placeholder="Password" />
      {flow.fieldErrors.password && (
        <p className="error">{flow.fieldErrors.password}</p>
      )}

      <button type="submit" disabled={flow.loading}>
        {flow.loading ? "Logging in..." : "Login"}
      </button>

      {/* Auto-focuses on error */}
      {flow.error && <div ref={flow.errorRef}>{flow.error.message}</div>}
    </form>
  );
}
```

### 3. AI-Powered: Predictive Intent & Flow DNA

Pre-warm your flows before the user even clicks. AsyncFlowState learns from hover patterns to eliminate perceived latency.

```tsx
import { useFlow } from "@asyncflowstate/react";

function ProductCard({ productId }) {
  const flow = useFlow(api.getDetails, {
    predictive: {
      prefetchOnHover: true, // Learns and pre-warms the flow
      threshold: 0.8, // Confidence threshold
    },
  });

  return (
    <div onMouseEnter={flow.button().onMouseEnter} className="card">
      <h3>Product {productId}</h3>
      <button onClick={() => flow.execute(productId)}>
        {flow.status === "prewarmed" ? "Instant View" : "View Details"}
      </button>
    </div>
  );
}
```

### 4. Cross-Tab Sync: Real-Time Coordination

Keep your application state consistent across every open tab without a backend websocket.

```tsx
const flow = useFlow(api.updateSettings, {
  // Syncs loading status and data across all tabs automatically
  crossTab: {
    sync: true,
    channel: "user-settings",
  },
});
```

### 5. Multi-Step Workflows: `useFlowSequence`

Manage complex, interdependent async steps with a single source of truth for progress and errors.

```tsx
import { useFlowSequence } from "@asyncflowstate/react";

function SetupWizard() {
  const sequence = useFlowSequence([
    { name: "Create Account", flow: accountFlow },
    { name: "Verify Email", flow: emailFlow, mapInput: (acc) => acc.email },
    { name: "Sync Data", flow: syncFlow },
  ]);

  return (
    <div>
      <progress value={sequence.progress} max="100" />
      <p>Current Step: {sequence.currentStep?.name}</p>
      <button onClick={() => sequence.execute()}>Start Setup</button>
    </div>
  );
}
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** AI-driven state that optimizes behavior based on user patterns.
- **Ambient Intelligence:** Background orchestration that pre-empts async failures.
- **Speculative Execution:** Predicted user intent for zero-latency interactions.
- **Emotional UX Components:** Skeleton states and transitions that adapt to app load.
- **Collaborative Hooks:** Real-time multi-user state synchronization.
- **Edge-First Fetching:** Native support for edge-optimized data flows.
- **Temporal Debugging:** Replay any async sequence with full state fidelity.
- **Telemetry Dashboard:** Live monitoring of all application flows.

## Monitoring & Debugging

### `FlowDebugger` (Timeline View)

A powerful drop-in component to visualize all async activity. Features a **Timeline/Gantt** view to identify bottlenecks and parallel execution order.

```tsx
import { FlowDebugger } from "@asyncflowstate/react";

// Add it once at the root
<FlowDebugger />;
```

### `FlowNotificationProvider`

Catch success or error events from ANY flow globally.

```tsx
import { FlowNotificationProvider } from "@asyncflowstate/react";

<FlowNotificationProvider
  onSuccess={(e) => toast.success(`${e.flowName} completed!`)}
  onError={(e) => toast.error(`${e.flowName} failed: ${e.state.error.message}`)}
>
  <App />
</FlowNotificationProvider>;
```

## API Reference

### `useFlow<TData, TError, TArgs>(action, options?)`

#### Returns

```typescript
{
  // State
  status: 'idle' | 'loading' | 'success' | 'error';
  data: TData | null;
  error: TError | null;
  loading: boolean;      // Respects loading.delay
  progress: number;      // 0-100
  fieldErrors: Record<string, string>;

  // Actions
  execute: (...args: TArgs) => Promise<TData | undefined>;
  reset: () => void;
  cancel: () => void;
  setProgress: (val: number) => void;

  // Helpers & Components
  button: (props?) => ButtonHTMLAttributes;
  form: (props?) => FormHTMLAttributes;
  LiveRegion: React.ComponentType;
  errorRef: React.RefObject<any>;
}
```

## License

MIT © [AsyncFlowState Contributors](https://github.com/devhimanshuu/asyncflowstate)
