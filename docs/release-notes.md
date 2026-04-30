# Release Notes

Stay informed about the evolution of **AsyncFlowState**. We're committed to building the most predictable, resilient, and developer-friendly async orchestration engine in the world.

---

## <i class="fa-solid fa-bolt-lightning text-brand mr-2"></i> v3.0.0 (Stable) — The "Next-Gen AI" Release

This release introduces the industry's first **AI-native and environment-aware** asynchronous orchestration engine. Version 3.0.0 transforms AsyncFlowState from a resilience library into an autonomous, self-optimizing framework.

### <i class="fa-solid fa-robot text-purple-500 mr-2"></i> Autonomous AI Optimizations

- **<i class="fa-solid fa-dna text-fuchsia-500 mr-2"></i> Flow DNA (Genetic Auto-Tuning):** Eliminates manual configuration. Flows analyze P95 latency and failure rates to continuously evolve their own timeouts, retries, and stale times in production.
- **<i class="fa-solid fa-bolt text-brand-1 mr-2"></i> Speculative Execution:** UI branch prediction. Renders optimistic and real execution paths in parallel, with smooth animated morphing upon server conflict.
- **<i class="fa-solid fa-face-smile text-pink-500 mr-2"></i> Emotional UX (Sentiment Analysis):** Automatically tracks rage-clicking, cursor hesitation, and form abandonment to dynamically throttle operations or simplify the UI for frustrated users.

### <i class="fa-solid fa-network-wired text-cyan-500 mr-2"></i> Distributed & Edge Architecture

- **<i class="fa-solid fa-share-nodes text-orange-500 mr-2"></i> Flow Mesh (Cross-Tab Coordination):** Tabs form a local P2P network using `BroadcastChannel`. Leader election ensures only one tab fetches data while followers read from the shared mesh cache.
- **<i class="fa-solid fa-server text-blue-500 mr-2"></i> Edge-First Native:** Runtime-aware execution. Automatically detects Cloudflare Workers, Vercel Edge, or Deno, utilizing the Edge Cache API and splitting workloads between client and edge.
- **<i class="fa-solid fa-handshake text-teal-500 mr-2"></i> Collaborative CRDT Flows:** Built-in Last-Writer-Wins (LWW) conflict resolution for real-time multiplayer applications, ensuring eventual consistency across all clients.

### <i class="fa-solid fa-cubes text-emerald-500 mr-2"></i> Advanced Execution Patterns

