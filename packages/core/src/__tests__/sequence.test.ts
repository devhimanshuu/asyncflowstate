import { describe, it, expect, vi } from "vitest";
import { Flow } from "../flow";
import { FlowSequence, SequenceStep } from "../sequence";

describe("FlowSequence", () => {
  it("should execute steps sequentially", async () => {
    const f1 = new Flow(async () => 1);
    const f2 = new Flow(async (n: number) => n * 2);

    const sequence = new FlowSequence([
      { name: "Step1", flow: f1 },
      { name: "Step2", flow: f2, mapInput: (prev) => prev },
    ]);

    const results = await sequence.execute();

    expect(results).toEqual([1, 2]);
    expect(sequence.state.status).toBe("success");
  });

  it("should skip steps conditionally", async () => {
    const f1 = new Flow(async () => 1);
    const f2 = new Flow(async () => 2); // Should be skipped
    const f3 = new Flow(async () => 3);

    const sequence = new FlowSequence([
      { name: "Step1", flow: f1 },
      {
        name: "Step2",
        flow: f2,
        skipIf: (prev) => prev === 1,
      },
      { name: "Step3", flow: f3 },
    ]);

    const results = await sequence.execute();

    expect(results).toEqual([1, null, 3]);
    expect(sequence.state.status).toBe("success");
  });

  it("should branch to a specific step", async () => {
    const f1 = new Flow(async () => "go-to-3");
    const f2 = new Flow(async () => "skipped");
    const f3 = new Flow(async () => "final");

    const sequence = new FlowSequence([
      {
        name: "Step1",
        flow: f1,
        nextStep: (res) => (res === "go-to-3" ? "Step3" : null),
      },
      { name: "Step2", flow: f2 },
      { name: "Step3", flow: f3 },
    ]);

    const results = await sequence.execute();

    expect(results).toEqual(["go-to-3", null, "final"]);
    expect(sequence.state.status).toBe("success");
  });

  it("should handle errors in sequence", async () => {
    const f1 = new Flow<any>(async () => {
      throw new Error("fail");
    });
    const f2 = new Flow(async () => 2);

    const sequence = new FlowSequence([
      { name: "Step1", flow: f1 },
      { name: "Step2", flow: f2 },
    ]);

    const results = await sequence.execute();

    expect(results).toBeUndefined();
    expect(sequence.state.status).toBe("error");
    expect(sequence.state.error.message).toBe("fail");
  });
});
