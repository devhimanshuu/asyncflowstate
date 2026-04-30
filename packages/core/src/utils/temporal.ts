/**
 * Temporal Replay — Time-Travel Debugging
 *
 * Records the entire flow lifecycle as a replayable timeline. Developers can
 * scrub forward and backward through time, seeing exact state snapshots at any point.
 */

import type { FlowState } from "../flow";

export interface TemporalOptions {
  /** Enable temporal recording. */
  record: boolean;
  /** Maximum number of snapshots to keep. Default: 200 */
  maxSnapshots?: number;
  /** Include action arguments in snapshots. Default: false */
  includeArgs?: boolean;
}

export interface TemporalSnapshot<TData = any, TError = any> {
  /** Monotonic index. */
  index: number;
  /** High-resolution timestamp. */
  timestamp: number;
  /** The flow state at this point. */
  state: FlowState<TData, TError>;
  /** Optional action arguments. */
  args?: any[];
  /** What triggered this snapshot. */
  trigger:
    | "start"
    | "success"
    | "error"
    | "retry"
    | "cancel"
    | "reset"
    | "stream"
    | "progress"
    | "prewarm"
    | "purgatory";
  /** Duration since the previous snapshot (ms). */
  delta: number;
}

export interface TimelineExport<TData = any, TError = any> {
  flowName: string;
  startTime: number;
  endTime: number;
  totalDuration: number;
  snapshotCount: number;
  snapshots: TemporalSnapshot<TData, TError>[];
}

/**
 * TemporalRecorder captures flow state transitions for time-travel debugging.
 */
export class TemporalRecorder<TData = any, TError = any> {
  private snapshots: TemporalSnapshot<TData, TError>[] = [];
  private config: Required<TemporalOptions>;
  private flowName: string;
  private counter = 0;
  private cursorIndex = -1;

  constructor(flowName: string, options: TemporalOptions) {
    this.flowName = flowName;
    this.config = {
      record: options.record,
      maxSnapshots: options.maxSnapshots ?? 200,
      includeArgs: options.includeArgs ?? false,
    };
  }

  /** Record a state snapshot. */
  public capture(
    state: FlowState<TData, TError>,
    trigger: TemporalSnapshot["trigger"],
    args?: any[],
  ): void {
    if (!this.config.record) return;

    const now = performance.now();
    const lastTimestamp =
      this.snapshots.length > 0
        ? this.snapshots[this.snapshots.length - 1].timestamp
        : now;

    const snapshot: TemporalSnapshot<TData, TError> = {
      index: this.counter++,
      timestamp: now,
      state: structuredClone(state),
      trigger,
      delta: Math.round(now - lastTimestamp),
      ...(this.config.includeArgs && args ? { args } : {}),
    };

    this.snapshots.push(snapshot);
    this.cursorIndex = this.snapshots.length - 1;

    // Enforce maximum
    if (this.snapshots.length > this.config.maxSnapshots) {
      this.snapshots.shift();
      this.cursorIndex--;
    }
  }

  /** Scrub to a specific timestamp or index. */
  public scrubTo(
    indexOrTimestamp: number,
  ): TemporalSnapshot<TData, TError> | null {
    if (this.snapshots.length === 0) return null;

    // If it looks like an index (small number), use index lookup
    if (indexOrTimestamp < this.snapshots.length) {
      this.cursorIndex = indexOrTimestamp;
      return this.snapshots[indexOrTimestamp];
    }

    // Otherwise, find closest timestamp
    let closest = this.snapshots[0];
    let closestDiff = Math.abs(this.snapshots[0].timestamp - indexOrTimestamp);
    let closestIdx = 0;

    for (let i = 1; i < this.snapshots.length; i++) {
      const diff = Math.abs(this.snapshots[i].timestamp - indexOrTimestamp);
      if (diff < closestDiff) {
        closest = this.snapshots[i];
        closestDiff = diff;
        closestIdx = i;
      }
    }

    this.cursorIndex = closestIdx;
    return closest;
  }

  /** Step forward one snapshot. */
  public stepForward(): TemporalSnapshot<TData, TError> | null {
    if (this.cursorIndex < this.snapshots.length - 1) {
      this.cursorIndex++;
      return this.snapshots[this.cursorIndex];
    }
    return null;
  }

  /** Step backward one snapshot. */
  public stepBackward(): TemporalSnapshot<TData, TError> | null {
    if (this.cursorIndex > 0) {
      this.cursorIndex--;
      return this.snapshots[this.cursorIndex];
    }
    return null;
  }

  /** Get the current cursor position. */
  public getCurrent(): TemporalSnapshot<TData, TError> | null {
    return this.snapshots[this.cursorIndex] || null;
  }

  /** Get all recorded snapshots. */
  public getTimeline(): TemporalSnapshot<TData, TError>[] {
    return [...this.snapshots];
  }

  /** Export the entire timeline as a JSON-serializable object. */
  public export(): TimelineExport<TData, TError> {
    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];

    return {
      flowName: this.flowName,
      startTime: first?.timestamp ?? 0,
      endTime: last?.timestamp ?? 0,
      totalDuration:
        first && last ? Math.round(last.timestamp - first.timestamp) : 0,
      snapshotCount: this.snapshots.length,
      snapshots: [...this.snapshots],
    };
  }

  /** Playback at a given speed multiplier. Returns async generator. */
  public async *playback(
    speed: number = 1,
  ): AsyncGenerator<TemporalSnapshot<TData, TError>> {
    for (let i = 0; i < this.snapshots.length; i++) {
      const snapshot = this.snapshots[i];
      yield snapshot;

      if (i < this.snapshots.length - 1) {
        const nextDelta = this.snapshots[i + 1].delta;
        await new Promise((r) => setTimeout(r, nextDelta / speed));
      }
    }
  }

  /** Reset the recorder. */
  public reset(): void {
    this.snapshots = [];
    this.counter = 0;
    this.cursorIndex = -1;
  }

  /** Get snapshot count. */
  public get length(): number {
    return this.snapshots.length;
  }
}
