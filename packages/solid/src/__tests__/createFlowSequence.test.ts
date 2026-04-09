import { describe, it, expect, vi } from "vitest";
import { createRoot } from "solid-js";
import { createFlowSequence } from "../primitives/createFlowSequence";
import { Flow } from "@asyncflowstate/core";

describe("Solid createFlowSequence", () => {
  it("should reflect sequence execution states", async () => {
    const action1 = vi
      .fn()
      .mockImplementation(
        () => new Promise((res) => setTimeout(() => res("data 1"), 50)),
      );
    const action2 = vi.fn().mockResolvedValue("data 2");

    const { sequencePrimitive, dispose } = createRoot((dispose) => {
      const flow1 = new Flow(action1);
      const flow2 = new Flow(action2);

      const sequencePrimitive = createFlowSequence([
        { name: "Step1", flow: flow1 },
        { name: "Step2", flow: flow2 },
      ]);
      return { sequencePrimitive, dispose };
    });

    expect(sequencePrimitive.status()).toBe("idle");
    expect(sequencePrimitive.loading()).toBe(false);

    const promise = sequencePrimitive.execute();

    // Solid primitive check
    expect(sequencePrimitive.status()).toBe("loading");
    expect(sequencePrimitive.loading()).toBe(true);

    await promise;

    expect(sequencePrimitive.status()).toBe("success");
    expect(sequencePrimitive.loading()).toBe(false);
    expect(sequencePrimitive.results()).toEqual(["data 1", "data 2"]);

    dispose();
  });
});