- **<i class="fa-solid fa-sitemap text-amber-500 mr-2"></i> Flow Choreography (DAG):** Declare complex, multi-step dependencies. The engine handles topological sorting (Kahn's algorithm), parallel execution, and partial failure rollbacks automatically.
- **<i class="fa-solid fa-thermometer-half text-green-500 mr-2"></i> Ambient Intelligence:** Flows monitor device telemetry (battery, CPU pressure, network type). Automatically defers heavy syncs on 2G networks or compresses payloads on low battery.

### <i class="fa-solid fa-vial text-blue-400 mr-2"></i> Enterprise DevTools

- **<i class="fa-solid fa-clock-rotate-left text-purple-500 mr-2"></i> Temporal Replay:** High-resolution lifecycle snapshots. Time-travel debug complex async race conditions by scrubbing back and forth through execution history.
- **<i class="fa-solid fa-chart-line text-red-500 mr-2"></i> Telemetry Dashboard:** A zero-dependency, Shadow DOM overlay providing real-time flame graphs, cache hit rates, and AI healing events directly in the browser.

### <i class="fa-solid fa-cubes text-emerald-500 mr-2"></i> New Framework Adapters

We have officially expanded our framework support from 6 to 9 adapters, introducing native bindings for:

- **Nuxt 3** (`@asyncflowstate/nuxt`)
- **Remix** (`@asyncflowstate/remix`)
- **Astro** (`@asyncflowstate/astro`)

---

## <i class="fa-solid fa-clock-rotate-left text-gray-400 mr-2"></i> v2.0.2 (Previous Stable) — The "Complete Ecosystem" Update

Expanded the ecosystem from 6 to 9 framework adapters (adding Nuxt, Remix, and Astro). Standardized A11y announcements and reactive options across all bindings.

---

## <i class="fa-solid fa-clock-rotate-left text-gray-400 mr-2"></i> v2.0.0 — The "Universal" Release

The v2.0 release was a complete ground-up rewrite of AsyncFlowState. It transformed the library from a React hook collection into a framework-agnostic **behavior engine** with native adapters for every modern frontend stack.

### <i class="fa-solid fa-microchip text-brand-1 mr-2"></i> The New Universal Architecture

- **Framework-Agnostic Core:** The logic engine is now 100% decoupled from the UI layer. This ensures identical behavior whether you're using React, Vue, or Angular.
- **Native Adapters:** Six specialized packages supporting **React, Next.js, Vue 3, Svelte, Angular, and SolidJS.**
- **Zero-Dependency:** The core engine remains lightweight with zero external dependencies, making it safe for any production environment.

### <i class="fa-solid fa-shield-halved text-emerald-500 mr-2"></i> Resilience Engineering

- **Dead Letter Queue (DLQ):** Failed operations are no longer lost. They are automatically pooled in the DLQ for manual retry or auditing.
- **Circuit Breakers:** Prevent cascading failures by automatically pausing flows when a downstream service is down. State persists across page refreshes.
- **Exponential Backoff:** Smart retry logic with jitter to protect your backend while improving success rates for users.

### <i class="fa-solid fa-wand-sparkles text-purple-400 mr-2"></i> Premium UX Patterns

- **<i class="fa-solid fa-bolt text-brand-1 mr-2"></i> Optimistic UI 2.0:** One-line implementation of "Success First" interactions. If the backend fails, AsyncFlowState performs a **Deep-Diff Rollback** of your local state automatically.
- **<i class="fa-solid fa-ghost text-slate-400 mr-2"></i> Ghost Queues:** Handle "spam-clicking" by queuing actions in the background. The UI remains responsive while the engine processes actions sequentially.
- **<i class="fa-solid fa-hourglass-half text-amber-500 mr-2"></i> Purgatory (Undo Support):** Configurable delay for destructive actions (like "Delete"). Provides a native "Undo" grace period before committing the async operation.
- **<i class="fa-solid fa-robot text-cyan-500 mr-2"></i> AI Skeletons:** Purpose-built loading states for AI/LLM streaming. Dynamically responds to partial `AsyncIterable` chunks as they arrive.
- **<i class="fa-solid fa-arrows-rotate text-blue-500 mr-2"></i> Cross-Tab Sync:** Your async state is now shared across browser tabs. If a "Save" succeeds in Tab A, the button state in Tab B updates instantly.

### <i class="fa-solid fa-vial text-blue-400 mr-2"></i> Developer Experience (DX)

- **Visual Time-Travel Debugger:** A new DevTools-style debugger to inspect flow history, inputs, outputs, and state transitions in real-time.
- **100% Type Safety:** Pure TypeScript implementation with advanced generics that infer your inputs and error types automatically.
- **Unified Configuration:** Set global behaviors (like global error handlers) via `FlowProvider` once, and every flow in your app inherits them.

---

## <i class="fa-solid fa-clock-rotate-left text-gray-400 mr-2"></i> Legacy Versions

### v1.x Series

_Focus: React Foundation_

- **v1.1.0:** Introduced `useFlowSequence` for multi-step async workflows.
- **v1.0.0:** Initial stable release. Solved double-submission and basic loading boilerplate.

### v0.x Series

_Focus: Internal Proof of Concept_

- Early prototypes used in high-traffic FinTech dashboard to manage complex form submissions and payment processing.

---

---

> **Note:** For a line-by-line technical breakdown of every commit, please visit our [GitHub Changelog](https://github.com/devhimanshuu/asyncflowstate/blob/main/CHANGELOG.md).
