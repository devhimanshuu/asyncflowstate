# Core Engine

The core engine (`@asyncflowstate/core`) is a framework-agnostic state machine that powers every framework binding.

## Architecture

<div class="my-8 relative">
<div class="flex flex-col gap-4 max-w-[800px] mx-auto">
<!-- Top Layer: Application -->
<div class="p-6 rounded-2xl bg-linear-to-br from-(--vp-c-bg-soft) to-(--vp-c-bg) border-2 border-dashed border-(--vp-c-divider) text-center relative overflow-hidden group hover:border-brand/30 transition-all duration-300">
<div class="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
<span class="text-sm font-bold uppercase tracking-widest opacity-40 mb-2 block">Application Layer</span>
<h3 class="text-xl font-black tracking-tight">Your Application</h3>
</div>

<!-- Arrow Down -->
<div class="flex justify-center -my-2 relative z-10">
<div class="h-8 w-px bg-linear-to-b from-brand/50 to-transparent"></div>
</div>

<!-- Middle Layer: Framework Adapters -->
<div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
<div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-(--vp-c-bg-soft) border border-(--vp-c-divider) hover:border-brand/40 transition-all cursor-default group">
<i class="devicon-react-original colored text-xl group-hover:scale-110 transition-transform"></i>
<span class="text-[10px] font-bold uppercase tracking-tighter opacity-60">React</span>
</div>
<div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-(--vp-c-bg-soft) border border-(--vp-c-divider) hover:border-brand/40 transition-all cursor-default group">
<i class="devicon-nextjs-plain colored text-xl group-hover:scale-110 transition-transform dark:invert"></i>
<span class="text-[10px] font-bold uppercase tracking-tighter opacity-60">Next.js</span>
</div>
<div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-(--vp-c-bg-soft) border border-(--vp-c-divider) hover:border-brand/40 transition-all cursor-default group">
<i class="devicon-vuejs-plain colored text-xl group-hover:scale-110 transition-transform"></i>
<span class="text-[10px] font-bold uppercase tracking-tighter opacity-60">Vue</span>
</div>
<div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-(--vp-c-bg-soft) border border-(--vp-c-divider) hover:border-brand/40 transition-all cursor-default group">
<i class="devicon-svelte-plain colored text-xl group-hover:scale-110 transition-transform"></i>
<span class="text-[10px] font-bold uppercase tracking-tighter opacity-60">Svelte</span>
</div>
<div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-(--vp-c-bg-soft) border border-(--vp-c-divider) hover:border-brand/40 transition-all cursor-default group">
<i class="devicon-angularjs-plain colored text-xl group-hover:scale-110 transition-transform"></i>
<span class="text-[10px] font-bold uppercase tracking-tighter opacity-60">Angular</span>
</div>
<div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-(--vp-c-bg-soft) border border-(--vp-c-divider) hover:border-brand/40 transition-all cursor-default group">
<i class="devicon-solidjs-plain colored text-xl group-hover:scale-110 transition-transform"></i>
<span class="text-[10px] font-bold uppercase tracking-tighter opacity-60">SolidJS</span>
</div>
</div>

<!-- Arrow Down Group -->
<div class="flex justify-center -my-2 relative z-10">
<div class="h-8 w-px bg-linear-to-b from-brand/50 to-transparent"></div>
</div>

<!-- Core Engine Layer -->
<div class="p-8 rounded-3xl bg-linear-to-br from-brand/10 to-accent/5 border-2 border-brand/20 relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(99,102,241,0.15)]">
<div class="absolute -top-24 -right-24 w-64 h-64 bg-brand/10 rounded-full blur-3xl group-hover:bg-brand/20 transition-all"></div>

