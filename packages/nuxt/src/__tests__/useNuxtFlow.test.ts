import { describe, it, expect, vi, beforeEach } from "vitest";
import { reactive } from "vue";

// Mock #app using hoisted to ensure it's ready for the import
vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $config: {},
  }),
}));

import { useNuxtFlow } from "../composables/useNuxtFlow";

// Mock @asyncflowstate/vue
vi.mock("@asyncflowstate/vue", () => ({
  useFlow: vi.fn((action, options) => {
    const state = reactive({
      status: "idle" as string,
      data: null as any,
      error: null as any,
      execute: async (...args: any[]) => {
        state.status = "loading";
        try {
          const res = await action(...args);
          state.data = res;
          state.status = "success";
          return res;
        } catch (err) {
          state.error = err;
          state.status = "error";
          throw err;
        }
      },
    });
    return state;
  }),
}));

describe("useNuxtFlow", () => {
  it("should initialize with Nuxt context and execute successfully", async () => {
    const action = vi.fn().mockResolvedValue("nuxt-data");
    const flow = useNuxtFlow(action);

    expect(flow.status).toBe("idle");

    const result = await flow.execute();
    expect(result).toBe("nuxt-data");
    expect(flow.status).toBe("success");
    expect(action).toHaveBeenCalled();
  });

  it("should handle errors in Nuxt environment", async () => {
    const action = vi.fn().mockRejectedValue(new Error("Nuxt Error"));
    const flow = useNuxtFlow(action);

    await expect(flow.execute()).rejects.toThrow("Nuxt Error");
    expect(flow.status).toBe("error");
  });
});
