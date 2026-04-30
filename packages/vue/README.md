<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/vue <span style="font-size: 14px; background: #10b98122; color: #10b981; padding: 4px 10px; border-radius: 20px; vertical-align: middle; margin-left: 10px;">v3.0.0 Stable</span></h1>
  <p><b>Official Vue 3 bindings for AsyncFlowState — the industry-standard engine for predictable async UI behavior.</b></p>

  <p>
    <a href="https://asyncflowstate-js.pages.dev/frameworks/vue"><img src="https://img.shields.io/badge/Documentation-Link-blue.svg" alt="Documentation" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License: MIT" /></a>
    <a href="https://www.npmjs.com/package/@asyncflowstate/vue"><img src="https://img.shields.io/npm/v/@asyncflowstate/vue?color=indigo" alt="NPM Version" /></a>
  </p>
</div>

## Installation

```bash
pnpm add @asyncflowstate/vue @asyncflowstate/core
```

## Quick Start

### Basic Usage

```vue
<script setup lang="ts">
import { useFlow } from "@asyncflowstate/vue";

const { loading, data, error, execute, button } = useFlow(
  async (id: string) => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  },
  {
    onSuccess: (user) => console.log("Fetched:", user.name),
    onError: (err) => console.error("Failed:", err),
  },
);
</script>

<template>
  <button v-bind="button()">
    {{ loading ? "Loading..." : "Fetch User" }}
  </button>
  <div v-if="data">{{ data.name }}</div>
  <div v-if="error">Error: {{ error.message }}</div>
</template>
```

### Form Handling with Validation

```vue
<script setup lang="ts">
import { useFlow } from "@asyncflowstate/vue";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
});

const { loading, fieldErrors, form } = useFlow(async (data: any) =>
  api.updateProfile(data),
);
</script>

<template>
  <form v-bind="form({ schema, extractFormData: true })">
    <input name="username" />
    <span v-if="fieldErrors.username">{{ fieldErrors.username }}</span>

    <input name="email" />
    <span v-if="fieldErrors.email">{{ fieldErrors.email }}</span>

    <button type="submit" :disabled="loading">Submit</button>
  </form>
</template>
```

### Global Configuration

```vue
<script setup lang="ts">
import { provideFlowConfig } from "@asyncflowstate/vue";

provideFlowConfig({
  onError: (err) => toast.error(err.message),
  retry: { maxAttempts: 3, backoff: "exponential" },
  loading: { minDuration: 300 },
});
</script>
```

### Sequential Workflows

```vue
<script setup lang="ts">
import { useFlowSequence } from "@asyncflowstate/vue";

const sequence = useFlowSequence([
  { name: "Validate", flow: validateFlow },
  { name: "Submit", flow: submitFlow, mapInput: (prev) => prev.data },
  { name: "Notify", flow: notifyFlow },
]);
</script>

<template>
  <button @click="sequence.execute()" :disabled="sequence.loading">
    Run Workflow
  </button>
  <p>Progress: {{ sequence.progress }}%</p>
</template>
```

### Parallel Execution

```vue
<script setup lang="ts">
import { useFlowParallel } from "@asyncflowstate/vue";

const parallel = useFlowParallel(
  { users: usersFlow, posts: postsFlow },
  "allSettled",
);
</script>
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** AI-driven behavior optimization.
- **Ambient Intelligence:** Background orchestration and failure pre-emption.
- **Speculative Execution:** Predicted user intent for instant reactivity.
- **Emotional UX:** Adaptive skeletons and transitions based on system load.
- **Collaborative Composables:** Sync state across users in real-time.
- **Edge-First Flows:** Native support for edge-optimized data fetching.
- **Temporal Replay:** Full time-travel through async state transitions.
- **Telemetry Dashboard:** Live monitoring of application health.

## Comprehensive Examples

### 1. The Classic: Optimistic UI with Deep-Diff Rollback

Update your UI instantly and trust AsyncFlowState to revert to the exact previous state if the network fails.

```vue
<script setup>
import { useFlow } from "@asyncflowstate/vue";

