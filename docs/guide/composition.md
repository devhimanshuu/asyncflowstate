# Flow Composition <i class="fa-solid fa-sparkles text-amber-500"></i>

<CompositionAnimation />

AsyncFlowState exposes functional composition utilities that allow you to stitch simple async actions into complex, robust workflows cleanly outside of standard React/Vue lifecycles.

## Utilities

### `pipe`

Passes the output of each function directly into the input of the next.

```ts
import { pipe } from "@asyncflowstate/core";

const fetchUserPosts = pipe(
  async (userId: string) => api.fetchUser(userId),
  async (user) => api.fetchPosts(user.id),
  async (posts) => posts.filter((p) => p.published),
);

// Returns a standard `Flow` instance
const result = await fetchUserPosts.execute("user-123");
```

### `chain`

Passes a shared context object through multiple middleware-like steps.

```ts
import { chain } from "@asyncflowstate/core";

const hydrateData = chain([
  async (ctx) => ({ ...ctx, user: await api.fetchUser(ctx.userId) }),
  async (ctx) => ({ ...ctx, profile: await api.fetchProfile(ctx.user.id) }),
]);

const finalCtx = await hydrateData.execute({ userId: "123" });
```

### `raceFlows` (Quantum Execution)

Executes multiple workflows and resolves instantly with whoever finishes first, ignoring the others. Also known as a "first-one-wins" strategy.

```ts
import { raceFlows } from "@asyncflowstate/core";

const fastestLoad = raceFlows(
  () => fetchFromCDN1(),
  () => fetchFromCDN2(),
  () => fetchFromCDN3(),
);
```

### `withFallback`

Provides an automatic fallback circuit if the primary action errors out.

```ts
import { withFallback } from "@asyncflowstate/core";

const resilientFetch = withFallback(
  fetchFromDatabase, // Tries this first
  fetchFromCache, // Reverts to this string if database fails
);
```
