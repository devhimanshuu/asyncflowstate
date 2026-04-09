# Middleware & Interceptors

<MiddlewareAnimation />

Intercept lifecycle events at a global or local level for logging, error reporting, and automatic side effects.

## How Middleware Works

Middleware is an object with lifecycle hooks that can inspect (and in some cases modify) the flow execution. You can register middleware globally for all flows or locally for a single flow instance.

```ts
interface FlowMiddleware {
  onStart?: (args, context) => void | args;
  onSuccess?: (data, context) => void;
  onError?: (error, context) => void;
  onSettled?: (data, error, context) => void;
}
```

## Global Middleware

Register handlers that run for **every** async action in your application.

```ts
import { Flow } from "@asyncflowstate/core";

Flow.useGlobal({
  onStart: (args, { options }) => {
    console.log(`[Flow] Starting: ${options.debugName || "Unnamed"}`);
  },
  onError: (error) => {
    // Automatic Sentry/LogRocket reporting
    Sentry.captureException(error);
  },
});
```

## Local Middleware

Specific tracking for a single flow instance.

```ts
const { execute } = useFlow(saveProfile, {
  middleware: [
    {
      onSuccess: (data) => {
        toast.success(`Welcome back, ${data.name}!`);
      },
    },
  ],
});
```

## Practical Example: Analytics Interceptor

```ts
const analyticsMiddleware = {
  onSuccess: (data, { meta }) => {
    if (meta.event) {
      analytics.track(meta.event, data);
    }
  },
};

// Usage
const flow = useFlow(purchase, {
  middleware: [analyticsMiddleware],
  meta: { event: "purchase_completed" },
});
```

## Middleware Context

Every hook receives a `context` object containing:

- `meta`: Custom metadata attached to the flow.
- `options`: The full configuration used for that execution.
- `flowId`: Unique instance identifier.
