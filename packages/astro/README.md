<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/astro <span style="font-size: 14px; background: #ff5d0122; color: #ff5d01; padding: 4px 10px; border-radius: 20px; vertical-align: middle; margin-left: 10px;">v3.0.0 Stable</span></h1>
  <p><b>Astro-optimized behavior orchestration for AsyncFlowState.</b></p>

  <p>
    <a href="https://asyncflowstate-js.pages.dev/frameworks/astro"><img src="https://img.shields.io/badge/Documentation-Link-blue.svg" alt="Documentation" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License: MIT" /></a>
    <a href="https://www.npmjs.com/package/@asyncflowstate/astro"><img src="https://img.shields.io/npm/v/@asyncflowstate/astro?color=indigo" alt="NPM Version" /></a>
  </p>
</div>

---

## Installation

```bash
pnpm add @asyncflowstate/astro @asyncflowstate/core
```

## Quick Start

### Basic Astro Action Flow

```tsx
import { createAstroFlow } from "@asyncflowstate/astro";

// Use within any Astro Island (React, Vue, Svelte, Solid)
const flow = createAstroFlow(async (data) => {
  return await actions.todo.create(data);
});
```

## Comprehensive Examples

### 1. Zero-Config Optimistic UI

Update your Astro Island state instantly while the background Action processes.

```tsx
const flow = createAstroFlow(actions.likePost, {
  optimisticResult: (prev) => ({ ...prev, liked: true }),
  rollbackOnError: true,
});
```

### 2. AI-Powered: Speculative Prefetching

Astro's static nature meets dynamic intent. Pre-warm your actions based on user hover intent.

```tsx
const flow = createAstroFlow(actions.getDetails, {
  predictive: { prefetchOnHover: true },
});

return (
  <button onMouseEnter={flow.prewarm} onClick={() => flow.execute()}>
    View Details
  </button>
);
```

### 3. Edge-First Flows

Native support for Astro on the Edge (Cloudflare, Vercel). Automatic detection of Edge runtime capabilities.

```tsx
const flow = createAstroFlow(apiAction, {
  edge: { cache: "force-cache" },
});
```

### 4. Cross-Island State Sync

Synchronize async state between different framework islands (e.g., React and Vue) on the same page.

```tsx
const flow = createAstroFlow(actions.updateProfile, {
  crossTab: { sync: true, channel: "astro-islands-mesh" },
});
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** Self-healing actions for Astro hybrid rendering.
- **Speculative Execution:** Predicted user intent for zero-latency interactions.
- **Ambient Intelligence:** Background monitoring for Astro island hydration.
- **Collaborative Mesh:** Real-time state synchronization across islands.
- **Edge-First Logic:** Optimized for Astro Edge middleware and adapters.
- **Telemetry Dashboard:** Live monitoring of Astro action performance.

## License

MIT © [AsyncFlowState Contributors](https://github.com/devhimanshuu/asyncflowstate)
