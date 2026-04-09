import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createFlow } from "../services/createFlow";

describe("createFlow Angular Advanced Features (v2.0.0)", () => {
  it("should expose triggerUndo/loading signal behavior", async () => {
    const action = vi.fn().mockResolvedValue("ok");
    const flow = createFlow(action, { purgatory: { duration: 100 } });

    flow.execute();
    await new Promise((r) => setTimeout(r, 0));
    expect(flow.snapshot().loading).toBe(true);
    expect(action).not.toHaveBeenCalled();

    flow.triggerUndo();
    expect(flow.snapshot().loading).toBe(false);
    expect(action).not.toHaveBeenCalled();
  });

  it("should expose rollbackDiff signal", async () => {
    const action = vi.fn().mockRejectedValue(new Error("fail"));
    const flow = createFlow(action, { optimisticResult: { v: 1 } });

    try {
      await flow.execute();
    } catch (e) {
      // Expected failure for rollback test
    }

    await new Promise((r) => setTimeout(r, 50));

    expect(flow.snapshot().rollbackDiff).toBeDefined();
    expect(flow.snapshot().rollbackDiff!.length).toBeGreaterThan(0);
  });

  it("should expose worker method", async () => {
    const action = vi.fn().mockResolvedValue("output");
    const flow = createFlow(action);

    await flow.worker("input");
    expect(flow.snapshot().data).toBe("output");
    expect(action).toHaveBeenCalledWith("input");
  });
});
