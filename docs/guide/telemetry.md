---
outline: deep
---

# 📊 Telemetry Dashboard

<div class="tip custom-block" style="padding: 12px 20px; border-left: 4px solid #ef4444;">
A built-in, zero-dependency visual dashboard that renders as an overlay in development mode. Shows live flow states, execution timelines, cache hit rates, and AI healing events.
</div>

<TelemetryAnimation />

## The Concept

Instead of flooding your console with `console.log` statements, the **Telemetry Dashboard** injects a beautiful, isolated Shadow DOM overlay into your app. It provides a real-time flame graph of all async operations.

## Quick Start

Initialize the DevTools in your app's entry point (make sure to only run it in development):

```ts
import { FlowDevTools } from "@asyncflowstate/core";

if (process.env.NODE_ENV === "development") {
  FlowDevTools.init({
    position: "bottom-right",
    theme: "dark",
    features: {
      timeline: true,
      cacheInspector: true,
      meshMonitor: true,
      dnaViewer: true,
      aiLog: true,
    },
  });
}
```

## Dashboard Features

### Real-Time Timeline

A live-updating list of the last 20 executions. Shows:

- 🟡 Loading state (pulsing)
- 🟢 Success state (with exact ms latency)
- 🔴 Error state
- ↻ Retry counts

### Global Statistics

Calculates rolling statistics across all flows:

- Total Executions
- Success Rate (%)
- Average Latency (ms)
- Total Retry Count

## Keyboard Shortcuts

| Shortcut           | Action                      |
| ------------------ | --------------------------- |
| `Ctrl + Shift + F` | Toggle dashboard visibility |

## API Reference

### `FlowDevTools`

```ts
import { FlowDevTools } from "@asyncflowstate/core";

// Initialize
const tools = FlowDevTools.init();

// Toggle visibility manually
tools.toggle();

// Get raw statistics
const stats = tools.getStats();
// { totalExecutions: 42, successRate: 0.98, avgLatency: 150, totalRetries: 1 }

// Get all raw entries
const timeline = tools.getEntries();
```

## Security & Performance

- **Zero Style Leakage:** The dashboard uses Shadow DOM, so its CSS will never conflict with your app's styles (like Tailwind or Bootstrap).
- **Lightweight:** No external dependencies. Entirely built with vanilla DOM APIs.
- **Auto-Pruning:** Keeps only the last 100 entries in memory to ensure zero performance impact during long dev sessions.

## Configuration

| Option     | Type     | Default          | Description                          |
| ---------- | -------- | ---------------- | ------------------------------------ |
| `position` | `string` | `'bottom-right'` | Overlay placement (`top-left`, etc.) |
| `theme`    | `string` | `'dark'`         | `'dark'` or `'light'`                |
| `features` | `Object` | (all enabled)    | Toggle specific dashboard panels     |
