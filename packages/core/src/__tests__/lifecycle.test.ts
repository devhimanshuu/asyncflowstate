import { describe, it, expect, vi, beforeEach } from "vitest";
import { Flow } from "../flow";

describe("Flow - Lifecycle Hooks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe("onStart", () => {
    it("should fire when action execution begins", async () => {
      const onStart = vi.fn();
      const action = vi.fn().mockResolvedValue("success");
      const flow = new Flow(action, { onStart });

      const promise = flow.execute("arg1", "arg2");

      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onStart).toHaveBeenCalledWith(["arg1", "arg2"]);

      await promise;
    });

    it("should fire before the action executes", async () => {
      const callOrder: string[] = [];
      const onStart = vi.fn(() => callOrder.push("onStart"));
      const action = vi.fn(async () => {
        callOrder.push("action");
        return "success";
      });

      const flow = new Flow(action, { onStart });
      await flow.execute();

      expect(callOrder).toEqual(["onStart", "action"]);
    });
  });

  describe("onSuccess", () => {
    it("should fire after successful execution", async () => {
      const onSuccess = vi.fn();
      const action = vi.fn().mockResolvedValue("result");
      const flow = new Flow(action, { onSuccess });

      await flow.execute();

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith("result");
    });
  });

  describe("onError", () => {
    it("should fire after failed execution", async () => {
      const onError = vi.fn();
      const error = new Error("Failed");
      const action = vi.fn().mockRejectedValue(error);
      const flow = new Flow(action, { onError });

      await flow.execute();

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe("onRetry", () => {
    it("should fire on each retry attempt", async () => {
      const onRetry = vi.fn();
      const error = new Error("Failed");
      const action = vi.fn().mockRejectedValue(error);
      const flow = new Flow(action, {
        onRetry,
        retry: { maxAttempts: 3, delay: 100 },
      });

      const promise = flow.execute();

      // Wait for all retries to complete
      await vi.runAllTimersAsync();
      await promise;

      // Should have been called 2 times (after attempt 1 and 2, not after the final attempt 3)
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(1, error, 1, 3);
      expect(onRetry).toHaveBeenNthCalledWith(2, error, 2, 3);
    });

    it("should not fire if retry is not configured", async () => {
      const onRetry = vi.fn();
      const error = new Error("Failed");
      const action = vi.fn().mockRejectedValue(error);
      const flow = new Flow(action, { onRetry });

      await flow.execute();

      expect(onRetry).not.toHaveBeenCalled();
    });
  });

  describe("onCancel", () => {
    it("should fire when cancel() is called", async () => {
      const onCancel = vi.fn();
      const action = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return "success";
      });
      const flow = new Flow(action, { onCancel });

      flow.execute();
      expect(flow.isLoading).toBe(true);

      flow.cancel();

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(flow.status).toBe("idle");
    });
  });

  describe("onSettled", () => {
    it("should fire after success with data and null error", async () => {
      const onSettled = vi.fn();
      const action = vi.fn().mockResolvedValue("result");
      const flow = new Flow(action, { onSettled });

      await flow.execute();

      expect(onSettled).toHaveBeenCalledTimes(1);
      expect(onSettled).toHaveBeenCalledWith("result", null);
    });

    it("should fire after error with null data and error", async () => {
      const onSettled = vi.fn();
      const error = new Error("Failed");
      const action = vi.fn().mockRejectedValue(error);
      const flow = new Flow(action, { onSettled });

      await flow.execute();

      expect(onSettled).toHaveBeenCalledTimes(1);
      expect(onSettled).toHaveBeenCalledWith(null, error);
    });

    it("should fire after both onSuccess and onError", async () => {
      const callOrder: string[] = [];
      const onSuccess = vi.fn(() => callOrder.push("onSuccess"));
      const onError = vi.fn(() => callOrder.push("onError"));
      const onSettled = vi.fn(() => callOrder.push("onSettled"));

      // Test success path
      const successAction = vi.fn().mockResolvedValue("result");
      const successFlow = new Flow(successAction, { onSuccess, onSettled });
      await successFlow.execute();

      expect(callOrder).toEqual(["onSuccess", "onSettled"]);

      // Reset and test error path
      callOrder.length = 0;
      const errorAction = vi.fn().mockRejectedValue(new Error("Failed"));
      const errorFlow = new Flow(errorAction, { onError, onSettled });
      await errorFlow.execute();

      expect(callOrder).toEqual(["onError", "onSettled"]);
    });
  });

  describe("Complete lifecycle", () => {
    it("should fire hooks in correct order for successful execution", async () => {
      const callOrder: string[] = [];
      const hooks = {
        onStart: vi.fn(() => callOrder.push("onStart")),
        onSuccess: vi.fn(() => callOrder.push("onSuccess")),
        onSettled: vi.fn(() => callOrder.push("onSettled")),
      };

      const action = vi.fn(async () => {
        callOrder.push("action");
        return "result";
      });

      const flow = new Flow(action, hooks);
      await flow.execute();

      expect(callOrder).toEqual([
        "onStart",
        "action",
        "onSuccess",
        "onSettled",
      ]);
    });

    it("should fire hooks in correct order for failed execution with retries", async () => {
      const callOrder: string[] = [];
      const hooks = {
        onStart: vi.fn(() => callOrder.push("onStart")),
        onRetry: vi.fn(() => callOrder.push("onRetry")),
        onError: vi.fn(() => callOrder.push("onError")),
        onSettled: vi.fn(() => callOrder.push("onSettled")),
      };

      const action = vi.fn(async () => {
        callOrder.push("action");
        throw new Error("Failed");
      });

      const flow = new Flow(action, {
        ...hooks,
        retry: { maxAttempts: 2, delay: 100 },
      });

      const promise = flow.execute();

      // Wait for execution to complete
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(100);
      await promise;

      expect(callOrder).toEqual([
        "onStart",
        "action",
        "onRetry",
        "action",
        "onError",
        "onSettled",
      ]);
    });
  });
});
