import { describe, it, expect, vi } from "vitest";
import { Flow } from "../flow";

describe("Time-Travel Flow Replay", () => {
  it("should record history and export state properly", async () => {
    let mockResolve!: (val: string) => void;
    const action = vi.fn(
      () =>
        new Promise<string>((r) => {
          mockResolve = r;
        }),
    );

    const flow = new Flow(action);

    // Simulate flow action
    const promise = flow.execute("arg1");
    expect(flow.history.length).toBeGreaterThan(0); // Should record loading

    // Check loading state
    expect(flow.state.status).toBe("loading");

    // Resolve action
    mockResolve("success-data");
    await promise;

    expect(flow.state.status).toBe("success");
    expect(flow.history.length).toBeGreaterThanOrEqual(2); // idle, loading, success

    // Test export
    const json = flow.exportState();
    expect(typeof json).toBe("string");

    const parsed = JSON.parse(json);
    expect(parsed.history).toBeDefined();
    expect(parsed.finalState.status).toBe("success");
    expect(parsed.finalState.data).toBe("success-data");
    expect(parsed.lastExecutionArgs).toEqual(["arg1"]);
  });

  it("should visually replay history using importState", async () => {
    // Generate a payload to replay
    const originalFlow = new Flow(async () => {
      throw new Error("Critical Failure");
    });

    // Intentionally suppress error throw so we just capture the state
    originalFlow.execute("some_input").catch(() => {});

    // Wait for failure
    await new Promise((r) => setTimeout(r, 50));

    const exportJson = originalFlow.exportState();

    // Now create a fresh flow
    const replayFlow = new Flow(async () => "will never get called");

    // Subscribe to catch states played back
    const capturedStates: any[] = [];
    replayFlow.subscribe((st) => {
      capturedStates.push({ ...st });
    });

    // Replay faster (1ms)
    await replayFlow.importState(exportJson, 1);

    // Should have walked through idle (reset) -> loading -> error
    expect(capturedStates.length).toBeGreaterThan(1);

    const finalReplayedState = capturedStates[capturedStates.length - 1];
    expect(finalReplayedState.status).toBe("error");
    expect(finalReplayedState.error.message).toBe("Critical Failure");
    expect(replayFlow.state.status).toBe("error");
  });
});
