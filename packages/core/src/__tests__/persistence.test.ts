import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Flow } from "../flow";

describe("Smart Persistence", () => {
  const mockStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("localStorage", mockStorage);
    vi.stubGlobal("sessionStorage", mockStorage);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function waitForRestoration(flow: any) {
    // Wait for dynamic import and state update
    for (let i = 0; i < 50; i++) {
      if ((flow as any).hasRestoredState) return;
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  it("should restore success state on initialization", async () => {
    const data = { id: 1, name: "Test" };
    const persistedState = {
      status: "success",
      data,
      error: null,
      progress: 100,
      timestamp: Date.now(),
      wasLoading: false,
    };

    mockStorage.getItem.mockReturnValue(JSON.stringify(persistedState));

    const action = vi.fn().mockResolvedValue(data);
    const flow = new Flow(action, {
      persist: { key: "test-flow" },
    });

    await waitForRestoration(flow);

    expect(flow.status).toBe("success");
    expect(flow.data).toEqual(data);
    expect(flow.progress).toBe(100);
  });

  it("should persist success state when action completes", async () => {
    const data = { id: 1 };
    const action = vi.fn().mockResolvedValue(data);
    const flow = new Flow(action, {
      persist: { key: "test-flow" },
    });

    await flow.execute();

    // Wait for dynamic import in persistCurrentState
    await new Promise((r) => setTimeout(r, 100));

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      "test-flow",
      expect.stringContaining('"status":"success"'),
    );
  });

  it("should persist loading state if persistLoading is true", async () => {
    const action = vi
      .fn()
      .mockImplementation(() => new Promise((r) => setTimeout(r, 100)));
    const flow = new Flow(action, {
      persist: { key: "test-flow", persistLoading: true },
    });

    const promise = flow.execute("arg1", 123);

    // Wait for dynamic import
    await new Promise((r) => setTimeout(r, 100));

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      "test-flow",
      expect.stringContaining('"status":"loading"'),
    );
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      "test-flow",
      expect.stringContaining('"lastArgs":["arg1",123]'),
    );

    await promise;
  });

  it("should notify onInterruptedLoading when restoring a loading state", async () => {
    const onInterruptedLoading = vi.fn();
    const persistedState = {
      status: "loading",
      data: null,
      error: null,
      progress: 45,
      timestamp: Date.now(),
      wasLoading: true,
      lastArgs: ["resume-me"],
    };

    mockStorage.getItem.mockReturnValue(JSON.stringify(persistedState));

    const action = vi.fn().mockResolvedValue("done");
    const flow = new Flow(action, {
      persist: {
        key: "resumable-flow",
        persistLoading: true,
        onInterruptedLoading,
      },
    });

    await waitForRestoration(flow);

    expect(onInterruptedLoading).toHaveBeenCalled();
    expect(flow.status).toBe("loading");
    expect(flow.progress).toBe(45);
    expect((flow as any).lastPersistedArgs).toEqual(["resume-me"]);

    // Test resumption
    const promise = flow.resume();

    // Wait for the action to be called
    for (let i = 0; i < 20; i++) {
      if (action.mock.calls.length > 0) break;
      await new Promise((r) => setTimeout(r, 10));
    }

    expect(action).toHaveBeenCalledWith("resume-me");
    await promise;
    expect(flow.status).toBe("success");
  });

  it("should respect TTL and clear stale state", async () => {
    const oldState = {
      status: "success",
      data: "stale",
      timestamp: Date.now() - 100000,
    };

    mockStorage.getItem.mockReturnValue(JSON.stringify(oldState));

    const action = vi.fn().mockResolvedValue("new");
    const flow = new Flow(action, {
      persist: {
        key: "stale-flow",
        ttl: 5000,
      },
    });

    // Wait for potential restoration attempt
    await new Promise((r) => setTimeout(r, 100));

    expect(flow.status).toBe("idle");
    expect(mockStorage.removeItem).toHaveBeenCalledWith("stale-flow");
  });

  it("should support custom onRestore validation", async () => {
    const persistedState = {
      status: "success",
      data: { version: 1 },
      timestamp: Date.now(),
    };

    mockStorage.getItem.mockReturnValue(JSON.stringify(persistedState));

    const onRestore = vi.fn().mockReturnValue(false);
    const flow = new Flow(vi.fn(), {
      persist: {
        key: "versioned-flow",
        onRestore,
      },
    });

    await new Promise((r) => setTimeout(r, 100));

    expect(onRestore).toHaveBeenCalled();
    expect(flow.status).toBe("idle");
  });
});