<div class="flex items-center gap-3 mb-8">
<div class="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white shadow-lg shadow-brand/30">
<i class="fa-solid fa-microchip"></i>
</div>
<div>
<h4 class="text-lg font-black tracking-tight">@asyncflowstate/core</h4>
<p class="text-[10px] font-bold uppercase tracking-widest opacity-40">Framework Agnostic Foundation</p>
</div>
</div>

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div class="p-5 rounded-2xl bg-(--vp-c-bg) border border-brand/10 shadow-sm hover:border-brand/40 transition-all group/item">
<div class="flex items-center gap-3 mb-2">
<div class="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-sm group-hover/item:bg-brand group-hover/item:text-white transition-all">
<i class="fa-solid fa-gears"></i>
</div>
<span class="font-bold text-sm">Flow Engine</span>
</div>
<p class="text-xs opacity-50 leading-relaxed">The high-level orchestrator for async processes.</p>
</div>
<div class="p-5 rounded-2xl bg-(--vp-c-bg) border border-brand/10 shadow-sm hover:border-brand/40 transition-all group/item">
<div class="flex items-center gap-3 mb-2">
<div class="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-sm group-hover/item:bg-brand group-hover/item:text-white transition-all">
<i class="fa-solid fa-code-branch"></i>
</div>
<span class="font-bold text-sm">State Machine</span>
</div>
<p class="text-xs opacity-50 leading-relaxed">Transition logic (idle → loading → success/error).</p>
</div>
<div class="p-5 rounded-2xl bg-(--vp-c-bg) border border-brand/10 shadow-sm hover:border-brand/40 transition-all group/item">
<div class="flex items-center gap-3 mb-2">
<div class="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-sm group-hover/item:bg-brand group-hover/item:text-white transition-all">
<i class="fa-solid fa-shield"></i>
</div>
<span class="font-bold text-sm">Concurrency Ctrl</span>
</div>
<p class="text-xs opacity-50 leading-relaxed">Keep, restart, or enqueue concurrent executions.</p>
</div>
<div class="p-5 rounded-2xl bg-(--vp-c-bg) border border-brand/10 shadow-sm hover:border-brand/40 transition-all group/item">
<div class="flex items-center gap-3 mb-2">
<div class="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-sm group-hover/item:bg-brand group-hover/item:text-white transition-all">
<i class="fa-solid fa-rotate"></i>
</div>
<span class="font-bold text-sm">Retry & UX Logic</span>
</div>
<p class="text-xs opacity-50 leading-relaxed">Auto-retries, backoff, and minDuration polish.</p>
</div>
</div>
</div>
</div>
</div>

## The Flow Class

The `Flow` class is the foundation of everything. It wraps any async function and manages its lifecycle.

```ts
import { Flow } from "@asyncflowstate/core";

const saveFlow = new Flow(async (data: FormData) => {
  const response = await fetch("/api/save", {
    method: "POST",
    body: data,
  });
  return response.json();
});

// Execute
const result = await saveFlow.execute(formData);

// Check state
console.log(saveFlow.status); // "idle" | "loading" | "success" | "error"
console.log(saveFlow.data); // Last successful result
console.log(saveFlow.error); // Last error, if any
```

## State Lifecycle

Every flow follows a predictable state machine:

<div class="my-12 flex flex-col items-center gap-6 max-w-[800px] mx-auto overflow-x-auto pb-4">
<div class="flex items-center gap-4 sm:gap-8 min-w-max">

<!-- Idle State -->
<div class="flex flex-col items-center gap-3">
<div class="w-20 h-20 rounded-full bg-(--vp-c-bg-soft) border-2 border-(--vp-c-divider) flex items-center justify-center text-xl opacity-50">
<i class="fa-solid fa-moon"></i>
</div>
<span class="text-xs font-bold uppercase tracking-widest opacity-50">Idle</span>
</div>

<!-- Arrow -->
<div class="flex flex-col items-center pt-2">
<i class="fa-solid fa-arrow-right text-brand opacity-30"></i>
<span class="text-[9px] font-bold uppercase tracking-tighter opacity-30 mt-1">execute()</span>
</div>

<!-- Loading State -->
<div class="flex flex-col items-center gap-3">
<div class="w-20 h-20 rounded-full bg-brand/10 border-2 border-brand/30 flex items-center justify-center text-xl text-brand shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] relative">
<i class="fa-solid fa-spinner fa-spin"></i>
</div>
<span class="text-xs font-bold uppercase tracking-widest text-brand">Loading</span>
</div>

<!-- Forking Arrows -->
<div class="flex flex-col justify-center h-20 gap-8">
<div class="flex items-center gap-2">
<i class="fa-solid fa-arrow-right text-green-500 opacity-40"></i>
<span class="text-[9px] font-bold uppercase tracking-tighter opacity-40">Success</span>
</div>
<div class="flex items-center gap-2">
<i class="fa-solid fa-arrow-right text-red-500 opacity-40"></i>
<span class="text-[9px] font-bold uppercase tracking-tighter opacity-40 text-red-500">Error</span>
</div>
</div>

<!-- End States -->
<div class="flex flex-col gap-6">
<div class="flex flex-col items-center gap-3">
<div class="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center text-lg text-green-500">
<i class="fa-solid fa-circle-check"></i>
</div>
<span class="text-[10px] font-bold uppercase tracking-widest text-green-500/60">Success</span>
</div>
<div class="flex flex-col items-center gap-3">
<div class="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-lg text-red-500">
<i class="fa-solid fa-circle-exclamation"></i>
</div>
<span class="text-[10px] font-bold uppercase tracking-widest text-red-500/60">Error</span>
</div>
</div>
</div>

<!-- Recovery Loop -->
<div class="flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-30 mt-2">
<div class="h-px w-32 bg-linear-to-r from-transparent via-(--vp-c-divider) to-transparent"></div>
<div class="flex items-center gap-2">
<i class="fa-solid fa-rotate-left"></i> reset() or retry
</div>
<div class="h-px w-32 bg-linear-to-r from-transparent via-(--vp-c-divider) to-transparent"></div>
</div>
</div>

