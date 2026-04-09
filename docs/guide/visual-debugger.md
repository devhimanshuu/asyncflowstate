# Visual Debugger & Time-Travel

<DebuggerAnimation />

AsyncFlowState provides built-in hooks and history tracking for building high-fidelity visual debuggers.

## Timeline Tracking

The `Flow.onEvent` listener captures every state transition across all instances in real-time, allowing you to build a timeline/Gantt view of your application's async activity.

```ts
import { Flow } from "@asyncflowstate/core";

// Register global listener
Flow.onEvent((event) => {
  // Capture: flowId, flowName, type ('start' | 'success' | 'error'), timestamp, state
  console.log(
    `[Debugger] ${event.flowName}: ${event.type} at ${event.timestamp}`,
  );

  // Custom Gantt/Timeline logic goes here
  dashboard.addEvent(event);
});
```

## State History (Time-Travel)

By default, every flow instance maintains its own history of state transitions, enabling you to inspect or even replay previous states for debugging purposes.

```ts
const { history, exportState, importState } = useFlow(searchData);

// 1. Export full current state (including history)
const stateJson = exportState();

// 2. Clear state history manually
flow.clearHistory();

// 3. Import and replay for debugging
importState(stateJson);
```

## Practical Example: Error Reproduction

When a production error occurs, you can automatically export the full flow state and send it to your error tracker (e.g. Sentry).

```ts
const flow = useFlow(saveProfile, {
  onError: () => {
    // Export full history of what led to this failure
    const diagnosticPayload = flow.exportState();
    Sentry.captureException(flow.error, {
      extra: { diagnosticPayload },
    });
  },
});
```

## Memory Management

To prevent memory leaks in production, the state history is limited to 50 events per flow by default. You can configure this globally or per-instance.

```ts
const flow = useFlow(action, {
  historyLimit: 100, // Retain last 100 transitions
});
```

## Visual Debugger UI

While you can build your own using the `onEvent` hook, AsyncFlowState will soon provide an official browser extension and standalone component for real-time visualization of your flows. Stay tuned for v2.1.0!
