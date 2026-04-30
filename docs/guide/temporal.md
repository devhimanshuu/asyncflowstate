---
outline: deep
---

# ⏳ Temporal Replay

<div class="tip custom-block" style="padding: 12px 20px; border-left: 4px solid #8b5cf6;">
Record the entire flow lifecycle as a <strong>replayable timeline</strong>. Scrub forward and backward through time, seeing exact state snapshots at any point.
</div>

<TemporalAnimation />

## The Concept

Debugging async bugs is hard because they're temporal — timing matters. **Temporal Replay** captures every state transition with high-resolution timestamps, letting you scrub through flow history like a video.

## Quick Start

```ts
const { data, execute } = useFlow(checkout, {
  temporal: {
    record: true,
    maxSnapshots: 200,
    includeArgs: true,
  },
});
```

## Time-Travel API

```ts
import { TemporalRecorder } from "@asyncflowstate/core";

const recorder = new TemporalRecorder("checkout", { record: true });

// After several executions...
const timeline = recorder.getTimeline();
// [{ index: 0, trigger: 'start', state: {...}, delta: 0 }, ...]

// Scrub to any point
const snapshot = recorder.scrubTo(5);
console.log(snapshot.state); // Exact state at snapshot #5

// Step forward/backward
recorder.stepForward();
recorder.stepBackward();

// Async playback at 2x speed
for await (const frame of recorder.playback(2)) {
  renderState(frame.state);
}
```

## Export & Share

```ts
const exported = recorder.export();
// {
//   flowName: 'checkout',
//   totalDuration: 3200,
//   snapshotCount: 15,
//   snapshots: [...]
// }

// Share as JSON for bug reports
const json = JSON.stringify(exported);
```

## Snapshot Contents

Each snapshot captures:

| Field       | Description                                                            |
| ----------- | ---------------------------------------------------------------------- |
| `index`     | Monotonic counter                                                      |
| `timestamp` | High-resolution `performance.now()` value                              |
| `state`     | Deep clone of the flow state at this moment                            |
| `trigger`   | What caused this snapshot (`start`, `success`, `error`, `retry`, etc.) |
| `delta`     | Milliseconds since previous snapshot                                   |
| `args`      | Optional action arguments (if `includeArgs: true`)                     |

## Performance

Snapshots use `structuredClone()` for isolation. The recorder enforces a `maxSnapshots` limit (default: 200) to prevent memory issues.
