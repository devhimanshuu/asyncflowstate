# Chaining Complex Flows

Master sequential and parallel execution using `useFlowSequence` and `useFlowParallel` for robust multi-step workflows.

---

In complex applications, a single user action often triggers multiple steps. For example, "Checkout" might involve:

1.  **Validating** the cart inventory.
2.  **Processing** the payment.
3.  **Sending** a confirmation email.

If step 2 fails, you shouldn't just show an error — you should know exactly where it failed and whether step 1 was successful. This is where **Flow Sequences** come in.

## 1. Creating a Multi-Step Sequence

Instead of nesting `async/await` calls manually, `useFlowSequence` tracks the progress of each individual step and correctly passes data between them.

```tsx
import { useFlowSequence } from "@asyncflowstate/react";

const steps = [
  {
    name: "Validate Inventory",
    flow: checkStockFlow,
  },
  {
    name: "Process Payment",
    flow: paymentFlow,
    mapInput: (prevResult) => ({
      orderId: prevResult.id,
      amount: 100,
    }),
  },
  {
    name: "Confirm Order",
    flow: finalizeFlow,
  },
];

function Checkout() {
  const sequence = useFlowSequence(steps);

  return (
    <div>
      <p>
        Current Progress: {sequence.currentStep + 1} / {steps.length}
      </p>
      <p>Current Step: {sequence.activeStep?.name}</p>

      <button onClick={() => sequence.execute(cartData)}>
        {sequence.loading ? "Processing..." : "Complete Purchase"}
      </button>

      {sequence.error && (
        <div className="error-box">
          Failed at {sequence.failedStep?.name}: {sequence.error.message}
          <button onClick={() => sequence.retry()}>Retry Step</button>
        </div>
      )}
    </div>
  );
}
```

### <i class="fa-solid fa-circle-check text-emerald-500"></i> Why use Sequences?

1.  **State Granularity**: You know exactly which step failed.
2.  **Auto-Mapping**: `mapInput` avoids messy prop drilling between steps.
3.  **Recovery**: Call `sequence.retry()` to pick up exactly where you left off without restarting from Step 1.

---

## 2. Parallel Processing

Sometimes, you need to trigger multiple flows simultaneously (e.g., uploading 3 files at once or fetching data from different endpoints). `useFlowParallel` aggregates these into a single state.

```tsx
import { useFlowParallel } from "@asyncflowstate/react";

const parallel = useFlowParallel([
  profileFlow,
  notificationsFlow,
  settingsFlow,
]);

// parallel.loading is true if ANY of the flows are loading
// parallel.data is an array of [profile, notifications, settings]
// parallel.error catches the first error that occurs
```

## 3. Best Practices for Chaining

- **Idempotency**: Ensure that your intermediate steps are idempotent. If a payment fails and you retry, you must ensure the user isn't charged twice.
- **Atomic vs non-atomic**: If the final step fails, decide if you need to rollback the previous steps manually in the `onError` handler of the sequence.

---

::: tip Next Level
Combine **Sequences** with **Optimistic UI** to show a "Step Completed" checkmark before the backend has even finished processing the next step.
:::

[← Optimistic UI Tutorial](/guide/tutorials/optimistic-patterns) | [The Purgatory Pattern →](/guide/tutorials/purgatory-pattern)
