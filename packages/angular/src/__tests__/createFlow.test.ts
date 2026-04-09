import { describe, it, expect, vi } from "vitest";
import { createFlow } from "../services/createFlow";

describe("Angular createFlow", () => {
  it("should reflect loading and success states via BehaviorSubject", async () => {
    const action = vi.fn().mockResolvedValue("success data");
    const flowService = createFlow(action);

    expect(flowService.state$.getValue().status).toBe("idle");
    expect(flowService.state$.getValue().loading).toBe(false);

    const promise = flowService.execute();
    
    expect(flowService.state$.getValue().status).toBe("loading");
    expect(flowService.state$.getValue().loading).toBe(true);

    await promise;

    expect(flowService.state$.getValue().status).toBe("success");
    expect(flowService.state$.getValue().loading).toBe(false);
    expect(flowService.state$.getValue().data).toBe("success data");
    
    flowService.destroy();
  });
});
