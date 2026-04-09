import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createFlow } from "../primitives/createFlow";
import { createRoot } from "solid-js";

describe("createFlow Solid Advanced Features (v2.0.2)", () => {
  it("should expose triggerUndo function", async () => {
    const action = vi.fn().mockResolvedValue("ok");

    const { flow, dispose } = createRoot((dispose) => {
      const flow = createFlow(action, { purgatory: { duration: 100 } });
      return { flow, dispose };
    });

    flow.execute();
    // Wait a microtask for status to update
    await new Promise((r) => setTimeout(r, 0));
    expect(flow.loading()).toBe(true);
    expect(action).not.toHaveBeenCalled();

    flow.triggerUndo();
    expect(flow.loading()).toBe(false);
    expect(action).not.toHaveBeenCalled();
    dispose();
  });

  it("should provide rollbackDiff signal", async () => {
    const action = vi.fn().mockRejectedValue(new Error("fail"));

    const { flow, dispose } = createRoot((dispose) => {
      const flow = createFlow(action, {
        optimisticResult: { update: 1 },
      });
      return { flow, dispose };
    });

    try {
      await flow.execute();
    } catch (_e) {
      /* Expected */
    }

    // Wait for diff calculation
    await new Promise((r) => setTimeout(r, 50));

    expect(flow.rollbackDiff()).toBeDefined();
    expect(flow.rollbackDiff()!.length).toBeGreaterThan(0);
    dispose();
  });

  it("should expose worker() method", async () => {
    const action = vi.fn().mockResolvedValue("done");

    const { flow, dispose } = createRoot((dispose) => {
      const flow = createFlow(action);
      return { flow, dispose };
    });

    await flow.worker("input");
    expect(flow.data()).toBe("done");
    expect(action).toHaveBeenCalledWith("input");
    dispose();
  });
});
