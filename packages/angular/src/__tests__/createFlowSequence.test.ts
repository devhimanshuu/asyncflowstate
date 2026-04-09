import { describe, it, expect, vi } from "vitest";
import { createFlowSequence } from "../services/createFlowSequence";
import { Flow } from "@asyncflowstate/core";

describe("Angular createFlowSequence", () => {
  it("should reflect sequence execution states", async () => {
    const action1 = vi.fn().mockResolvedValue("data 1");
    const action2 = vi.fn().mockResolvedValue("data 2");

    const flow1 = new Flow(action1);
    const flow2 = new Flow(action2);

    const sequenceService = createFlowSequence([
      { name: "Step1", flow: flow1 },
      { name: "Step2", flow: flow2 },
    ]);

    expect(sequenceService.state$.getValue().status).toBe("idle");
    expect(sequenceService.state$.getValue().loading).toBe(false);

    const promise = sequenceService.execute();
    
    expect(sequenceService.state$.getValue().status).toBe("loading");
    expect(sequenceService.state$.getValue().loading).toBe(true);

    await promise;

    expect(sequenceService.state$.getValue().status).toBe("success");
    expect(sequenceService.state$.getValue().loading).toBe(false);
    expect(sequenceService.state$.getValue().results).toEqual(["data 1", "data 2"]);
    
    sequenceService.destroy();
  });
});
