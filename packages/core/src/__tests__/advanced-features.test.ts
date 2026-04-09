import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Flow } from "../flow";
import { DeadLetterQueue } from "../utils/dead-letter-queue";
import { pipe, chain, raceFlows, withFallback } from "../utils/composition";
import { simulateJitter } from "../utils/testing";
import { withAutoHealing } from "../utils/auto-healer";
import { streamAISkeleton } from "../utils/stream-skeleton";

describe("Advanced Features (AsyncFlowState 2.0.2)", () => {
  describe("Global Undo (Purgatory)", () => {
    it("should delay execution and allow undoing", async () => {
      vi.useFakeTimers();
      const action = vi.fn().mockResolvedValue("success");
      const flow = new Flow(action, { purgatory: { duration: 5000 } });

      const promise = flow.execute();
      expect(flow.state.status).toBe("idle");
      expect(action).not.toHaveBeenCalled();

      flow.triggerUndo();
      await promise;

      expect(flow.state.status).toBe("idle");
      expect(action).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe("Ghost Workflows", () => {
    it("should maintain idle state during ghost execution", async () => {
      const action = vi
        .fn()
        .mockImplementation(
          () => new Promise((res) => setTimeout(() => res("done"), 100)),
        );
      const flow = new Flow(action, { ghost: { enabled: true } });

      flow.execute();
      expect(flow.state.status).toBe("idle");

      await new Promise((r) => setTimeout(r, 200));
      expect(action).toHaveBeenCalled();
    });
  });

  describe("Dead Letter Queue (DLQ)", () => {
    it("should capture failed actions in the DLQ", async () => {
      DeadLetterQueue.getInstance().clear();
      const dlq = DeadLetterQueue.getInstance();
      const action = vi.fn().mockRejectedValue(new Error("Fatal Error"));
      const flow = new Flow(action, {
        deadLetter: true,
        retry: { maxAttempts: 1 },
      });

      try {
        await flow.execute();
      } catch (e) {
        // Expected failure for rollback test
      }

      // Wait a microtask for dynamic import in DLQ
      await new Promise((r) => setTimeout(r, 0));

      const entries = dlq.getAll();
      expect(entries.length).toBe(1);
      expect(entries[0].error.message).toBe("Fatal Error");
    });
  });

  describe("Flow Composition", () => {
    it("should pipe results correctly", async () => {
      const step1 = async (n: number) => n + 1;
      const step2 = async (n: number) => n * 2;

      const workflow = pipe(step1, step2);
      const res = await workflow.execute(1);
      expect(res).toBe(4);
    });

    it("should race flows and pick the winner", async () => {
      const slow = () =>
        new Promise((res) => setTimeout(() => res("slow"), 200));
      const fast = () =>
        new Promise((res) => setTimeout(() => res("fast"), 50));

      const workflow = raceFlows(slow, fast);
      const res = await workflow.execute();
      expect(res).toBe("fast");
    });

    it("should use fallback on failure", async () => {
      const primary = () => Promise.reject("error");
      const fallback = () => Promise.resolve("recovered");

      const workflow = withFallback(primary, fallback);
      const res = await workflow.execute();
      expect(res).toBe("recovered");
    });
  });

  describe("AI Utilities", () => {
    it("should auto-heal on failure", async () => {
      const failingAction = vi.fn().mockRejectedValue(new Error("Broken API"));
      const healer = vi.fn().mockResolvedValue({ status: "fixed" });

      const workflow = withAutoHealing(
        new Flow(failingAction, { retry: { maxAttempts: 1 } }),
        {
          fallbackGenerator: healer,
        },
      );

      await workflow.execute();
      // Auto-healing updates the state asynchronously via middleware
      await new Promise((r) => setTimeout(r, 50));

      expect(workflow.data).toEqual({ status: "fixed" });
    });

    it("should stream AI skeletons", async () => {
      // Don't use fake timers here as it blocks the generator
      const generator = streamAISkeleton({
        schema: { title: "string" },
        streamingDelay: 10,
      });

      const chunks = [];
      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBe(1);
      expect(chunks[0]).toEqual({ title: "█████████" });
    });
  });

  describe("Testing Utilities", () => {
    it("should simulate network jitter and failure", async () => {
      const action = vi.fn().mockResolvedValue("ok");
      const flaky = simulateJitter(action, { failureRate: 1.0 });

      await expect(flaky()).rejects.toThrow();
    });
  });
});
