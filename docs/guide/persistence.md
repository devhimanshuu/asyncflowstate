# Smart Persistence

<PersistenceAnimation />

Retain flow states across remounts or full page reloads seamlessly using internal persistence drivers.covery for interrupted operations.

## Use Cases

- **File uploads** — Resume uploads after accidental page refresh
- **Form data** — Recover form inputs the user had typed
- **Multi-step wizards** — Remember which step the user was on
- **Shopping carts** — Preserve pending checkout state

## Enabling Persistence

```ts
const flow = useFlow(uploadFile, {
  persistence: {
    key: "file-upload-flow",        // Unique storage key
    storage: "localStorage",       // "localStorage" | "sessionStorage"
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  },
});
```

## Form Recovery

Automatically re-focus fields and restore validation errors after a page refresh:

```tsx
const flow = useFlow(submitForm, {
  persistence: {
    key: "registration-form",
    storage: "sessionStorage",
    restoreFields: true,        // Restore form field values
    restoreErrors: true,         // Restore validation errors
    restoreFocus: true,          // Re-focus the last active field
  },
});
```

## Circuit Breaker

Prevent cascading failures by tracking failure rates across sessions:

```ts
const flow = useFlow(externalApiCall, {
  circuitBreaker: {
    failureThreshold: 5,     // Open after 5 failures
    resetTimeout: 30000,     // Try again after 30 seconds
    persistent: true,         // Track across page refreshes
  },
});

// Circuit states:
// "closed" — normal operation
// "open" — requests are blocked
// "half-open" — testing if service recovered
```

::: info
When the circuit is open, `flow.execute()` will immediately reject with a `CircuitOpenError` instead of hitting the failing service.
:::

## Manual State Export/Import

For time-travel debugging and error reproduction:

```ts
// Export current state
const stateJson = flow.exportState();
// Save to file, send to support, etc.

// Import and replay
flow.importState(stateJson);
// Replays the exact sequence of states for debugging
```
