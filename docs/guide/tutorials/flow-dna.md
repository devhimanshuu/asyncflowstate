# Mastering Flow DNA

In this tutorial, we will learn how to leverage the new Flow DNA feature to inject AI-driven context and predictive execution into our workflows. Flow DNA allows you to uniquely fingerprint and optimize flows based on runtime characteristics.

## Prerequisites

- AsyncFlowState `v3.0.0`
- Basic understanding of core flow concepts

## Step 1: Initializing Flow DNA

First, we need to initialize the Flow DNA plugin in our application setup.

```typescript
import { FlowManager, FlowDNAPlugin } from "@asyncflowstate/core";

// Initialize the FlowManager with the DNA plugin
const manager = new FlowManager({
  plugins: [
    new FlowDNAPlugin({
      fingerprintStrategy: "advanced",
      learningRate: 0.8,
    }),
  ],
});
```

## Step 2: Training the Engine

Next, let's create a flow that uses DNA to learn from its execution environment. The engine will track execution times and optimize when this flow is run.

```tsx
import { useFlow } from "@asyncflowstate/react";

function SmartSearch() {
  const { execute, data, isLoading } = useFlow(
    async (query: string) => {
      const response = await fetch(`/api/search?q=${query}`);
      return response.json();
    },
    {
      dna: {
        id: "search-flow-dna",
        // The flow will automatically learn the optimal debounce time
        autoOptimize: true,
      },
    },
  );

  return (
    <div>
      <input
        type="text"
        onChange={(e) => execute(e.target.value)}
        placeholder="Search..."
      />
      {isLoading ? (
        <p>Loading intelligently...</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
```

## Step 3: Predictive Workflows

Once Flow DNA has learned the patterns, you can enable predictive execution. This will speculatively execute the flow before the user even triggers it.

```tsx
import { usePredictiveFlow } from "@asyncflowstate/react";

function UserProfile({ userId }) {
  const { data } = usePredictiveFlow(async () => fetchUser(userId), {
    dnaId: "user-profile-dna",
    predictive: true,
    confidenceThreshold: 0.9,
  });

  // Flow DNA might have already fetched this before the component mounts!
  return <div>{data?.name}</div>;
}
```

This ensures your app feels instantly responsive, leaning on the data from previous sessions and smart ML-based prediction.
