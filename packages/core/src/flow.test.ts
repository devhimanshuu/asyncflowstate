import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Flow, type FlowState, FlowErrorType } from "./flow";

describe("Flow Core", () => {
  it("should start in idle state", () => {
    const flow = new Flow(async () => {});
    expect(flow.state.status).toBe("idle");
  });

  it("should transition to loading then success", async () => {
    const action = vi.fn().mockResolvedValue("ok");
    const flow = new Flow(action);

    const promise = flow.execute();
    expect(flow.state.status).toBe("loading");

    await promise;
    expect(flow.state.status).toBe("success");
    expect(flow.state.data).toBe("ok");
  });

  it("should transition to error", async () => {
    const error = new Error("fail");
    const action = vi.fn().mockRejectedValue(error);
    const flow = new Flow(action);

    await flow.execute();
    expect(flow.state.status).toBe("error");
    expect(flow.state.error).toBe(error);
  });

  it("should support retries", async () => {
    const action = vi
      .fn()
      .mockRejectedValueOnce("fail1")
      .mockRejectedValueOnce("fail2")
      .mockResolvedValue("success");

    const flow = new Flow(action, {
      retry: { maxAttempts: 3, delay: 10, backoff: "fixed" },
    });

    await flow.execute();

    expect(action).toHaveBeenCalledTimes(3);
    expect(flow.state.status).toBe("success");
  });

  it("should set optimistic state synchronously", () => {
    // Simple test: verify options are stored and accessible
    const flow = new Flow(async () => "real", {
      optimisticResult: "optimistic",
    });

    // Verify options are stored correctly
    expect((flow as any).options.optimisticResult).toBe("optimistic");

    // Execute and check state synchronously
    flow.execute();

    // The state should be "success" with optimistic data immediately
    expect(flow.state.status).toBe("success");
    expect(flow.state.data).toBe("optimistic");
  });

  it("should replace optimistic data with real data", async () => {
    const flow = new Flow(
      async () => {
        await new Promise((r) => setTimeout(r, 10));
        return "real";
      },
      { optimisticResult: "optimistic" },
    );

    const promise = flow.execute();

    // Immediately after execute, should have optimistic data
    expect(flow.state.status).toBe("success");
    expect(flow.state.data).toBe("optimistic");

    // After promise resolves, should have real data
    await promise;
    expect(flow.state.status).toBe("success");
    expect(flow.state.data).toBe("real");
  });

  it("should support functional optimistic updates", async () => {
    interface CartData {
      items: Array<{ id: string; quantity: number }>;
      total: number;
    }

    const initialData: CartData = {
      items: [{ id: "item1", quantity: 1 }],
      total: 10,
    };

    const flow = new Flow<CartData, Error, [string, number]>(
      async (itemId, quantity) => {
        await new Promise((r) => setTimeout(r, 10));
        return {
          items: [{ id: itemId, quantity }],
          total: quantity * 10,
        };
      },
      {
        optimisticResult: (prevData, [itemId, quantity]) => ({
          ...prevData,
          items: prevData
            ? prevData.items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item,
              )
            : [{ id: itemId, quantity }],
          total: prevData
            ? prevData.total + (quantity - 1) * 10
            : quantity * 10,
        }),
      },
    );

    // Set initial data
    (flow as any)._state.data = initialData;

    const promise = flow.execute("item1", 3);

    // Should immediately have optimistic data
    expect(flow.state.data?.items[0].quantity).toBe(3);
    expect(flow.state.data?.total).toBe(30);

    // After completion, should have real data
    await promise;
    expect(flow.state.data?.items[0].quantity).toBe(3);
    expect(flow.state.data?.total).toBe(30);
  });

  it("should rollback optimistic updates on error by default", async () => {
    interface UserData {
      name: string;
      email: string;
    }

    const initialData: UserData = {
      name: "John",
      email: "john@example.com",
    };

    const flow = new Flow<UserData, Error, [Partial<UserData>]>(
      async () => {
        await new Promise((r) => setTimeout(r, 10));
        throw new Error("Update failed");
      },
      {
        optimisticResult: (prevData, [updates]) => ({
          ...(prevData || { name: "", email: "" }),
          ...updates,
        }),
      },
    );

    // Set initial data
    (flow as any)._state.data = initialData;

    const promise = flow.execute({ name: "Jane" });

    // Should immediately have optimistic update
    expect(flow.state.data?.name).toBe("Jane");
    expect(flow.state.data?.email).toBe("john@example.com");

    // After error, should rollback to previous data
    await promise;
    expect(flow.state.status).toBe("error");
    expect(flow.state.data?.name).toBe("John"); // Rolled back!
    expect(flow.state.data?.email).toBe("john@example.com");
  });

  it("should not rollback when rollbackOnError is false", async () => {
    const initialData = { count: 5 };

    const flow = new Flow<{ count: number }, Error, []>(
      async () => {
        await new Promise((r) => setTimeout(r, 10));
        throw new Error("Failed");
      },
      {
        optimisticResult: (prevData, args) => ({
          count: (prevData?.count || 0) + 1,
        }),
        rollbackOnError: false, // Disable rollback
      },
    );

    // Set initial data
    (flow as any)._state.data = initialData;

    await flow.execute();

    // Should keep optimistic data even after error
    expect(flow.state.status).toBe("error");
    expect(flow.state.data?.count).toBe(6); // Not rolled back
  });

  it("should clear snapshot after successful completion", async () => {
    const flow = new Flow<string, Error, []>(
      async () => {
        await new Promise((r) => setTimeout(r, 10));
        return "success";
      },
      {
        optimisticResult: (prevData, args) => prevData || "optimistic",
      },
    );

    await flow.execute();

    // Snapshot should be cleared
    expect((flow as any).previousDataSnapshot).toBe(null);
  });

  it("should handle optimistic updates with null prevData", async () => {
    const flow = new Flow<{ value: number }, Error, [number]>(
      async (value) => {
        await new Promise((r) => setTimeout(r, 10));
        return { value };
      },
      {
        optimisticResult: (prevData, [value]) => ({
          value: (prevData?.value || 0) + value,
        }),
      },
    );

    const promise = flow.execute(10);

    // Should handle null prevData gracefully
    expect(flow.state.data?.value).toBe(10);

    await promise;
    expect(flow.state.data?.value).toBe(10);
  });

  it("should prevent double submission with concurrency=keep", async () => {
    let callCount = 0;
    const flow = new Flow(
      async () => {
        callCount++;
        await new Promise((r) => setTimeout(r, 50));
        return callCount;
      },
      { concurrency: "keep" },
    );

    // Start first execution
    const promise1 = flow.execute();
    expect(flow.state.status).toBe("loading");

    // Try second execution while first is loading
    const promise2 = flow.execute();

    // Both should return, but only first should execute
    await Promise.all([promise1, promise2]);

    expect(callCount).toBe(1);
    expect(flow.state.data).toBe(1);
  });

  it("should restart on concurrency=restart", async () => {
    let callCount = 0;
    const results: number[] = [];

    const flow = new Flow(
      async () => {
        const myCount = ++callCount;
        await new Promise((r) => setTimeout(r, 50));
        results.push(myCount);
        return myCount;
      },
      { concurrency: "restart" },
    );

    // Start first execution
    flow.execute();

    // Wait a bit then restart
    await new Promise((r) => setTimeout(r, 10));
    const promise2 = flow.execute();

    await promise2;

    // Second call should have completed, first was cancelled
    expect(callCount).toBe(2);
    expect(flow.state.data).toBe(2);
  });

  it("should call onSuccess callback", async () => {
    const onSuccess = vi.fn();
    const flow = new Flow(async () => "data", { onSuccess });

    await flow.execute();

    expect(onSuccess).toHaveBeenCalledWith("data");
  });

  it("should call onError callback", async () => {
    const onError = vi.fn();
    const error = new Error("test error");
    const flow = new Flow(
      async () => {
        throw error;
      },
      { onError },
    );

    await flow.execute();

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should reset state", async () => {
    const flow = new Flow(async () => "data");

    await flow.execute();
    expect(flow.state.status).toBe("success");

    flow.reset();
    expect(flow.state.status).toBe("idle");
    expect(flow.state.data).toBe(null);
  });

  it("should cancel ongoing execution", async () => {
    let completed = false;
    const flow = new Flow(async () => {
      await new Promise((r) => setTimeout(r, 50));
      completed = true;
      return "data";
    });

    flow.execute();
    expect(flow.state.status).toBe("loading");

    // Cancel immediately
    flow.cancel();
    expect(flow.state.status).toBe("idle");

    // Wait for action to complete
    await new Promise((r) => setTimeout(r, 100));

    // Action completes (we can't stop a running Promise)
    // But state should still be idle (result was ignored)
    expect(completed).toBe(true); // Action ran
    expect(flow.state.status).toBe("idle"); // But result was ignored
    expect(flow.state.data).toBe(null); // No data set
  });

  it("should subscribe to state changes", async () => {
    const states: FlowState[] = [];
    const flow = new Flow(async () => "data");

    flow.subscribe((state) => {
      states.push({ ...state });
    });

    await flow.execute();

    expect(states.length).toBeGreaterThanOrEqual(2);
    expect(states[0].status).toBe("loading");
    expect(states[states.length - 1].status).toBe("success");
  });

  it("should support auto-reset after success", async () => {
    const flow = new Flow(async () => "data", {
      autoReset: { enabled: true, delay: 50 },
    });

    await flow.execute();
    expect(flow.state.status).toBe("success");

    // Wait for auto-reset
    await new Promise((r) => setTimeout(r, 100));
    expect(flow.state.status).toBe("idle");
  });

  it("should expose isLoading, isSuccess, isError getters", async () => {
    const flow = new Flow(async () => "data");

    expect(flow.isLoading).toBe(false);
    expect(flow.isSuccess).toBe(false);
    expect(flow.isError).toBe(false);

    const promise = flow.execute();
    expect(flow.isLoading).toBe(true);

    await promise;
    expect(flow.isSuccess).toBe(true);
    expect(flow.isLoading).toBe(false);
  });

  it("should handle linear backoff retry", async () => {
    const startTime = Date.now();
    const action = vi
      .fn()
      .mockRejectedValueOnce("fail1")
      .mockRejectedValueOnce("fail2")
      .mockResolvedValue("success");

    const flow = new Flow(action, {
      retry: { maxAttempts: 3, delay: 20, backoff: "linear" },
    });

    await flow.execute();
    const elapsed = Date.now() - startTime;

    // Linear: delay * attempt = 20 + 40 = 60ms minimum
    expect(elapsed).toBeGreaterThanOrEqual(50);
    expect(flow.state.status).toBe("success");
  });

  it("should handle exponential backoff retry", async () => {
    const startTime = Date.now();
    const action = vi
      .fn()
      .mockRejectedValueOnce("fail1")
      .mockRejectedValueOnce("fail2")
      .mockResolvedValue("success");

    const flow = new Flow(action, {
      retry: { maxAttempts: 3, delay: 10, backoff: "exponential" },
    });

    await flow.execute();
    const elapsed = Date.now() - startTime;

    // Exponential: 10 * 2^0 + 10 * 2^1 = 10 + 20 = 30ms minimum
    expect(elapsed).toBeGreaterThanOrEqual(25);
    expect(flow.state.status).toBe("success");
  });

  describe("Enhanced Flow Features", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should respect minDuration", async () => {
      const action = vi.fn().mockResolvedValue("done");
      const flow = new Flow(action, { loading: { minDuration: 1000 } });

      const promise = flow.execute();

      // After 100ms, should still be loading
      await vi.advanceTimersByTimeAsync(100);
      expect(flow.isLoading).toBe(true);
      expect(flow.status).toBe("loading");

      // After 1100ms (1000ms total), it should finish
      await vi.advanceTimersByTimeAsync(1000);
      const result = await promise;

      expect(result).toBe("done");
      expect(flow.status).toBe("success");
    });

    it("should respect loading delay", async () => {
      const action = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return "done";
      });
      const flow = new Flow(action, { loading: { delay: 500 } });

      const promise = flow.execute();

      // Status is technically 'loading' but isLoading is false during delay
      expect(flow.status).toBe("loading");
      expect(flow.isLoading).toBe(false);

      // After 600ms, isLoading should be true
      await vi.advanceTimersByTimeAsync(600);
      expect(flow.isLoading).toBe(true);

      // After another 500ms (total 1100ms), action completes
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      expect(flow.status).toBe("success");
      expect(flow.isLoading).toBe(false);
    });

    it("should track progress", async () => {
      const flow = new Flow(async () => {
        flow.setProgress(50);
        return "done";
      });

      expect(flow.progress).toBe(0);
      await flow.execute();
      expect(flow.progress).toBe(100); // Success auto-sets to 100
    });

    it("should handle error with minDuration", async () => {
      const action = vi.fn().mockRejectedValue(new Error("fail"));
      const flow = new Flow(action, { loading: { minDuration: 1000 } });

      const promise = flow.execute();

      await vi.advanceTimersByTimeAsync(100);
      expect(flow.status).toBe("loading");

      await vi.advanceTimersByTimeAsync(1000);
      await promise.catch(() => {});

      expect(flow.status).toBe("error");
    });
  });

  describe("Timeout", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should timeout action after specified duration", async () => {
      const action = vi.fn().mockImplementation(async () => {
        // Simulate a slow action that takes 10 seconds
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return "data";
      });

      const onError = vi.fn();
      const flow = new Flow(action, {
        timeout: 2000, // 2 second timeout
        onError,
      });

      const promise = flow.execute();

      // Advance only the timeout timer (2000ms), not the action timer (10000ms)
      await vi.advanceTimersByTimeAsync(2000);
      // Give time for the abort to be processed
      await Promise.resolve();
      await Promise.resolve();

      // Should be in error state
      expect(flow.status).toBe("error");
      expect(flow.error).toBeDefined();
      expect((flow.error as any).type).toBe("TIMEOUT");
      expect((flow.error as any).message).toContain("timed out");
      expect((flow.error as any).message).toContain("2000ms");
      expect(onError).toHaveBeenCalled();
    });

    it("should not timeout if action completes in time", async () => {
      const action = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return "success";
      });

      const flow = new Flow(action, {
        timeout: 2000,
      });

      const promise = flow.execute();

      // Fast-forward to complete the action
      await vi.advanceTimersByTimeAsync(600);
      await promise;

      // Should succeed
      expect(flow.status).toBe("success");
      expect(flow.data).toBe("success");
      expect(flow.error).toBeNull();
    });

    it("should rollback optimistic updates on timeout", async () => {
      interface CartData {
        items: number;
        total: number;
      }

      const initialData: CartData = { items: 1, total: 10 };

      const action = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return { items: 2, total: 20 };
      });

      const flow = new Flow<CartData, Error, []>(action, {
        timeout: 1000,
        optimisticResult: (prevData, args) => ({
          items: (prevData?.items || 0) + 1,
          total: (prevData?.total || 0) + 10,
        }),
        rollbackOnError: true,
      });

      // Set initial data
      (flow as any)._state.data = initialData;

      const promise = flow.execute();

      // Should immediately have optimistic update
      expect(flow.data?.items).toBe(2);
      expect(flow.data?.total).toBe(20);

      // Fast-forward past timeout (1000ms), but not the action (10000ms)
      await vi.advanceTimersByTimeAsync(1000);
      // Give time for the abort to be processed
      await Promise.resolve();
      await Promise.resolve();

      // Should rollback to initial data
      expect(flow.status).toBe("error");
      expect(flow.data?.items).toBe(1);
      expect(flow.data?.total).toBe(10);
    });

    it("should mark timeout errors as retryable", async () => {
      const action = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return "data";
      });

      const flow = new Flow(action, {
        timeout: 1000,
      });

      const promise = flow.execute();

      // Advance only the timeout timer (1000ms), not the action timer (5000ms)
      await vi.advanceTimersByTimeAsync(1000);
      // Give time for the abort to be processed
      await Promise.resolve();
      await Promise.resolve();

      expect(flow.error).toBeDefined();
      expect((flow.error as any).isRetryable).toBe(true);
    });

    it("should not timeout when timeout is not configured", async () => {
      const action = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return "success";
      });

      const flow = new Flow(action); // No timeout

      const promise = flow.execute();

      await vi.advanceTimersByTimeAsync(3500);
      await promise;

      expect(flow.status).toBe("success");
      expect(flow.data).toBe("success");
    });

    it("should clear timeout timer on manual cancel", async () => {
      const action = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return "data";
      });

      const flow = new Flow(action, {
        timeout: 3000,
      });

      flow.execute();

      // Cancel manually before timeout
      await vi.advanceTimersByTimeAsync(1000);
      flow.cancel();

      // Fast-forward past timeout
      await vi.advanceTimersByTimeAsync(3000);

      // Should be idle (manual cancel), not error (timeout)
      expect(flow.status).toBe("idle");
      expect(flow.error).toBeNull();
    });
  });

  describe("Smart Error Mapping", () => {
    it("should use mapError to force retry on specific error codes", async () => {
      const action = vi
        .fn()
        .mockRejectedValueOnce({ status: 429, message: "Too Many Requests" })
        .mockResolvedValue("success");

      const flow = new Flow(action, {
        retry: { maxAttempts: 3, delay: 10 },
        mapError: (error) => {
          if (error.status === 429) {
            return { isRetryable: true, type: FlowErrorType.SERVER };
          }
          return { isRetryable: false };
        },
      });

      await flow.execute();

      expect(action).toHaveBeenCalledTimes(2);
      expect(flow.state.status).toBe("success");
      expect(flow.state.data).toBe("success");
    });

    it("should use mapError to prevent retry on fatal errors", async () => {
      const action = vi
        .fn()
        .mockRejectedValueOnce({ status: 401, message: "Unauthorized" })
        .mockResolvedValue("success");

      const flow = new Flow(action, {
        retry: { maxAttempts: 3, delay: 10 },
        mapError: (error) => {
          if (error.status === 401) {
            return { isRetryable: false, type: FlowErrorType.PERMISSION };
          }
          return { isRetryable: true };
        },
      });

      await flow.execute();

      // Should stop after 1st attempt despite maxAttempts=3 because isRetryable=false
      expect(action).toHaveBeenCalledTimes(1);
      expect(flow.state.status).toBe("error");
      expect(flow.state.error).toMatchObject({
        status: 401,
        type: FlowErrorType.PERMISSION,
      });
    });

    it("should merge mapped properties into the error object", async () => {
      const error = { message: "Network Error" };
      const action = vi.fn().mockRejectedValue(error);

      const flow = new Flow(action, {
        retry: { maxAttempts: 1 },
        mapError: (err) => ({
          type: FlowErrorType.NETWORK,
          message: "Network Unreachable", // Override message
        }),
      });

      await flow.execute();

      expect(flow.state.error).toMatchObject({
        type: FlowErrorType.NETWORK,
        message: "Network Unreachable",
      });
    });
  });

  describe("Polling", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should poll at specified interval", async () => {
      let count = 0;
      const action = vi.fn().mockImplementation(async () => {
        count++;
        return count;
      });

      const flow = new Flow(action, {
        polling: { interval: 1000 },
      });

      flow.execute();
      await vi.advanceTimersByTimeAsync(10); // First execution
      expect(count).toBe(1);

      await vi.advanceTimersByTimeAsync(1000); // Wait for poll
      expect(count).toBe(2);

      await vi.advanceTimersByTimeAsync(1000); // Another poll
      expect(count).toBe(3);

      flow.stopPolling();
      await vi.advanceTimersByTimeAsync(1000);
      expect(count).toBe(3);
    });

    it("should stop polling if stopIf condition is met", async () => {
      let count = 0;
      const action = vi.fn().mockImplementation(async () => {
        count++;
        return count;
      });

      const flow = new Flow(action, {
        polling: {
          interval: 1000,
          stopIf: (data) => data >= 3,
        },
      });

      flow.execute();
      await vi.advanceTimersByTimeAsync(10);
      expect(count).toBe(1);

      await vi.advanceTimersByTimeAsync(2000); // 2 more polls
      expect(count).toBe(3);

      await vi.advanceTimersByTimeAsync(1000); // Should have stopped
      expect(count).toBe(3);
    });

    it("should stop polling on error by default", async () => {
      let count = 0;
      const action = vi.fn().mockImplementation(async () => {
        count++;
        if (count === 2) throw new Error("fail");
        return count;
      });

      const flow = new Flow(action, {
        polling: { interval: 1000 },
      });

      flow.execute();
      await vi.advanceTimersByTimeAsync(10);
      expect(count).toBe(1);

      await vi.advanceTimersByTimeAsync(1000); // Fails
      expect(flow.status).toBe("error");

      await vi.advanceTimersByTimeAsync(1000); // Should not poll again
      expect(count).toBe(2);
    });
  });

  describe("Debugger & Events", () => {
    it("should emit events on lifecycle changes", async () => {
      const events: any[] = [];
      const cleanup = Flow.onEvent((e) => events.push(e));

      const flow = new Flow(async () => "done", { debugName: "TestFlow" });
      await flow.execute();

      expect(events).toContainEqual(
        expect.objectContaining({ type: "start", flowName: "TestFlow" }),
      );
      expect(events).toContainEqual(
        expect.objectContaining({ type: "success", flowName: "TestFlow" }),
      );

      flow.reset();
      expect(events).toContainEqual(
        expect.objectContaining({ type: "reset", flowName: "TestFlow" }),
      );

      cleanup();
    });
  });

  describe("Preconditions", () => {
    it("should block execution if precondition fails", async () => {
      const action = vi.fn().mockResolvedValue("ok");
      const onBlocked = vi.fn();
      const flow = new Flow(action, {
        precondition: () => false,
        onBlocked,
      });

      const result = await flow.execute();

      expect(result).toBeUndefined();
      expect(action).not.toHaveBeenCalled();
      expect(onBlocked).toHaveBeenCalled();
    });

    it("should allow execution if precondition passes", async () => {
      const action = vi.fn().mockResolvedValue("ok");
      const flow = new Flow(action, {
        precondition: () => true,
      });

      await flow.execute();

      expect(action).toHaveBeenCalled();
      expect(flow.status).toBe("success");
    });
  });

  describe("Middleware", () => {
    it("should arbitrary attach global middleware", async () => {
      const globalLog = vi.fn();
      Flow.useGlobal({
        onStart: globalLog,
      });

      const flow = new Flow(async () => "ok");
      await flow.execute();

      expect(globalLog).toHaveBeenCalled();
    });

    it("should execute instance middleware hooks", async () => {
      const onStart = vi.fn();
      const onSuccess = vi.fn();
      const onSettled = vi.fn();

      const flow = new Flow(async () => "ok", {
        middleware: [{ onStart, onSuccess, onSettled }],
      });

      await flow.execute();

      expect(onStart).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith("ok");
      expect(onSettled).toHaveBeenCalledWith("ok", null);
    });

    it("should execute middleware on error", async () => {
      const onError = vi.fn();
      const err = new Error("fail");

      const flow = new Flow(async () => {
        throw err;
      });
      flow.use({ onError });

      await flow.execute();

      expect(onError).toHaveBeenCalledWith(err);
    });
  });

  describe("Deduplication", () => {
    it(
      "should resuse in-flight request for same dedupKey",
      { timeout: 10000 },
      async () => {
        let callCount = 0;
        const action = async () => {
          callCount++;
          await new Promise((resolve) => setTimeout(resolve, 50));
          return "data";
        };

        const flow1 = new Flow(action, { dedupKey: "shared-key" });
        const flow2 = new Flow(action, { dedupKey: "shared-key" });

        const [res1, res2] = await Promise.all([
          flow1.execute(),
          flow2.execute(),
        ]);

        expect(res1).toBe("data");
        expect(res2).toBe("data");
        expect(callCount).toBe(1); // Only executed once
      },
    );

    it(
      "should return cached data if staleTime is active",
      { timeout: 10000 },
      async () => {
        let callCount = 0;
        const action = async () => {
          callCount++;
          return `count-${callCount}`;
        };

        const flow1 = new Flow(action, {
          dedupKey: "cache-key",
          staleTime: 5000,
        });
        await flow1.execute(); // count-1

        const flow2 = new Flow(action, {
          dedupKey: "cache-key",
          staleTime: 5000,
        });
        const res2 = await flow2.execute(); // Should be count-1 from cache

        expect(res2).toBe("count-1");
        expect(callCount).toBe(1);
      },
    );
  });

  describe("Offline Awareness", () => {
    it("should pause execution when offline and resume when online", async () => {
      const onLineSpy = vi.spyOn(navigator, "onLine", "get");
      onLineSpy.mockReturnValue(false); // Simulate offline

      let executed = false;
      const action = async () => {
        executed = true;
        return "success";
      };

      const flow = new Flow(action, { retry: { pauseOffline: true } });
      const promise = flow.execute();

      // Should be paused
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(executed).toBe(false);

      // Simulate coming online
      onLineSpy.mockReturnValue(true);
      window.dispatchEvent(new Event("online"));

      await promise;
      expect(executed).toBe(true);

      onLineSpy.mockRestore();
    });
  });
});
