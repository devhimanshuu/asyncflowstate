import { describe, it, expect, vi } from "vitest";
import { useFlow } from "../composables/useFlow";
import { effectScope } from "vue";

describe("Vue useFlow", () => {
  it("should reflect loading and success states", async () => {
    const action = vi.fn().mockResolvedValue("success data");

    const scope = effectScope();
    let flow: any;

    scope.run(() => {
      flow = useFlow(action);
    });

    expect(flow.status).toBe("idle");
    expect(flow.loading).toBe(false);

    const promise = flow.execute();

    expect(flow.status).toBe("loading");
    expect(flow.loading).toBe(true);

    await promise;

    expect(flow.status).toBe("success");
    expect(flow.loading).toBe(false);
    expect(flow.data).toBe("success data");

    scope.stop();
  });
});
