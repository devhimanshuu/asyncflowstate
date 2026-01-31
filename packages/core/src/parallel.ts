import { Flow, FlowStatus } from "./flow";

export type ParallelStrategy = "all" | "allSettled" | "race";

export interface ParallelState {
  status: FlowStatus;
  progress: number;
  results: Record<string, any> | any[];
  errors: Record<string, any> | any[];
}

export class FlowParallel {
  private _state: ParallelState = {
    status: "idle",
    progress: 0,
    results: [],
    errors: [],
  };

  private listeners = new Set<(state: ParallelState) => void>();
  private flows: Flow<any, any, any>[] = [];
  private flowMap: Record<string, Flow<any, any, any>> = {};
  private isMap = false;

  constructor(
    input: Flow<any, any, any>[] | Record<string, Flow<any, any, any>>,
    private strategy: ParallelStrategy = "all"
  ) {
    if (Array.isArray(input)) {
      this.flows = input;
      this._state.results = [];
      this._state.errors = [];
    } else {
      this.flowMap = input;
      this.flows = Object.values(input);
      this.isMap = true;
      this._state.results = {};
      this._state.errors = {};
    }
  }

  public get state(): ParallelState {
    return { ...this._state };
  }

  public subscribe(listener: (state: ParallelState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(updates: Partial<ParallelState>): void {
    this._state = { ...this._state, ...updates };
    this.notify();
  }

  private notify(): void {
    const snapshot = { ...this._state };
    this.listeners.forEach((l) => l(snapshot));
  }

  public async execute(...args: any[]): Promise<any | undefined> {
    if (this._state.status === "loading") return;

    this.setState({
      status: "loading",
      progress: 0,
      results: this.isMap ? {} : [],
      errors: this.isMap ? {} : [],
    });

    const flowEntries = this.isMap
      ? Object.entries(this.flowMap)
      : this.flows.map((f, i) => [i.toString(), f] as [string, Flow<any, any, any>]);

    const updateAggregateState = () => {
      let totalProgress = 0;
      let finishedCount = 0;
      let hasError = false;
      let allFinished = true;

      const results: any = this.isMap ? {} : [];
      const errors: any = this.isMap ? {} : [];

      flowEntries.forEach(([key, flow], index) => {
        totalProgress += flow.progress;
        if (flow.status !== "loading" && flow.status !== "idle") {
          finishedCount++;
        }
        if (flow.status === "error") hasError = true;
        if (flow.status === "loading") allFinished = false;

        const idx = this.isMap ? key : parseInt(key);
        results[idx] = flow.data;
        errors[idx] = flow.error;
      });

      const avgProgress = totalProgress / this.flows.length;

      let nextStatus: FlowStatus = "loading";
      if (this.strategy === "all") {
        if (hasError) nextStatus = "error";
        else if (finishedCount === this.flows.length) nextStatus = "success";
      } else if (this.strategy === "allSettled") {
        if (finishedCount === this.flows.length) {
          nextStatus = hasError ? "error" : "success";
        }
      } else if (this.strategy === "race") {
        if (finishedCount > 0) {
          const firstFinished = this.flows.find(f => f.status === "success" || f.status === "error");
          nextStatus = firstFinished?.status === "error" ? "error" : "success";
        }
      }

      this.setState({
        progress: avgProgress,
        status: nextStatus,
        results,
        errors,
      });

      return nextStatus;
    };

    // Subscribe to each flow to update aggregate progress
    const unsubs = this.flows.map((flow) =>
      flow.subscribe(() => {
        updateAggregateState();
      })
    );

    try {
      if (this.strategy === "all") {
        await Promise.all(this.flows.map((f) => f.execute(...args)));
      } else if (this.strategy === "allSettled") {
        await Promise.allSettled(this.flows.map((f) => f.execute(...args)));
      } else if (this.strategy === "race") {
        await Promise.race(this.flows.map((f) => f.execute(...args)));
      }

      const status = updateAggregateState();
      return status === "success" ? this._state.results : undefined;
    } catch (error) {
      updateAggregateState();
      return undefined;
    } finally {
      unsubs.forEach((u) => u());
    }
  }

  public reset(): void {
    this.flows.forEach((f) => f.reset());
    this.setState({
      status: "idle",
      progress: 0,
      results: this.isMap ? {} : [],
      errors: this.isMap ? {} : [],
    });
  }

  public cancel(): void {
    this.flows.forEach((f) => f.cancel());
    this.setState({ status: "idle" });
  }
}
