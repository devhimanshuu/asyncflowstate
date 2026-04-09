import { describe, it, expect, vi } from "vitest";
import { createRoot } from "solid-js";
import { createFlow } from "../primitives/createFlow";

describe("Solid createFlow", () => {
  it("should reflect loading and success states via signals", async () => {
    const action = vi.fn().mockResolvedValue("success data");
    
    await createRoot(async (dispose) => {
      const flowPrimitive = createFlow(action);

      expect(flowPrimitive.status()).toBe("idle");
      expect(flowPrimitive.loading()).toBe(false);

      const promise = flowPrimitive.execute();
      
      expect(flowPrimitive.status()).toBe("loading");
      expect(flowPrimitive.loading()).toBe(true);

      await promise;

      expect(flowPrimitive.status()).toBe("success");
      expect(flowPrimitive.loading()).toBe(false);
      expect(flowPrimitive.data()).toBe("success data");
      
      dispose();
    });
  });
});
