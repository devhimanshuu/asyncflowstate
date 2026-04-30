/**
 * Ambient Intelligence — Device & Environment-Aware Flows
 *
 * Flows that sense the device's physical state — battery level, network quality,
 * CPU thermal throttling, available memory — and dynamically adapt their behavior.
 */

export type AmbientAction =
  | "defer"
  | "compress"
  | "throttle"
  | "purge"
  | "skip";

export interface AmbientRule {
  /** Action to take when the condition is met. */
  action: AmbientAction;
}

export interface AmbientOptions {
  /** Enable ambient intelligence. */
  enabled: boolean;
  /** Rules for adapting based on device state. */
  rules?: {
    /** Defer execution when battery is below this percentage. */
    lowBattery?: { below: number; action: AmbientAction };
    /** Adapt when network is slow. */
    slowNetwork?: { below: "2g" | "3g" | "4g"; action: AmbientAction };
    /** Throttle when CPU usage is high (estimated via frame rate). */
    highCPU?: { above: number; action: AmbientAction };
    /** Purge cache when memory is low (bytes). */
    lowMemory?: { below: number; action: AmbientAction };
  };
  /** Callback when an adaptation is applied. */
  onAdapt?: (adaptation: AmbientAdaptation) => void;
}

export interface AmbientAdaptation {
  reason: string;
  action: AmbientAction;
  timestamp: number;
  deviceState: DeviceState;
}

export interface DeviceState {
  battery: number | null;
  charging: boolean | null;
  networkType: string | null;
  estimatedCPU: number | null;
  memoryUsage: number | null;
}

const NETWORK_SPEED_ORDER = ["slow-2g", "2g", "3g", "4g"];

/**
 * AmbientSensor monitors device state and provides real-time environment data.
 */
export class AmbientSensor {
  private static instance: AmbientSensor;
  private state: DeviceState = {
    battery: null,
    charging: null,
    networkType: null,
    estimatedCPU: null,
    memoryUsage: null,
  };
  private frameTimestamps: number[] = [];
  private rafId: number | null = null;

  private constructor() {
    this.startMonitoring();
  }

  public static getInstance(): AmbientSensor {
    if (!AmbientSensor.instance) {
      AmbientSensor.instance = new AmbientSensor();
    }
    return AmbientSensor.instance;
  }

  /** Get a snapshot of the current device state. */
  public getState(): DeviceState {
    return { ...this.state };
  }

  private async startMonitoring(): Promise<void> {
    // Battery API
    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        this.state.battery = Math.round(battery.level * 100);
        this.state.charging = battery.charging;
        battery.addEventListener("levelchange", () => {
          this.state.battery = Math.round(battery.level * 100);
        });
        battery.addEventListener("chargingchange", () => {
          this.state.charging = battery.charging;
        });
      } catch (_e) {
        /* Battery API not available */
      }
    }

    // Network Information API
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const conn = (navigator as any).connection;
      this.state.networkType = conn?.effectiveType || null;
      conn?.addEventListener?.("change", () => {
        this.state.networkType = conn.effectiveType;
      });
    }

    // CPU estimation via frame rate monitoring
    if (typeof requestAnimationFrame !== "undefined") {
      const measureFrameRate = (timestamp: number) => {
        this.frameTimestamps.push(timestamp);
        if (this.frameTimestamps.length > 60) {
          this.frameTimestamps.shift();
        }

        if (this.frameTimestamps.length >= 10) {
          const elapsed =
            this.frameTimestamps[this.frameTimestamps.length - 1] -
            this.frameTimestamps[0];
          const fps = ((this.frameTimestamps.length - 1) / elapsed) * 1000;
          // Estimate CPU pressure: 60fps = 0%, 30fps = 50%, 15fps = 75%
          this.state.estimatedCPU = Math.round(
            Math.max(0, Math.min(100, (1 - fps / 60) * 100)),
          );
        }

        this.rafId = requestAnimationFrame(measureFrameRate);
      };
      this.rafId = requestAnimationFrame(measureFrameRate);
    }
  }

  /** Check ambient rules and return adaptations needed. */
  public checkRules(options: AmbientOptions): AmbientAdaptation | null {
    if (!options.enabled || !options.rules) return null;

    const { rules } = options;
    const state = this.state;

    // Check battery
    if (
      rules.lowBattery &&
      state.battery !== null &&
      !state.charging &&
      state.battery < rules.lowBattery.below
    ) {
      return this.createAdaptation(
        `Battery at ${state.battery}% (below ${rules.lowBattery.below}%)`,
        rules.lowBattery.action,
        state,
      );
    }

    // Check network
    if (rules.slowNetwork && state.networkType) {
      const currentIdx = NETWORK_SPEED_ORDER.indexOf(state.networkType);
      const thresholdIdx = NETWORK_SPEED_ORDER.indexOf(rules.slowNetwork.below);
      if (currentIdx !== -1 && currentIdx <= thresholdIdx) {
        return this.createAdaptation(
          `Network speed ${state.networkType} (below ${rules.slowNetwork.below})`,
          rules.slowNetwork.action,
          state,
        );
      }
    }

    // Check CPU
    if (
      rules.highCPU &&
      state.estimatedCPU !== null &&
      state.estimatedCPU > rules.highCPU.above
    ) {
      return this.createAdaptation(
        `CPU pressure at ${state.estimatedCPU}% (above ${rules.highCPU.above}%)`,
        rules.highCPU.action,
        state,
      );
    }

    return null;
  }

  private createAdaptation(
    reason: string,
    action: AmbientAction,
    deviceState: DeviceState,
  ): AmbientAdaptation {
    return {
      reason,
      action,
      timestamp: Date.now(),
      deviceState: { ...deviceState },
    };
  }

  /** Clean up monitoring. */
  public dispose(): void {
    if (this.rafId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(this.rafId);
    }
  }
}
