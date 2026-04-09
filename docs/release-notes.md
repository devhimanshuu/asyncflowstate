# Release Notes

Stay informed about the evolution of **AsyncFlowState**. We're committed to building the most predictable, resilient, and developer-friendly async orchestration engine in the world.

---

## <i class="fa-solid fa-star text-amber-400 mr-2"></i> v2.0.0 (Stable) — The "Universal" Release

**Released on April 15, 2026**

The v2.0 release is a complete ground-up rewrite of AsyncFlowState. It transforms the library from a React hook collection into a framework-agnostic **behavior engine** with native adapters for every modern frontend stack.

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
