# Streaming & AI

<StreamingAnimation />

AsyncFlowState handles real-time streams seamlessly, treating streams as continuous async updates rather than single loading states.am`, making it perfect for LLM/AI integrations.

## Streaming with AsyncIterable

```ts
const flow = useFlow(async function* (prompt: string) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });

  let fullText = "";
  for await (const chunk of stream) {
    fullText += chunk.choices[0]?.delta?.content || "";
    yield fullText; // Each yield updates flow.data
  }
});
```

```tsx
<div>
  <button onClick={() => flow.execute("Explain React hooks")}>
    {flow.loading ? "Generating..." : "Ask AI"}
  </button>
  <div>{flow.data}</div> {/* Updates in real-time as chunks arrive */}
</div>
```

## Streaming with ReadableStream

```ts
const flow = useFlow(async (prompt: string) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
  return response.body; // ReadableStream
});
```

## Progress Tracking

For uploads, downloads, and long-running operations:

```ts
const flow = useFlow(
  async (file: File) => {
    return await uploadWithProgress(file, (progress) => {
      flow.setProgress(progress); // 0-100
    });
  }
);
```

```tsx
<div>
  <button onClick={() => flow.execute(file)}>Upload</button>
  {flow.loading && (
    <div className="progress-bar">
      <div style={{ width: `${flow.progress}%` }} />
    </div>
  )}
</div>
```

## Declarative Polling

Auto-refresh data with conditional stop logic:

```ts
const flow = useFlow(checkDeploymentStatus, {
  polling: {
    interval: 5000,       // Poll every 5 seconds
    stopWhen: (data) => data.status === "deployed",
  },
});

// Start polling
flow.startPolling(deploymentId);

// Stop manually
flow.stopPolling();
```

## AI Skeletons <i class="fa-solid fa-sparkles text-amber-500"></i>

If you know the schema of the data the LLM will eventually return, you can generate an intelligent streaming loading skeleton using the `streamAISkeleton` generator. This creates a realistic "building up" effect.

```ts
import { streamAISkeleton } from '@asyncflowstate/core';

const skeletonFlow = useFlow(async function* () {
  const stream = streamAISkeleton({
    schema: { name: 'string', age: 'number', connected: 'boolean' },
    streamingDelay: 50 // ms between chunks
  });

  for await (const piece of stream) {
    yield piece; 
  }
});

// Starts returning:
// { name: '█████████' }
// { name: '█████████', age: '000' }
// { name: '█████████', age: '000', connected: false }
```
