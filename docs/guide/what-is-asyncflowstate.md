# What is AsyncFlowState?

<div class="info custom-block">
  <p class="custom-block-title">TL;DR</p>
  <p>AsyncFlowState is a <strong>behavior orchestrator</strong> for async UI actions. It manages the <code>idle → loading → success → error → retry</code> lifecycle so you don't have to.</p>
</div>

## The Problem

Every modern application has async user actions: clicking buttons, submitting forms, saving data, deleting items, uploading files, or making payments.

Each of these actions follows the **same lifecycle**:

```
idle → loading → success → error → retry
```

But in real projects, this logic is re-written thousands of times. This leads to:

- **Double submission bugs** — user clicks twice before the first request completes
- **Inconsistent loading UX** — spinners everywhere, or nowhere
- **Error handling chaos** — forgotten catch blocks, messy state transitions
- **Boilerplate fatigue** — writing `setIsLoading(true)` on every function

## The Solution

AsyncFlowState provides a **standard, reusable engine** to control async UI behavior correctly and consistently.

| Feature                      | Manual                                                                       | AsyncFlowState                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Double submission prevention | <i class="fa-solid fa-circle-xmark text-red-500 mr-2"></i> Custom logic      | <i class="fa-solid fa-circle-check text-brand mr-2"></i> Built-in      |
| Retry with backoff           | <i class="fa-solid fa-circle-xmark text-red-500 mr-2"></i> Tedious           | <i class="fa-solid fa-circle-check text-brand mr-2"></i> One config    |
| Optimistic UI                | <i class="fa-solid fa-circle-xmark text-red-500 mr-2"></i> Complex           | <i class="fa-solid fa-circle-check text-brand mr-2"></i> One line      |
| Loading flash prevention     | <i class="fa-solid fa-circle-xmark text-red-500 mr-2"></i> setTimeout hacks  | <i class="fa-solid fa-circle-check text-brand mr-2"></i> `minDuration` |
| Error focus management       | <i class="fa-solid fa-circle-xmark text-red-500 mr-2"></i> Manual            | <i class="fa-solid fa-circle-check text-brand mr-2"></i> Automatic     |
| Accessibility (ARIA)         | <i class="fa-solid fa-circle-xmark text-red-500 mr-2"></i> Usually forgotten | <i class="fa-solid fa-circle-check text-brand mr-2"></i> Built-in      |

## What AsyncFlowState is NOT

It's important to understand what AsyncFlowState **does not** replace:

- **Not a data-fetching library** — It doesn't replace React Query or SWR. Those manage cache, backgrounds, and stale data.
- **Not a state manager** — It doesn't replace Redux, Zustand, or Pinia. Those manage global application state.
- **It's a behavior orchestrator** — It manages _how_ async actions behave in the UI.

::: tip Works alongside your stack
AsyncFlowState complements your existing tools. Use React Query for data fetching, Zustand for state, and AsyncFlowState for action behavior.
:::

## Package Ecosystem

AsyncFlowState is built as a modular monorepo:

| Package                                                                                           | Description                                 |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| <i class="fa-solid fa-microchip mr-2 text-brand/60"></i> `@asyncflowstate/core`                   | Framework-agnostic logic engine             |
| <i class="devicon-react-original colored mr-2 text-[1.1em]"></i> `@asyncflowstate/react`          | React hooks & accessibility helpers         |
| <i class="devicon-nextjs-plain colored mr-2 text-[1.1em] dark:invert"></i> `@asyncflowstate/next` | Next.js Server Actions & SSR integration    |
| <i class="devicon-vuejs-plain colored mr-2 text-[1.1em]"></i> `@asyncflowstate/vue`               | Vue 3 composables & provide/inject config   |
| <i class="devicon-svelte-plain colored mr-2 text-[1.1em]"></i> `@asyncflowstate/svelte`           | Svelte stores with `$` auto-subscription    |
| <i class="devicon-angularjs-plain colored mr-2 text-[1.1em]"></i> `@asyncflowstate/angular`       | Angular Observable/BehaviorSubject bindings |
| <i class="devicon-solidjs-plain colored mr-2 text-[1.1em]"></i> `@asyncflowstate/solid`           | SolidJS fine-grained reactive signals       |

## Key Features

- <i class="fa-solid fa-globe text-brand/60 mr-2"></i> **Global Config** — Set default options app-wide with `FlowProvider`
- <i class="fa-solid fa-link text-brand/60 mr-2"></i> **Declarative Chaining** — Orchestrate workflows with `triggerOn` and `signals`
- <i class="fa-solid fa-water text-brand/60 mr-2"></i> **Streaming Support** — Native `AsyncIterable` / `ReadableStream` support
- <i class="fa-solid fa-bolt-lightning text-brand/60 mr-2"></i> **Parallel & Sequential** — Aggregate state across multiple flows
- <i class="fa-solid fa-clock text-accent/60 mr-2"></i> **Declarative Polling** — Auto-refresh with conditional stop logic
- <i class="fa-solid fa-database text-brand/60 mr-2"></i> **Smart Persistence** — Resume interrupted operations across page refreshes
- <i class="fa-solid fa-shield-halved text-brand/60 mr-2"></i> **Circuit Breaker** — Prevent cascading failures with cross-session persistence
- <i class="fa-solid fa-chart-line text-accent/60 mr-2"></i> **Visual Debugger** — Real-time Timeline/Gantt view of async activity
- <i class="fa-solid fa-bell text-brand/60 mr-2"></i> **Global Notifications** — Centralized success/error handling for all flows
