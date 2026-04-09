# Configuration

<ConfigAnimation />

AsyncFlowState offers a layered configuration system: sensible defaults, global overrides, and per-flow customization.

## Configuration Hierarchy

<div class="flex items-center gap-2 text-sm font-semibold opacity-60 bg-(--vp-c-bg-soft) p-4 rounded-xl border border-(--vp-c-divider)">
  <span>Defaults</span>
  <i class="fa-solid fa-chevron-right text-[10px] opacity-40"></i>
  <span>Global (FlowProvider)</span>
  <i class="fa-solid fa-chevron-right text-[10px] opacity-40"></i>
  <span>Local (Hook)</span>
  <i class="fa-solid fa-chevron-right text-[10px] opacity-40"></i>
  <span>Runtime (setOptions)</span>
</div>

Each layer overrides the previous one. Local options merge with global options by default.

## Global Configuration

### React — FlowProvider

```tsx
import { FlowProvider } from "@asyncflowstate/react";

function App() {
  return (
    <FlowProvider
      config={{
        // Error handler for all flows
        onError: (err) => toast.error(err.message),

        // Default retry for all flows
        retry: {
          maxAttempts: 3,
          delay: 1000,
          backoff: "exponential",
        },

        // UX polish
        loading: {
          minDuration: 400, // No loading flashes
        },

        // Auto-reset after success
        autoReset: {
          enabled: true,
          delay: 5000,
        },

        // Override mode: "merge" (default) or "replace"
        overrideMode: "merge",
      }}
    >
      <YourApp />
    </FlowProvider>
  );
}
```

### Vue — provide/inject

```ts
import { provideFlowConfig } from "@asyncflowstate/vue";

// In setup
provideFlowConfig({
  retry: { maxAttempts: 2 },
  loading: { minDuration: 300 },
});
```

## Override Modes

### Merge (Default)

Local options are **deep-merged** with global options. Local values override global for keys that exist locally; global keys not present locally are inherited.

```tsx
// Global
<FlowProvider config={{ retry: { maxAttempts: 3, delay: 1000 } }}>

// Local — inherits delay: 1000, overrides maxAttempts
const flow = useFlow(action, {
  retry: { maxAttempts: 5 },
});
// Effective: { maxAttempts: 5, delay: 1000 }
```

### Replace

When `overrideMode: "replace"` is set, local options **completely replace** global options if any local options exist.

```tsx
<FlowProvider config={{
  retry: { maxAttempts: 3, delay: 1000 },
  overrideMode: "replace"
}}>

const flow = useFlow(action, {
  retry: { maxAttempts: 1 },
});
// Effective: { maxAttempts: 1 } — delay is NOT inherited
```

## Nested Providers

You can nest `FlowProvider` components for section-specific defaults:

```tsx
<FlowProvider config={{ retry: { maxAttempts: 1 } }}>
  {/* Regular section — 1 retry */}
  <RegularSection />

  <FlowProvider config={{ retry: { maxAttempts: 5, backoff: "exponential" } }}>
    {/* Critical section — 5 retries with exponential backoff */}
    <PaymentSection />
  </FlowProvider>
</FlowProvider>
```

## All Configuration Options

### Core Options

| Option             | Type                               | Default  | Description                         |
| ------------------ | ---------------------------------- | -------- | ----------------------------------- |
| `onSuccess`        | `(data) => void`                   | —        | Called after successful execution   |
| `onError`          | `(error) => void`                  | —        | Called after failed execution       |
| `onStart`          | `(input) => void`                  | —        | Called when execution begins        |
| `concurrency`      | `"keep" \| "restart" \| "enqueue"` | `"keep"` | How to handle concurrent calls      |
| `debounce`         | `number`                           | —        | Debounce delay in ms                |
| `throttle`         | `number`                           | —        | Throttle delay in ms                |
| `optimisticResult` | `TOutput`                          | —        | Optimistic result shown immediately |

### Retry Options

| Option              | Type                                   | Default   | Description                     |
| ------------------- | -------------------------------------- | --------- | ------------------------------- |
| `retry.maxAttempts` | `number`                               | `1`       | Maximum execution attempts      |
| `retry.delay`       | `number`                               | `1000`    | Base delay between retries (ms) |
| `retry.backoff`     | `"fixed" \| "linear" \| "exponential"` | `"fixed"` | Backoff strategy                |
| `retry.shouldRetry` | `(error, attempt) => boolean`          | —         | Custom retry predicate          |

### Loading Options

| Option                | Type     | Default | Description                       |
| --------------------- | -------- | ------- | --------------------------------- |
| `loading.minDuration` | `number` | `0`     | Minimum loading display time (ms) |
| `loading.delay`       | `number` | `0`     | Delay before showing loading (ms) |

### Auto-Reset Options

| Option              | Type      | Default | Description                     |
| ------------------- | --------- | ------- | ------------------------------- |
| `autoReset.enabled` | `boolean` | `false` | Enable auto-reset after success |
| `autoReset.delay`   | `number`  | `3000`  | Delay before reset (ms)         |

### React-Specific Options

| Option                 | Type                          | Default    | Description                   |
| ---------------------- | ----------------------------- | ---------- | ----------------------------- |
| `a11y.announceSuccess` | `string \| (data) => string`  | —          | Screen reader success message |
| `a11y.announceError`   | `string \| (error) => string` | —          | Screen reader error message   |
| `a11y.liveRegionRel`   | `"polite" \| "assertive"`     | `"polite"` | Live region politeness        |

## Dynamic Configuration

Update options at runtime:

```ts
const flow = useFlow(action, { retry: { maxAttempts: 1 } });

// Later, based on user preference or feature flag
flow.setOptions({
  retry: { maxAttempts: 5, backoff: "exponential" },
});
```

## Environment-Specific Config

```tsx
const config = {
  development: {
    loading: { minDuration: 0 },      // Fast in dev
    retry: { maxAttempts: 1 },         // No retries in dev
  },
  production: {
    loading: { minDuration: 500 },     // Polished UX
    retry: { maxAttempts: 3, backoff: "exponential" },
    onError: (err) => errorReporter.capture(err),
  },
};

<FlowProvider config={config[process.env.NODE_ENV]}>
```
