# Dead Letter Queue <i class="fa-solid fa-sparkles text-amber-500"></i>

<DLQAnimation />

When actions fail permanently (after all retry attempts are exhausted), AsyncFlowState automatically captures the failure context and securely stores it in a **Dead Letter Queue (DLQ)**. 

This allows you to easily build internal dashboards to inspect failed actions, export failure logs for debugging, or replay intercepted failures later.

## Quick Start

Activate the DLQ by setting `deadLetter: true` in your flow configuration.

```ts
import { useFlow } from '@asyncflowstate/react';

const { loading } = useFlow(submitOrder, {
  retry: { maxAttempts: 3 },
  deadLetter: true, // Failures will be stored in the DLQ
  meta: { user: 123 }, // Metadata is preserved in the DLQ
});
```

## Accessing the Dead Letter Queue

You can interact with the global `DeadLetterQueue` to inspect or replay failed actions.

```ts
import { DeadLetterQueue } from '@asyncflowstate/core';

const dlq = DeadLetterQueue.getInstance();

// Subscribe to state changes 
dlq.subscribe((entries) => {
  console.log('Failed actions:', entries);
});

// Access the entries manually
const entries = dlq.getAll();

/*
[
  {
    "id": "abc123xyz",
    "args": [{ orderId: 99 }],
    "error": "Network timeout",
    "timestamp": "2026-04-07T12:00:00.000Z",
    "attempts": 3,
    "meta": { "user": 123 }
  }
]
*/
```

## DLQ Management

You can clear entries or export them in bulk for reporting.

```ts
const dlq = DeadLetterQueue.getInstance();

// Remove a specific failure once it's been handled
dlq.remove('abc123xyz');

// Export all failures as a formatted JSON string
const logFile = dlq.export();

// Clear the entire queue
dlq.clear();
```
