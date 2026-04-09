import { describe, it, expect, vi } from "vitest";
import { get } from "svelte/store";
import { createFlow } from "../stores/createFlow";

describe("Svelte createFlow", () => {
  it("should reflect loading and success states via store subscription", async () => {
    const action = vi.fn().mockResolvedValue("success data");
    const flowStore = createFlow(action);

    expect(get(flowStore).status).toBe("idle");
    expect(get(flowStore).loading).toBe(false);

    const promise = flowStore.execute();
    
    expect(get(flowStore).status).toBe("loading");
    expect(get(flowStore).loading).toBe(true);

    await promise;

    expect(get(flowStore).status).toBe("success");
    expect(get(flowStore).loading).toBe(false);
    expect(get(flowStore).data).toBe("success data");
    
    flowStore.destroy();
  });
});
