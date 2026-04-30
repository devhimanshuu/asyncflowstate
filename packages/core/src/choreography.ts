/**
 * Flow Choreography — Declarative DAG Orchestration
 *
 * Define complex multi-flow workflows as a Directed Acyclic Graph (DAG).
 * The engine automatically parallelizes independent branches, sequences
 * dependent ones, handles partial failures, and provides real-time progress.
 */

import { Flow, type FlowAction } from "./flow";

export interface ChoreographyStep<TData = any> {
  /** The async action to execute for this step. */
  action: FlowAction<TData, any[]>;
  /** Step names that must complete before this step runs. */
  dependsOn?: string[];
  /** If true, failure of this step won't stop the pipeline. */
  optional?: boolean;
  /** Timeout for this specific step (ms). */
  timeout?: number;
}

export interface ChoreographyOptions<
  TSteps extends Record<string, ChoreographyStep>,
> {
  /** Name of the choreography for debugging. */
  name: string;
  /** Map of step name → step definition. */
  steps: TSteps;
  /** Called when each step completes. */
  onStepComplete?: (stepName: string, result: any) => void;
  /** Called when a step fails. */
  onStepError?: (stepName: string, error: any) => void;
  /** Rollback strategy on failure. */
  rollbackStrategy?: "cascade" | "none";
}

export type ChoreographyStatus = "idle" | "running" | "completed" | "failed";

export interface ChoreographyState {
  status: ChoreographyStatus;
  /** Per-step completion status. */
  steps: Record<
    string,
    {
      status: "pending" | "running" | "done" | "failed" | "skipped";
      result?: any;
      error?: any;
    }
  >;
  /** Overall progress (0-100). */
  progress: number;
  /** Results keyed by step name. */
  results: Record<string, any>;
  /** Errors keyed by step name. */
  errors: Record<string, any>;
}

/**
 * Choreograph orchestrates complex multi-step workflows as a DAG.
 */
export class Choreography<TSteps extends Record<string, ChoreographyStep>> {
  private options: ChoreographyOptions<TSteps>;
  private executionOrder: string[][];
  private state: ChoreographyState;
  private listeners = new Set<(state: ChoreographyState) => void>();

  constructor(options: ChoreographyOptions<TSteps>) {
    this.options = options;
    this.executionOrder = this.topologicalSort();
    this.state = this.createInitialState();
  }

  /** Execute the entire choreography. */
  public async execute(...args: any[]): Promise<Record<string, any>> {
    this.state = this.createInitialState();
    this.state.status = "running";
    this.notify();

    const totalSteps = Object.keys(this.options.steps).length;
    let completedSteps = 0;

    try {
      for (const layer of this.executionOrder) {
        // Execute all steps in this layer in parallel
        const layerPromises = layer.map(async (stepName) => {
          const step = this.options.steps[stepName];

          // Check if dependencies succeeded
          if (step.dependsOn) {
            const depsFailed = step.dependsOn.some(
              (dep) => this.state.steps[dep]?.status === "failed",
            );
            if (depsFailed && !step.optional) {
              this.state.steps[stepName] = { status: "skipped" };
              this.notify();
              return;
            }
          }

          this.state.steps[stepName] = { status: "running" };
          this.notify();

          try {
            // Pass previous step results as context
            const result = await this.executeStep(stepName, step, args);
            this.state.steps[stepName] = { status: "done", result };
            this.state.results[stepName] = result;
            completedSteps++;
            this.state.progress = Math.round(
              (completedSteps / totalSteps) * 100,
            );
            this.options.onStepComplete?.(stepName, result);
            this.notify();
          } catch (error) {
            this.state.steps[stepName] = { status: "failed", error };
            this.state.errors[stepName] = error;
            this.options.onStepError?.(stepName, error);

            if (!step.optional) {
              throw error;
            }
            completedSteps++;
            this.state.progress = Math.round(
              (completedSteps / totalSteps) * 100,
            );
            this.notify();
          }
        });

        await Promise.all(layerPromises);
      }

      this.state.status = "completed";
      this.state.progress = 100;
      this.notify();
      return this.state.results;
    } catch (error) {
      this.state.status = "failed";
      this.notify();

      if (this.options.rollbackStrategy === "cascade") {
        await this.cascadeRollback();
      }

      throw error;
    }
  }

  private async executeStep(
    _name: string,
    step: ChoreographyStep,
    args: any[],
  ): Promise<any> {
    const flow = new Flow(step.action, {
      timeout: step.timeout,
    });
    return flow.execute(...(args as any));
  }

  /** Topological sort to determine execution layers. */
  private topologicalSort(): string[][] {
    const steps = this.options.steps;
    const stepNames = Object.keys(steps);
    const inDegree: Record<string, number> = {};
    const adjacency: Record<string, string[]> = {};

    // Initialize
    for (const name of stepNames) {
      inDegree[name] = 0;
      adjacency[name] = [];
    }

    // Build graph
    for (const name of stepNames) {
      const deps = steps[name].dependsOn || [];
      for (const dep of deps) {
        adjacency[dep].push(name);
        inDegree[name]++;
      }
    }

    // BFS layers (Kahn's algorithm)
    const layers: string[][] = [];
    let queue = stepNames.filter((n) => inDegree[n] === 0);

    while (queue.length > 0) {
      layers.push([...queue]);
      const nextQueue: string[] = [];

      for (const node of queue) {
        for (const neighbor of adjacency[node]) {
          inDegree[neighbor]--;
          if (inDegree[neighbor] === 0) {
            nextQueue.push(neighbor);
          }
        }
      }

      queue = nextQueue;
    }

    return layers;
  }

  private async cascadeRollback(): Promise<void> {
    console.info(
      `[Choreography:${this.options.name}] Cascade rollback triggered.`,
    );
    // In a real implementation, this would call compensating actions
    // registered per step. For now, we log the rollback intent.
    const completedSteps = Object.entries(this.state.steps)
      .filter(([_, s]) => s.status === "done")
      .map(([name]) => name);

    for (const stepName of completedSteps.reverse()) {
      console.info(`[Choreography] Rolling back: ${stepName}`);
    }
  }

  private createInitialState(): ChoreographyState {
    const steps: ChoreographyState["steps"] = {};
    for (const name of Object.keys(this.options.steps)) {
      steps[name] = { status: "pending" };
    }
    return {
      status: "idle",
      steps,
      progress: 0,
      results: {},
      errors: {},
    };
  }

  /** Subscribe to state changes. */
  public subscribe(listener: (state: ChoreographyState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const snapshot = { ...this.state };
    this.listeners.forEach((l) => l(snapshot));
  }

  /** Get a Mermaid diagram of the DAG. */
  public toMermaid(): string {
    const lines = ["graph TD"];
    const steps = this.options.steps;

    for (const [name, step] of Object.entries(steps)) {
      const label = name.replace(/([A-Z])/g, " $1").trim();
      lines.push(`  ${name}["${label}"]`);

      if (step.dependsOn) {
        for (const dep of step.dependsOn) {
          lines.push(`  ${dep} --> ${name}`);
        }
      }
    }

    return lines.join("\n");
  }

  /** Get the current state snapshot. */
  public getState(): ChoreographyState {
    return { ...this.state };
  }
}

/**
 * Factory function to create a choreography.
 */
export function choreograph<TSteps extends Record<string, ChoreographyStep>>(
  options: ChoreographyOptions<TSteps>,
): Choreography<TSteps> {
  return new Choreography(options);
}
