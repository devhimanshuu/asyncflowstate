# AsyncFlowState

> **AsyncFlowState — the async UI behavior engine**

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

| Package                                     | Version  | Description                               |
| :------------------------------------------ | :------- | :---------------------------------------- |
| [`@asyncflowstate/core`](./packages/core)   | `1.0.0`  | Framework-agnostic logic engine           |
| [`@asyncflowstate/react`](./packages/react) | `1.0.0`  | React hooks & accessibility-first helpers |
| `@asyncflowstate/next`                      | `(v2.0)` | Planned: Server Actions & SSR integration |

---

## 🚀 Quick Start (React)

### 1. Installation

```bash
npm install @asyncflowstate/react
# or
pnpm add @asyncflowstate/react
```

### 2. Basic Usage

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

### 3. Form Handling

```tsx
function ProfileForm() {
  const flow = useFlow(updateProfile);

  return (
    <form {...flow.form()}>
      <input name="username" />
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

- **🛡️ Advanced Concurrency Control:** Prevent double-submissions with `keep`, `restart`, or `enqueue` strategies. Built-in `debounce` and `throttle` support.
- **🔄 Resilience Engine:** Automatic retries with configurable delay and backoff (Fixed, Linear, Exponential).
- **🎯 Lifecycle Hooks:** Complete control with `onStart`, `onSuccess`, `onError`, `onRetry`, `onCancel`, and `onSettled` callbacks.
- **⚡ Optimistic UI:** Instantly update data while waiting for the server.
- **♿ A11y First:** Built-in ARIA live regions, focus management for errors, and accessibility-first helpers.
- **📝 Pro Forms:** Automated `FormData` extraction, field validation hooks, and success-auto-reset.
- **🎨 UX Polish:** Prevent UI flashes with `minDuration` and `delay` options.
- **📊 Progress Tracking:** Built-in progress state for long-running tasks.
- **💾 Persistence:** Automatically persist success data to `localStorage` or `sessionStorage` with `persistKey`.
- **🏃 Fake Progress:** Simulate progress for actions that don't support it natively with `autoProgress`.
- **🌐 Global Config:** Set default options app-wide with `FlowProvider` (v1.1+).
- **🧩 Core Engine:** Lightweight runtime logic that works anywhere (Vanilla JS, Node, etc.).

---

## 📖 Learn More

- **[Examples](./examples)** - Check out full patterns for Login, File Uploads, Advanced Forms, and more.
- **[Core Package Documentation](./packages/core)** - The framework-agnostic engine API.
- **[React Package Documentation](./packages/react)** - Hooks, helpers, and accessibility components.

---

## 🧑‍💻 Contributing

We are currently in **🚧 Early development**. If you're interested in contributing or have feedback, please open an issue or a discussion.

---

## 📜 License

MIT © [AsyncFlowState Contributors](https://github.com/asyncflowstate/asyncflowstate)

---

> **"Stop rewriting the same async logic. Start building features."**
>
> AsyncFlowState solves async UI behavior once, correctly, and everywhere.
