import { describe, it, expect, vi } from "vitest";
import { createAstroFlow } from "../actions/createAstroFlow";

describe("createAstroFlow", () => {
  it("should handle standard async actions", async () => {
    const action = vi.fn().mockResolvedValue("astro-success");
    const flow = createAstroFlow(action);

    const result = await flow.execute();
    expect(result).toBe("astro-success");
    expect(flow.state.status).toBe("success");
  });

  it("should unpack Astro-style { data, error } results", async () => {
    // Astro Actions sometimes return this format when used with server actions
    const action = vi.fn().mockResolvedValue({ data: "payload", error: null });
    const flow = createAstroFlow(action);

    const result = await flow.execute();
    expect(result).toBe("payload");
  });

  it("should throw when Astro-style error is present", async () => {
    const action = vi
      .fn()
      .mockResolvedValue({ data: null, error: new Error("Astro Failure") });
    const flow = createAstroFlow(action);

    await flow.execute();
    expect(flow.state.status).toBe("error");
    expect((flow.state.error as Error).message).toBe("Astro Failure");
  });
});
