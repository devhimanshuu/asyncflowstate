/**
 * AsyncFlowState - Basic Examples
 *
 * These examples show how to use the core Flow class directly.
 * For React applications, use @asyncflowstate/react instead.
 */

import { Flow } from "@asyncflowstate/core";

// =============================================================================
// Example 1: Simple Async Action
// =============================================================================

async function example1_SimpleAction() {
  console.log("--- Example 1: Simple Async Action ---");

  // Simulate an API call
  const loginAction = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    if (email === "test@example.com" && password === "password") {
      return { id: 1, name: "John Doe", email };
    }
    throw new Error("Invalid credentials");
  };

  const loginFlow = new Flow(loginAction);

  // Subscribe to state changes
  loginFlow.subscribe((state) => {
    console.log("State changed:", state.status, state.data || state.error);
  });

  console.log("Initial state:", loginFlow.state.status);

  // Execute the flow
  const result = await loginFlow.execute("test@example.com", "password");
  console.log("Login result:", result);
}

// =============================================================================
// Example 2: Retry Logic
// =============================================================================

async function example2_RetryLogic() {
  console.log("\n--- Example 2: Retry Logic ---");

  let attemptCount = 0;

  const flakeyAction = async () => {
    attemptCount++;
    console.log(`Attempt ${attemptCount}`);

    // Simulate a flakey API that fails the first 2 times
    if (attemptCount < 3) {
      throw new Error(`Failed on attempt ${attemptCount}`);
    }
    return "Success after retries!";
  };

  const flow = new Flow(flakeyAction, {
    retry: {
      maxAttempts: 3,
      delay: 100,
      backoff: "linear",
    },
    onSuccess: (data) => console.log("onSuccess:", data),
    onError: (error) => console.log("onError:", error),
  });

  const result = await flow.execute();
  console.log("Final result:", result);
  console.log("Final status:", flow.state.status);
}

// =============================================================================
// Example 3: Optimistic UI
// =============================================================================

async function example3_OptimisticUI() {
  console.log("\n--- Example 3: Optimistic UI ---");

  const saveAction = async (data: { id: number; name: string }) => {
    console.log("Saving to server...");
    await new Promise((r) => setTimeout(r, 1000));
    return { ...data, savedAt: new Date().toISOString() };
  };

  const flow = new Flow(saveAction, {
    optimisticResult: {
      id: 1,
      name: "New Name (optimistic)",
      savedAt: "pending...",
    },
  });

  flow.subscribe((state) => {
    if (state.status === "success") {
      console.log("UI updated with:", state.data);
    }
  });

  // Start execution
  flow.execute({ id: 1, name: "New Name" });

  // State is immediately "success" with optimistic data
  console.log("Immediately after execute:", flow.state.status, flow.state.data);

  // Wait for real data
  await new Promise((r) => setTimeout(r, 1500));
  console.log("After server response:", flow.state.status, flow.state.data);
}

// =============================================================================
// Example 4: Prevent Double Submission
// =============================================================================

async function example4_DoubleSubmission() {
  console.log("\n--- Example 4: Prevent Double Submission ---");

  let executionCount = 0;

  const slowAction = async () => {
    executionCount++;
    console.log(`Execution #${executionCount} started`);
    await new Promise((r) => setTimeout(r, 500));
    console.log(`Execution #${executionCount} completed`);
    return executionCount;
  };

  const flow = new Flow(slowAction, {
    concurrency: "keep", // Ignore new requests while loading
  });

  // Simulate rapid button clicks
  console.log("Simulating rapid clicks...");
  flow.execute();
  flow.execute(); // This will be ignored
  flow.execute(); // This will be ignored too

  await new Promise((r) => setTimeout(r, 600));

  console.log("Total executions:", executionCount);
  console.log("Expected: 1 (double submissions prevented)");
}

// =============================================================================
// Example 5: Cancellation
// =============================================================================

async function example5_Cancellation() {
  console.log("\n--- Example 5: Cancellation ---");

  const longAction = async () => {
    console.log("Long action started...");
    await new Promise((r) => setTimeout(r, 2000));
    console.log("Long action completed");
    return "Done";
  };

  const flow = new Flow(longAction);

  flow.subscribe((state) => {
    console.log("State:", state.status);
  });

  // Start execution
  flow.execute();

  // Cancel after 500ms
  setTimeout(() => {
    console.log("Cancelling...");
    flow.cancel();
  }, 500);

  await new Promise((r) => setTimeout(r, 2500));
  console.log("Final state:", flow.state.status);
}

// =============================================================================
// Example 6: Auto Reset
// =============================================================================

async function example6_AutoReset() {
  console.log("\n--- Example 6: Auto Reset ---");

  const flow = new Flow(async () => "Success!", {
    autoReset: {
      enabled: true,
      delay: 1000, // Reset to idle after 1 second
    },
  });

  flow.subscribe((state) => {
    console.log("State:", state.status);
  });

  await flow.execute();
  console.log("After execute:", flow.state.status);

  // Wait for auto reset
  await new Promise((r) => setTimeout(r, 1500));
  console.log("After auto reset:", flow.state.status);
}

// =============================================================================
// Run all examples
// =============================================================================

async function runAllExamples() {
  await example1_SimpleAction();
  await example2_RetryLogic();
  await example3_OptimisticUI();
  await example4_DoubleSubmission();
  await example5_Cancellation();
  await example6_AutoReset();

  console.log("\n✅ All examples completed!");
}

runAllExamples().catch(console.error);
