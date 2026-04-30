import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Flow } from "../flow";
import { FlowDNA } from "../utils/flow-dna";
import { FlowMesh } from "../utils/mesh";
import { CollaborativeState, LWWRegister } from "../utils/collaborative";
import { AmbientSensor } from "../utils/ambient";
import { SentimentTracker } from "../utils/sentiment";
import { EdgeDetector } from "../utils/edge";
import { createWorkerAction } from "../utils/worker-utils";

// Mock BroadcastChannel
class MockBroadcastChannel {
  onmessage: ((ev: any) => void) | null = null;
  constructor(public name: string) {}
  postMessage(data: any) {
    // In a real test we'd simulate other instances, but here we just check if it's called
  }
  close() {}
}

vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);

describe("AsyncFlowState v3.0 Next-Gen Features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Flow DNA (Genetic Auto-Tuning)", () => {
    it("should record performance fingerprints and evolve configurations", () => {
      const dna = new FlowDNA("test-flow", { enabled: true, generations: 3 });

      // Record 3 generations worth of data
      dna.record({
        latency: 100,
        retries: 0,
        cacheHit: true,
        success: true,
        payloadSize: 100,
      });
      dna.record({
        latency: 150,
        retries: 0,
        cacheHit: true,
        success: true,
        payloadSize: 100,
      });
      dna.record({
        latency: 200,
        retries: 1,
        cacheHit: false,
        success: true,
        payloadSize: 100,
      });

      const evolved = dna.getEvolved();
      expect(evolved).not.toBeNull();
      expect(evolved?.generation).toBe(3);
      expect(evolved?.suggestedTimeout).toBeGreaterThan(100);
      expect(evolved?.fitnessScore).toBeGreaterThan(0);
    });

    it("should persist genomes to localStorage", () => {
      const dna = new FlowDNA("persist-test", { enabled: true });
      dna.record({
        latency: 100,
        retries: 0,
        cacheHit: true,
        success: true,
        payloadSize: 100,
      });

      const saved = localStorage.getItem("af_dna_persist-test");
      expect(saved).not.toBeNull();
      expect(JSON.parse(saved!).length).toBe(1);
    });
  });

  describe("Flow Mesh (Cross-Tab Coordination)", () => {
    it("should manage leader election status", () => {
      const mesh = new FlowMesh({ channel: "test-mesh", heartbeat: 100 });
      // By default it starts election
      expect(mesh.peers).toBe(0);
      // Clean up
      mesh.dispose();
    });

    it("should share cache entries across the mesh", () => {
      const mesh = new FlowMesh({ channel: "cache-mesh" });
      const spy = vi.spyOn(MockBroadcastChannel.prototype, "postMessage");

      mesh.shareResult("user_1", { name: "Alice" });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "cache",
          payload: { key: "user_1", data: { name: "Alice" } },
        }),
      );
      mesh.dispose();
    });
  });

  describe("Collaborative CRDT Flows", () => {
    it("should resolve conflicts using Last-Writer-Wins", () => {
      const register = new LWWRegister<string>();

      register.set("first", 1000);
      register.set("second", 2000);
      register.set("third", 1500); // Older than 'second'

      expect(register.get()).toBe("second");
    });

    it("should broadcast local updates to peers", () => {
      const collab = new CollaborativeState({
        enabled: true,
        channel: "collab-test",
      });
      const spy = vi.spyOn(MockBroadcastChannel.prototype, "postMessage");

      collab.update({ count: 1 });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "update",
          payload: { count: 1 },
        }),
      );
      collab.dispose();
    });

    it("should track user presence", () => {
      const collab = new CollaborativeState({ enabled: true, presence: true });
      collab.updatePresence("user_123", "editor_field");

      const presence = collab.getPresence();
      expect(presence.length).toBe(1);
      expect(presence[0].userId).toBe("user_123");
      collab.dispose();
    });
  });

  describe("Ambient Intelligence", () => {
    it("should detect environment telemetry", () => {
      const sensor = AmbientSensor.getInstance();
      const telemetry = sensor.getState();

      expect(telemetry).toHaveProperty("battery");
      expect(telemetry).toHaveProperty("networkType");
      expect(telemetry).toHaveProperty("estimatedCPU");
    });
  });

  describe("Emotional UX (Sentiment Analysis)", () => {
    it("should calculate frustration level from signals", () => {
      const tracker = SentimentTracker.getInstance();
      tracker.reset();

      // Simulate abandonment signals
      (tracker as any).addSignal("abandonment", 0.5);
      (tracker as any).addSignal("abandonment", 0.8);

      const level = tracker.getFrustrationLevel();
      expect(level).toBeGreaterThan(0);
      expect(level).toBeLessThanOrEqual(1);
    });
  });

  describe("Edge-First Native", () => {
    it("should detect runtime environment", () => {
      const runtime = EdgeDetector.detect();
      // In Vitest with JSDOM, it should be 'browser'
      expect(runtime).toBe("browser");
      expect(EdgeDetector.isEdge()).toBe(false);
    });
  });

  describe("Web Worker Orchestration", () => {
    it("should create a proxied worker action", async () => {
      const mockWorker = {
        postMessage: vi.fn(),
        terminate: vi.fn(),
        onmessage: null as any,
        onerror: null as any,
      };

      vi.stubGlobal(
        "Worker",
        vi.fn().mockImplementation(function () {
          return mockWorker;
        }),
      );
      vi.stubGlobal("URL", {
        createObjectURL: vi.fn().mockReturnValue("blob-url"),
      });
      vi.stubGlobal("Blob", vi.fn());

      const heavyAction = (n: number) => n * 2;
      const workerAction = createWorkerAction(heavyAction);

      const promise = workerAction(5);

      // The onmessage is assigned synchronously in workerAction
      expect(mockWorker.onmessage).toBeDefined();

      // Simulate worker response
      mockWorker.onmessage({ data: { type: "SUCCESS", result: 10 } });

      const result = await promise;
      expect(result).toBe(10);
      expect(mockWorker.terminate).toHaveBeenCalled();
    });
  });
});
