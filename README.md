<div align="center">
  <img src="./assets/AsyncFlowState_logo.png" width="300" height="300" alt="AsyncFlowState Logo" /> 
  <h1>AsyncFlowState</h1>
  <p><b>The industry-standard engine for predictable async UI behavior.</b></p>
  <p>Eliminate boilerplate and bugs in async interactions. Built for React, Vue, Svelte, Angular, Solid — works everywhere.</p>

  <p>
    <a href="https://github.com/devhimanshuu/asyncflowstate/actions"><img src="https://github.com/devhimanshuu/asyncflowstate/actions/workflows/test.yml/badge.svg" alt="Tests" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License: MIT" /></a>
    <a href="https://www.npmjs.com/package/@asyncflowstate/core"><img src="https://img.shields.io/npm/v/@asyncflowstate/core?color=indigo" alt="NPM Version" /></a>
  </p>
</div>

---

## <i class="fa-solid fa-triangle-exclamation text-red-500"></i> The Problem

Every modern application has async user actions: clicking buttons, submitting forms, saving data, deleting items, uploading files, or making payments.

Each of these actions follows the same lifecycle:
**`idle → loading → success → error → retry`**

But in real projects, this logic is re-written thousands of times. This leads to:

- **Double submission bugs** (user clicks twice)
- **Inconsistent loading UX** (spinners everywhere, or nowhere)
- **Error handling chaos** (forgotten catch blocks, messy transitions)
- **Boilerplate fatigue** (writing `setIsLoading(true)` on every function)

---

## <i class="fa-solid fa-check text-emerald-500"></i> What AsyncFlowState Solves

AsyncFlowState provides a **standard, reusable engine** to control async UI behavior correctly and consistently. It is **not** a data-fetching library (like React Query) or a state manager (like Redux); it is a **behavior orchestrator**.

- **Double submissions?** Prevented by default.
- **Optimistic UI?** One line of config, with Deep-Diff Rollbacks.
- **Global Undo?** Purgatory delays destructive actions dynamically.
- **Worker Offloading?** Push intense ops to a background thread instantly (`flow.worker()`).
- **Ghost Queues?** Spam clicking handled via background queues seamlessly.
- **Dead Letter Queue (DLQ)?** Failed operations automatically pooled for replay.
- **Feature Convergence?** `cross-tab sync`, `AI Skeletons`, and `Predictive Prefetching` built right in.

---

## <i class="fa-solid fa-circle-question text-purple-400"></i> Why AsyncFlowState?

**vs. Manual State Management**

- <i class="fa-solid fa-check text-emerald-500"></i> 90% less boilerplate
- <i class="fa-solid fa-check text-emerald-500"></i> Zero double-submission bugs
- <i class="fa-solid fa-check text-emerald-500"></i> Enterprise-grade error resilience (DLQ, Retries, Circuit Breakers)

**vs. React Query / SWR**

- <i class="fa-solid fa-check text-emerald-500"></i> Designed for **actions**, not data fetching
- <i class="fa-solid fa-check text-emerald-500"></i> Works with any async function (API, WebSockets, LocalStorage, LLMs)
- <i class="fa-solid fa-check text-emerald-500"></i> Powerful composition (`pipe`, `chain`, `raceFlows`)

**vs. Redux / Zustand**

- <i class="fa-solid fa-check text-emerald-500"></i> Focused on **behavior orchestration**, not pure global state
- <i class="fa-solid fa-check text-emerald-500"></i> Time-Travel debugger with `exportState()` directly built-in
- <i class="fa-solid fa-check text-emerald-500"></i> Works flawlessly alongside your existing state manager

---

## <i class="fa-solid fa-magnifying-glass"></i> The Difference (Before vs After)

Here is a common scenario: **Submitting a form and handling the API response.**

### <i class="fa-solid fa-xmark text-red-500"></i> Before (Manual State Management)

```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async (data) => {
  setLoading(true);
  setError(null);
  try {
    await api.save(data);
    alert("Saved!");
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};

return (
  <button onClick={handleSubmit} disabled={loading}>
    {loading ? "Saving..." : "Save"}
  </button>
);
```

### <i class="fa-solid fa-check text-emerald-500"></i> After (With AsyncFlowState)

```tsx
const flow = useFlow(api.save, {
  onSuccess: () => alert("Saved!"),
});

return (
  <button {...flow.button()}>{flow.loading ? "Saving..." : "Save"}</button>
);
```

> **See more patterns?** Check out our [Full Comparison Guide](./examples/react/comparison.tsx).

---

## <i class="fa-solid fa-box text-blue-400"></i> Package Ecosystem

