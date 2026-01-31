import { describe, it, expect, vi } from "vitest";
import { Flow } from "./flow";
import { FlowSequence } from "./sequence";

describe("FlowSequence", () => {
  it("should execute steps in order", async () => {
    const flow1 = new Flow(async (input: number) => input + 1);
    const flow2 = new Flow(async (input: number) => input * 2);

    const sequence = new FlowSequence([
      { name: "Step 1", flow: flow1 },
      { name: "Step 2", flow: flow2 },
    ]);

    const results = await sequence.execute(5);

    expect(results).toEqual([6, 12]);
    expect(sequence.state.status).toBe("success");
    expect(sequence.state.progress).toBe(100);
  });

  it("should stop execution on step failure", async () => {
    const flow1 = new Flow(async () => "ok");
    const flow2 = new Flow(async () => {
      throw new Error("fail");
    });
    const flow3 = new Flow(async () => "unused");

    const sequence = new FlowSequence([
      { name: "S1", flow: flow1 },
      { name: "S2", flow: flow2 },
      { name: "S3", flow: flow3 },
    ]);

    const results = await sequence.execute();

    expect(results).toBeUndefined();
    expect(sequence.state.status).toBe("error");
    expect(sequence.state.currentStepIndex).toBe(1);
    expect(sequence.state.results).toEqual(["ok"]);
  });

  it("should support mapping inputs between steps", async () => {
    const flow1 = new Flow(async () => ({ id: 1 }));
    const flow2 = new Flow(async (id: number) => `User ${id}`);

    const sequence = new FlowSequence([
      { name: "Fetch ID", flow: flow1 },
      {
        name: "Format Name",
        flow: flow2,
        mapInput: (prev) => prev.id,
      },
    ]);

    const results = await sequence.execute();
    expect(results).toEqual([{ id: 1 }, "User 1"]);
  });

  it("should reset all internal flows", async () => {
    const flow1 = new Flow(async () => "S1");
    const sequence = new FlowSequence([{ name: "S1", flow: flow1 }]);

    await sequence.execute();
    expect(flow1.status).toBe("success");

    sequence.reset();
    expect(flow1.status).toBe("idle");
    expect(sequence.state.status).toBe("idle");
  });
});
