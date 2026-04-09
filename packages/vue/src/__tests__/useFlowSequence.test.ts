import { describe, it, expect, vi } from "vitest";
import { useFlowSequence } from "../composables/useFlowSequence";
import { Flow } from "@asyncflowstate/core";

describe("Vue useFlowSequence", () => {
  it("should reflect sequence execution states", async () => {
    const action1 = vi.fn().mockResolvedValue("data 1");
    const action2 = vi.fn().mockResolvedValue("data 2");

    const flow1 = new Flow(action1);
    const flow2 = new Flow(action2);

    const sequence = useFlowSequence([
      { name: "Step1", flow: flow1 },
      { name: "Step2", flow: flow2 },
    ]);

    expect(sequence.status).toBe("idle");
    expect(sequence.loading).toBe(false);

    const promise = sequence.execute();
    
    expect(sequence.status).toBe("loading");
    expect(sequence.loading).toBe(true);

    await promise;

    expect(sequence.status).toBe("success");
    expect(sequence.loading).toBe(false);
    expect(sequence.results.length).toBe(2);
    expect(sequence.results[0]).toBe("data 1");
    expect(sequence.results[1]).toBe("data 2");
  });
});