AsyncFlowState is built as a modular system:

| Package                                         | Version | Description                                 |
| :---------------------------------------------- | :------ | :------------------------------------------ |
| [`@asyncflowstate/core`](./packages/core)       | `2.0.0` | Framework-agnostic logic engine             |
| [`@asyncflowstate/react`](./packages/react)     | `2.0.0` | React hooks & accessibility-first helpers   |
| [`@asyncflowstate/next`](./packages/next)       | `2.0.0` | Next.js Server Actions & SSR integration    |
| [`@asyncflowstate/vue`](./packages/vue)         | `2.0.0` | Vue 3 composables & provide/inject config   |
| [`@asyncflowstate/svelte`](./packages/svelte)   | `2.0.0` | Svelte stores with `$` auto-subscription    |
| [`@asyncflowstate/angular`](./packages/angular) | `2.0.0` | Angular Observable/BehaviorSubject bindings |
| [`@asyncflowstate/solid`](./packages/solid)     | `2.0.0` | SolidJS fine-grained reactive signals       |

---

## <i class="fa-solid fa-rocket text-brand"></i> Quick Start

### 1. Installation

### 1. Installation

AsyncFlowState consists of a core engine and native adapters for each framework.

| Framework   | Command                                                                       |
| :---------- | :---------------------------------------------------------------------------- |
| **React**   | `npm install @asyncflowstate/react @asyncflowstate/core`                      |
| **Next.js** | `npm install @asyncflowstate/next @asyncflowstate/react @asyncflowstate/core` |
| **Vue 3**   | `npm install @asyncflowstate/vue @asyncflowstate/core`                        |
| **Svelte**  | `npm install @asyncflowstate/svelte @asyncflowstate/core`                     |
| **Angular** | `npm install @asyncflowstate/angular @asyncflowstate/core`                    |
| **SolidJS** | `npm install @asyncflowstate/solid @asyncflowstate/core`                      |

### 2. Basic Usage (React)

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

### 3. Server Actions (Next.js)

```tsx
"use client";

import { useServerActionFlow } from "@asyncflowstate/next";
import { saveUserAction } from "./actions";

function ProfileForm() {
  const flow = useServerActionFlow(saveUserAction);

  return (
    <form action={flow.execute}>
      <input name="name" />
      <button type="submit" disabled={flow.loading}>
        {flow.loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

### 3. Sequential Workflows

```tsx
import { useFlowSequence } from "@asyncflowstate/react";

const steps = [
  { name: "Step 1", flow: flow1 },
  { name: "Step 2", flow: flow2, mapInput: (prev) => prev.id },
];

const sequence = useFlowSequence(steps);
// sequence.execute() runs them in order
```

### 3. Form Handling (Native Zod/Valibot)

```tsx
import { z } from "zod";

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
});

function ProfileForm() {
  const flow = useFlow(updateProfile);

  return (
    <form {...flow.form({ schema, extractFormData: true })}>
      <input name="username" />
      {flow.fieldErrors.username && <span>{flow.fieldErrors.username}</span>}

      <input name="email" />
      {flow.fieldErrors.email && <span>{flow.fieldErrors.email}</span>}

      <button type="submit" disabled={flow.loading}>
        Submit
      </button>
      {flow.error && <p ref={flow.errorRef}>{flow.error.message}</p>}
    </form>
  );
}
```

### 4. Global Configuration

```tsx
import { FlowProvider } from "@asyncflowstate/react";

function App() {
  return (
    <FlowProvider
      config={{
        onError: (err) => toast.error(err.message),
        retry: { maxAttempts: 3, backoff: "exponential" },
      }}
    >
      <YourApp />
    </FlowProvider>
  );
}
```

### 5. Vue 3

```bash
pnpm add @asyncflowstate/vue @asyncflowstate/core
```

```vue
<script setup lang="ts">
import { useFlow } from "@asyncflowstate/vue";

const { loading, data, execute, button } = useFlow(async (id: string) =>
  api.fetchUser(id),
);
</script>

<template>
  <button v-bind="button()">
    {{ loading ? "Loading..." : "Fetch User" }}
  </button>
</template>
```

### 6. Svelte

```bash
pnpm add @asyncflowstate/svelte @asyncflowstate/core
```

```svelte
<script>
import { createFlow } from '@asyncflowstate/svelte';
const flow = createFlow(async (id) => api.fetchUser(id));
</script>

<button on:click={() => flow.execute('user-123')} disabled={$flow.loading}>
  {$flow.loading ? 'Loading...' : 'Fetch User'}
