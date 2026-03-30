# AsyncFlowState

> **AsyncFlowState — The industry-standard engine for predictable async UI behavior.**

Eliminate boilerplate and bugs in async interactions. Built for React, works everywhere.

[![Tests](https://github.com/devhimanshuu/asyncflowstate/actions/workflows/test.yml/badge.svg)](https://github.com/devhimanshuu/asyncflowstate/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚨 The Problem

Every modern application has async user actions: clicking buttons, submitting forms, saving data, deleting items, uploading files, or making payments.

Each of these actions follows the same lifecycle:
**`idle → loading → success → error → retry`**

But in real projects, this logic is re-written thousands of times. This leads to:

- **Double submission bugs** (user clicks twice)
- **Inconsistent loading UX** (spinners everywhere, or nowhere)
- **Error handling chaos** (forgotten catch blocks, messy transitions)
- **Boilerplate fatigue** (writing `setIsLoading(true)` on every function)

---

## ✅ What AsyncFlowState Solves

AsyncFlowState provides a **standard, reusable engine** to control async UI behavior correctly and consistently. It is **not** a data-fetching library (like React Query) or a state manager (like Redux); it is a **behavior orchestrator**.

- **Double submissions?** Prevented by default.
- **Retry logic?** Built-in with backoff strategies.
- **Optimistic UI?** One line of config.
- **UX Polish?** Prevent UI flashes with `minDuration`.
- **Consistency?** Guaranteed across your entire app.

---

## 🤔 Why AsyncFlowState?

**vs. Manual State Management**

- ✅ 90% less boilerplate
- ✅ Zero double-submission bugs
- ✅ Consistent UX across your app

**vs. React Query / SWR**

- ✅ Designed for **actions**, not data fetching
- ✅ Works with any async function (API, localStorage, WebSocket)
- ✅ No cache management complexity

**vs. Redux / Zustand**

- ✅ Focused on **behavior**, not global state
- ✅ Zero configuration required
- ✅ Works alongside your existing state manager

---

## 🔍 The Difference (Before vs After)

Here is a common scenario: **Submitting a form and handling the API response.**

### ❌ Before (Manual State Management)

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

### ✅ After (With AsyncFlowState)

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

## 📦 Package Ecosystem

AsyncFlowState is built as a modular system:

| Package                                     | Version | Description                               |
| :------------------------------------------ | :------ | :---------------------------------------- |
| [`@asyncflowstate/core`](./packages/core)   | `1.0.1` | Framework-agnostic logic engine           |
| [`@asyncflowstate/react`](./packages/react) | `1.0.1` | React hooks & accessibility-first helpers |
| [`@asyncflowstate/next`](./packages/next)   | `1.0.1` | Next.js Server Actions & SSR integration  |

---

## 🚀 Quick Start (React & Next.js)

### 1. Installation

```bash
pnpm add @asyncflowstate/react @asyncflowstate/core
# For Next.js projects
pnpm add @asyncflowstate/next
```

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

---

## ✨ Key Features

- **🌐 Global Config:** Set default options app-wide with `FlowProvider`.
- **⛓️ Declarative Chaining:** Orchestrate complex workflows with `triggerOn` and `signals` instead of manual `useEffect`.
- **🌊 Streaming Support:** Native support for LLM/AI streaming using `AsyncIterable` or `ReadableStream`.
- **⚡ Parallel & Sequential:** Orchestrate multiple flows with aggregate state via `FlowParallel` and `FlowSequence`.
- **⏲️ Declarative Polling:** Built-in support for auto-refreshing actions with conditional stop logic.
- **💾 Smart Persistence:** Survive page refreshes and resume interrupted operations (file uploads, forms, etc.).
- **🛡️ Persistent Circuit Breaker:** Prevent cascading failures with cross-session state persistence.
- **📊 Visual Sequence Trace:** Real-time Timeline/Gantt view of all async activity with `FlowDebugger`.
- **🛠️ Form Recovery:** Automatically re-focus fields and restore validation errors after a page refresh.
- **🔔 Global Notifications:** Centralized success/error handling for all flows via `FlowNotificationProvider`.
- **🧩 Core Engine:** Lightweight runtime logic that works anywhere (Vanilla JS, Node, etc.).

---

## 📖 Learn More

- **[Examples](./examples)** - Check out full patterns for Login, File Uploads, Advanced Forms, and more.
- **[Core Package Documentation](./packages/core)** - The framework-agnostic engine API.
- **[React Package Documentation](./packages/react)** - Hooks, helpers, and accessibility components.

---

## 🧑‍💻 Contributing

We love contributions! Whether you're fixing a bug, improving documentation, or suggesting a new feature, your help is welcome.

1.  **Check for Issues**: Look at our [Issue Tracker](https://github.com/devhimanshuu/asyncflowstate/issues) to see if your idea or bug is already being addressed.
2.  **Follow the Guide**: Read our [Contributing Guide](./CONTRIBUTING.md) for local setup, development workflows, and coding standards.
3.  **Submit a PR**: When you're ready, use our [Pull Request Template](./PULL_REQUEST_TEMPLATE.md) to ensure your contribution meets our quality standards.

---

## 🛡️ Security Policy

We take the security of AsyncFlowState seriously. If you find a potential vulnerability, please do not open a public issue. Instead, follow the instructions in our [Security Policy](./SECURITY.md) to report it responsibly.

---

## ⚖️ Code of Conduct

To ensure a welcoming, diverse, and inclusive community, we adhere to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

---

## 📜 License

MIT © [AsyncFlowState Contributors](https://github.com/devhimanshuu/asyncflowstate)

---

> **"Stop rewriting the same async logic. Start building features."**
>
> AsyncFlowState solves async UI behavior once, correctly, and everywhere.