const { data, loading, execute, button } = useFlow(api.likePost, {
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
</script>

<template>
  <button v-bind="button({ onClick: () => execute(post.id) })">
    {{ data.isLiked ? "❤️" : "🤍" }} {{ data.likes }}
  </button>
</template>
```

### 2. Enterprise Forms: Zod Validation & Auto-Extraction

Stop manually mapping `v-model`. Use built-in schema validation and automatic focus management.

```vue
<script setup>
import { z } from "zod";
import { useFlow } from "@asyncflowstate/vue";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password too short"),
});

const { loading, fieldErrors, form, error } = useFlow(auth.login, {
  onSuccess: () => router.push("/dashboard"),
});
</script>

<template>
  <form v-bind="form({ schema, extractFormData: true, resetOnSuccess: true })">
    <input name="email" placeholder="Email" />
    <span v-if="fieldErrors.email" class="error">{{ fieldErrors.email }}</span>

    <input name="password" type="password" placeholder="Password" />
    <span v-if="fieldErrors.password" class="error">{{
      fieldErrors.password
    }}</span>

    <button type="submit" :disabled="loading">
      {{ loading ? "Logging in..." : "Login" }}
    </button>

    <div v-if="error" class="error-banner">{{ error.message }}</div>
  </form>
</template>
```

### 3. AI-Powered: Predictive Intent & Flow DNA

Pre-warm your flows before the user even clicks. AsyncFlowState learns from hover patterns to eliminate perceived latency.

```vue
<script setup>
import { useFlow } from "@asyncflowstate/vue";

const { status, execute, button } = useFlow(api.getDetails, {
  predictive: {
    prefetchOnHover: true, // Learns and pre-warms the flow
    threshold: 0.8, // Confidence threshold
  },
});
</script>

<template>
  <div @mouseenter="button().onMouseEnter" class="card">
    <h3>Product Details</h3>
    <button @click="execute(productId)">
      {{ status === "prewarmed" ? "Instant View" : "View Details" }}
    </button>
  </div>
</template>
```

### 4. Cross-Tab Sync: Real-Time Coordination

Keep your application state consistent across every open tab without a backend websocket.

```vue
<script setup>
const { loading, data } = useFlow(api.updateSettings, {
  // Syncs loading status and data across all tabs automatically
  crossTab: {
    sync: true,
    channel: "user-settings",
  },
});
</script>
```

### 5. Multi-Step Workflows: `useFlowSequence`

Manage complex, interdependent async steps with a single source of truth for progress and errors.

```vue
<script setup>
import { useFlowSequence } from "@asyncflowstate/vue";

const sequence = useFlowSequence([
  { name: "Create Account", flow: accountFlow },
  { name: "Verify Email", flow: emailFlow, mapInput: (acc) => acc.email },
  { name: "Sync Data", flow: syncFlow },
]);
</script>

<template>
  <div>
    <progress :value="sequence.progress" max="100" />
    <p>Current Step: {{ sequence.currentStep?.name }}</p>
    <button @click="sequence.execute()">Start Setup</button>
  </div>
</template>
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** AI-driven behavior optimization.
- **Ambient Intelligence:** Background orchestration and failure pre-emption.
- **Speculative Execution:** Predicted user intent for instant reactivity.
- **Emotional UX:** Adaptive skeletons and transitions based on system load.
- **Collaborative Composables:** Sync state across users in real-time.
- **Edge-First Flows:** Native support for edge-optimized data fetching.
- **Temporal Replay:** Full time-travel through async state transitions.
- **Telemetry Dashboard:** Live monitoring of application health.

## API Reference

| Composable                          | Description                                       |
| ----------------------------------- | ------------------------------------------------- |
| `useFlow(action, options?)`         | Core composable for managing async actions        |
| `useFlowSequence(steps)`            | Orchestrate sequential workflows                  |
| `useFlowParallel(flows, strategy?)` | Run flows in parallel                             |
| `useFlowList(action, options?)`     | Manage multiple keyed flow instances              |
| `useInfiniteFlow(action, options)`  | Manage paginated/infinite scrolling data fetching |
| `provideFlowConfig(config)`         | Provide global configuration via provide/inject   |

## License

MIT © [AsyncFlowState Contributors](https://github.com/devhimanshuu/asyncflowstate)