</button>
```

### 7. Angular

```bash
pnpm add @asyncflowstate/angular @asyncflowstate/core
```

```typescript
import { createFlow } from "@asyncflowstate/angular";

@Component({
  template: `
    <ng-container *ngIf="userFlow.state$ | async as state">
      <button (click)="userFlow.execute('user-123')" [disabled]="state.loading">
        {{ state.loading ? "Loading..." : "Fetch User" }}
      </button>
    </ng-container>
  `,
})
export class UserComponent implements OnDestroy {
  userFlow = createFlow(async (id: string) => api.fetchUser(id));
  ngOnDestroy() {
    this.userFlow.destroy();
  }
}
```

### 8. SolidJS

```bash
pnpm add @asyncflowstate/solid @asyncflowstate/core
```

```tsx
import { createFlow } from "@asyncflowstate/solid";

function UserCard() {
  const flow = createFlow(async (id: string) => api.fetchUser(id));
  return (
    <button onClick={() => flow.execute("user-123")} disabled={flow.loading()}>
      {flow.loading() ? "Loading..." : "Fetch User"}
    </button>
  );
}
```

---

## <i class="fa-solid fa-sparkles text-amber-500"></i> Key Features

- **🌐 Global Config:** Set default options app-wide with `FlowProvider`.
- **<i class="fa-solid fa-link text-gray-400"></i> Declarative Chaining:** Orchestrate complex workflows with `triggerOn` and `signals` instead of manual `useEffect`.
- **🌊 Streaming Support:** Native support for LLM/AI streaming using `AsyncIterable` or `ReadableStream`.
- **<i class="fa-solid fa-bolt text-yellow-400"></i> Parallel & Sequential:** Orchestrate multiple flows with aggregate state via `FlowParallel` and `FlowSequence`.
- **<i class="fa-solid fa-stopwatch text-brand"></i> Declarative Polling:** Built-in support for auto-refreshing actions with conditional stop logic.
- **💾 Smart Persistence:** Survive page refreshes and resume interrupted operations (file uploads, forms, etc.).
- **<i class="fa-solid fa-shield-halved text-emerald-500"></i> Persistent Circuit Breaker:** Prevent cascading failures with cross-session state persistence.
- **📊 Visual Sequence Trace:** Real-time Timeline/Gantt view of all async activity with `FlowDebugger`.
- **<i class="fa-solid fa-wrench text-gray-400"></i> Form Recovery:** Automatically re-focus fields and restore validation errors after a page refresh.
- **🔔 Global Notifications:** Centralized success/error handling for all flows via `FlowNotificationProvider`.
- **🧩 Core Engine:** Lightweight runtime logic that works anywhere (Vanilla JS, Node, etc.).

---

## 📖 Learn More

- **[Examples](./examples)** - Check out full patterns for Login, File Uploads, Advanced Forms, and more.
- **[Core Package Documentation](./packages/core)** - The framework-agnostic engine API.
- **[React Package Documentation](./packages/react)** - Hooks, helpers, and accessibility components.
- **[Vue Package Documentation](./packages/vue)** - Vue 3 composables.
- **[Svelte Package Documentation](./packages/svelte)** - Svelte stores.
- **[Angular Package Documentation](./packages/angular)** - Observable/BehaviorSubject bindings.
- **[Solid Package Documentation](./packages/solid)** - SolidJS reactive primitives.

---

## 🧑‍💻 Contributing

We love contributions! Whether you're fixing a bug, improving documentation, or suggesting a new feature, your help is welcome.

1.  **Check for Issues**: Look at our [Issue Tracker](https://github.com/devhimanshuu/asyncflowstate/issues) to see if your idea or bug is already being addressed.
2.  **Follow the Guide**: Read our [Contributing Guide](./CONTRIBUTING.md) for local setup, development workflows, and coding standards.
3.  **Submit a PR**: When you're ready, use our [Pull Request Template](./PULL_REQUEST_TEMPLATE.md) to ensure your contribution meets our quality standards.

---

## <i class="fa-solid fa-shield-halved text-emerald-500"></i> Security Policy

We take the security of AsyncFlowState seriously. If you find a potential vulnerability, please do not open a public issue. Instead, follow the instructions in our [Security Policy](./SECURITY.md) to report it responsibly.

---

## <i class="fa-solid fa-scale-balanced text-gray-500"></i> Code of Conduct

To ensure a welcoming, diverse, and inclusive community, we adhere to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

---

## 📜 License

MIT © [AsyncFlowState Contributors](https://github.com/devhimanshuu/asyncflowstate)

---

> **"Stop rewriting the same async logic. Start building features."**
>
> AsyncFlowState solves async UI behavior once, correctly, and everywhere.

```

```
