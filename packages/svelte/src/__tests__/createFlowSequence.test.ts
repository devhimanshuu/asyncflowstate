import { describe, it, expect, vi } from "vitest";
import { get } from "svelte/store";
import { createFlowSequence } from "../stores/createFlowSequence";
import { Flow } from "@asyncflowstate/core";

describe("Svelte createFlowSequence", () => {
  it("should reflect sequence execution states", async () => {
    const action1 = vi.fn().mockResolvedValue("data 1");
    const action2 = vi.fn().mockResolvedValue("data 2");

    const flow1 = new Flow(action1);
    const flow2 = new Flow(action2);

    const sequenceStore = createFlowSequence([
      { name: "Step1", flow: flow1 },
      { name: "Step2", flow: flow2 },
    ]);

    expect(get(sequenceStore).status).toBe("idle");
    expect(get(sequenceStore).loading).toBe(false);

    const promise = sequenceStore.execute();

    expect(get(sequenceStore).status).toBe("loading");
    expect(get(sequenceStore).loading).toBe(true);

    await promise;

    expect(get(sequenceStore).status).toBe("success");
    expect(get(sequenceStore).loading).toBe(false);
    expect(get(sequenceStore).results).toEqual(["data 1", "data 2"]);

    sequenceStore.destroy();
  });
});