## Flow Options

```ts
interface FlowOptions<TInput, TOutput> {
  // Callbacks
  onSuccess?: (data: TOutput) => void;
  onError?: (error: Error) => void;
  onStart?: (input: TInput) => void;

  // Retry
  retry?: {
    maxAttempts?: number; // default: 1 (no retry)
    delay?: number; // default: 1000ms
    backoff?: "fixed" | "linear" | "exponential";
    shouldRetry?: (error: Error, attempt: number) => boolean;
  };

  // Concurrency
  concurrency?: "keep" | "restart" | "enqueue";

  // UX Polish
  loading?: {
    minDuration?: number; // Minimum loading time (prevents flashes)
    delay?: number; // Delay before showing loading state
  };

  // Auto Reset
  autoReset?: {
    enabled?: boolean;
    delay?: number; // ms after success to reset to idle
  };

  // Optimistic UI
  optimisticResult?: TOutput;

  // Rate limiting
  debounce?: number;
  throttle?: number;
}
```

## Subscribing to Changes

The core engine uses a pub/sub model for framework integration:

```ts
const flow = new Flow(fetchData);

// Subscribe to state changes
const unsubscribe = flow.subscribe((state) => {
  console.log("Status:", state.status);
  console.log("Data:", state.data);
  console.log("Error:", state.error);
  console.log("Loading:", state.loading);
});

// Execute
await flow.execute();

// Cleanup
unsubscribe();
```

## Parallel Execution

Run multiple flows simultaneously with aggregated state:

```ts
import { FlowParallel } from "@asyncflowstate/core";

const parallel = new FlowParallel([
  new Flow(fetchUsers),
  new Flow(fetchPosts),
  new Flow(fetchComments),
]);

const results = await parallel.execute();
// All three complete — results is an array of outputs
```

## Sequential Execution

Chain flows where each step depends on the previous:

```ts
import { FlowSequence } from "@asyncflowstate/core";

const sequence = new FlowSequence([
  { name: "Validate", flow: validateFlow },
  { name: "Upload", flow: uploadFlow, mapInput: (prev) => prev.fileId },
  { name: "Notify", flow: notifyFlow, mapInput: (prev) => prev.url },
]);

const finalResult = await sequence.execute(initialData);
```

## Using Without a Framework

The core engine works in any JavaScript environment:

```ts
// Node.js, Deno, Bun, Workers, etc.
import { Flow } from "@asyncflowstate/core";

const migration = new Flow(
  async (batchSize: number) => {
    return await db.migrate({ limit: batchSize });
  },
  {
    retry: { maxAttempts: 3, backoff: "exponential" },
    onSuccess: (result) => console.log(`Migrated ${result.count} records`),
    onError: (err) => console.error("Migration failed:", err),
  },
);
await migration.execute(1000);
```

## Best Practices

Directly using the core engine requires disciplining your application architecture. Follow these standards to extract the maximum value from AsyncFlowState.

### <i class="fa-solid fa-sitemap text-brand-1 mr-2"></i> Architectural Patterns

::: tip Decouple from Frameworks
Define your `Flow` instances in a shared service or controller layer, not just inside your components. Using `@asyncflowstate/core` outside of your UI allows you to test your business logic in isolation using standard unit testing tools like Vitest or Jest.
:::

::: tip The "Engine" Mindset
Think of a Flow as a "behavior wrapper" around an async operation. Instead of passing handlers down multiple levels of props, pass the Flow instance itself. Your components can then independently subscribe to the same engine state.
:::

### <i class="fa-solid fa-layer-group text-cyan-500 mr-2"></i> Concurrency Control

::: info Choosing the Right Strategy

- **`keep`**: Best for initial data fetches (if already loading, don't start another).
- **`restart`**: Best for search-as-you-type (abandon previous request for the newest one).
- **`enqueue`**: Best for sequential task processing (like "Upload Image" batching).
  :::

::: warning Avoid "Ghost" Executions
If you are manually subscribing to a Flow, always call the `unsubscribe()` function when your component unmounts or your process ends. While framework adapters (React, Vue) handle this for you, direct core usage requires manual cleanup to prevent memory leaks.
:::

### <i class="fa-solid fa-triangle-exclamation text-amber-500 mr-2"></i> Error Management

::: info State vs Exceptions
AsyncFlowState captures errors in `flow.error`. However, `flow.execute()` still returns a Promise that will **reject** on error by default. This ensures standard `try/catch` or `.catch()` logic still works while the UI automatically updates.
:::

::: tip Use `shouldRetry` for Logic
Don't retry everything. Use the `shouldRetry` callback to inspect the error. For example, you should retry on `503 Service Unavailable`, but never on `401 Unauthorized` or `400 Bad Request`.
:::
