import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Flow, type FlowState } from "./flow";

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
});
