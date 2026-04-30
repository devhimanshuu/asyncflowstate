# Edge-First Data Fetching

This tutorial explores how to use the Edge-First execution feature in AsyncFlowState `v3.0.0` to run workflows optimally across edge networks like Cloudflare Workers or Vercel Edge.

## Prerequisites

- AsyncFlowState `v3.0.0`
- Familiarity with Edge runtimes (Vercel Edge, Cloudflare Workers, Deno)

## Step 1: Configuring the Edge Runtime

AsyncFlowState can automatically detect the edge runtime using the built-in `EdgeDetector`. We can conditionally setup caching.

```typescript
import { EdgeDetector, EdgeCache } from "@asyncflowstate/core/utils/edge";

const cache = new EdgeCache();

// This automatically connects to the native Cache API in Cloudflare/Deno
const isEdge = EdgeDetector.isEdge();
```

## Step 2: Handling Failovers

We can build a robust edge flow that attempts to fetch from the edge cache, falls back to the origin, and then gracefully handles origin failures using the Stale-While-Revalidate pattern.

```typescript
import { createFlow } from "@asyncflowstate/core";

const fetchUserAtEdge = createFlow(
  async (userId: string) => {
    // Let the edge feature handle the fetch
    const response = await fetch(`https://api.example.com/users/${userId}`);
    return response.json();
  },
  {
    edge: true, // Enables Edge-First features
    staleTime: 60000,
    rollbackOnError: true,
  },
);
```

## Step 3: Edge Caching

When running on an edge network, we can use the `EdgeCache` explicitly to cache expensive operations locally at the edge node.

```typescript
import { EdgeCache } from "@asyncflowstate/core/utils/edge";

const edgeCache = new EdgeCache();

export default {
  async fetch(request, env, ctx) {
    // 1. Try hitting the EdgeCache
    const cached = await edgeCache.get("heavy-data");
    if (cached) return new Response(JSON.stringify(cached));

    // 2. Perform the heavy work
    const data = await heavyComputation();

    // 3. Store securely at the Edge
    await edgeCache.set("heavy-data", data, 3600);
    return new Response(JSON.stringify(data));
  },
};
```

This guarantees that your heaviest flows are instantly delivered to users from the edge node closest to them.
