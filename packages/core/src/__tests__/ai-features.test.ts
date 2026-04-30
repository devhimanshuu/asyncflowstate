import { describe, it, expect, vi, beforeEach } from "vitest";
import { Flow } from "../flow";

describe("Flow AI Features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Predictive Intent (Pre-warming)", () => {
    it("should transition to prewarmed status and emit signal", async () => {
      const flow = new Flow(async () => "data");
      const prewarmSpy = vi.fn();
      flow.signals.prewarm.subscribe(prewarmSpy);

      await flow.prewarm();

      expect(flow.status).toBe("prewarmed");
      expect(prewarmSpy).toHaveBeenCalled();
    });
  });

  describe("Predictive Optimistic Rollbacks", () => {
    it("should skip optimistic update if success probability is too low", async () => {
      const flow = new Flow(async () => "server-data", {
        optimisticResult: "optimistic-data",
        probabilityModel: { successThreshold: 0.8 },
      });

      // Simulate low probability (offline)
      vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);

      const promise = flow.execute();

      // Should be 'loading' (simulated), not the optimistic 'success'
      expect(flow.status).toBe("loading");
      expect(flow.data).toBe(null);

      await promise;
      expect(flow.status).toBe("success");
      expect(flow.data).toBe("server-data");
    });
  });

  describe("AI-Streaming Orchestration", () => {
    it("should cancel stream if hallucination is detected", async () => {
      async function* hallucinatingStream() {
        yield "Hello ";
        yield "████████████████████"; // Hallucination marker
      }

      const flow = new Flow(hallucinatingStream as any, {
        streamingPolicy: { hallucinationDetection: true },
      });

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await flow.execute();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("hallucination detected"),
      );
      expect(flow.status).toBe("idle"); // Cancelled
    });
  });

  describe("Context-Aware Auto-Throttle (Rage Clicking)", () => {
    it("should activate purgatory if rage clicking is detected", async () => {
      const flow = new Flow(async () => "data", {
        autoThrottle: { monitorUserStress: true, rageClickThreshold: 3 },
      });

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Rapid clicks
      flow.execute();
      flow.execute();
      flow.execute();
      flow.execute();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Rage clicking detected"),
      );
      // Should have purgatory enabled now
      expect((flow as any).options.purgatory?.duration).toBe(1500);
    });
  });
});
