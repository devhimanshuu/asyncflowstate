import { Flow, FlowState, FlowStatus } from "./flow";
import { PROGRESS } from "./constants";

export interface SequenceStep<TInput = any, TOutput = any> {
  name: string;
  flow: Flow<TOutput, any, any>;
  /**
   * Optional function to transform the result of the previous step
   * into the input for this step.
   */
  mapInput?: (prevResult: any) => TInput;
  /**
   * Optional function to skip this step based on previous result.
   */
  skipIf?: (prevResult: any) => boolean;
  /**
   * Optional function to determine the next step by name.
   */
  nextStep?: (result: any) => string | null | undefined;
}

export interface SequenceState {
  status: FlowStatus;
  currentStepIndex: number;
  results: any[];
  error: any | null;
  progress: number;
}

export class FlowSequence {
  private _state: SequenceState = {
    status: "idle",
    currentStepIndex: -1,
    results: [],
    error: null,
    progress: 0,
  };

  private listeners = new Set<(state: SequenceState) => void>();

  constructor(private steps: SequenceStep[]) {}

  public get state(): SequenceState {
    return { ...this._state };
  }

  public subscribe(listener: (state: SequenceState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(updates: Partial<SequenceState>): void {
    this._state = { ...this._state, ...updates };
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((l) => l({ ...this._state }));
  }

  public async execute(initialInput?: any): Promise<any[] | undefined> {
    if (this._state.status === "loading") return;

    this.setState({
      status: "loading",
      currentStepIndex: 0,
      results: [],
      error: null,
      progress: 0,
    });

    let lastResult = initialInput;
    const allResults: any[] = [];

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];

      // Check skip condition
      if (step.skipIf && step.skipIf(lastResult)) {
        allResults.push(null); // Placeholder for skipped step
        continue;
      }

      this.setState({ currentStepIndex: i });

      try {
        const input = step.mapInput ? step.mapInput(lastResult) : lastResult;
        const result = await step.flow.execute(input);

        if (step.flow.status === "error") {
          throw step.flow.error;
        }

        lastResult = result;
        allResults.push(result);

        const progress = ((i + 1) / this.steps.length) * 100;
        this.setState({ progress, results: [...allResults] });

        // Handle branching
        if (step.nextStep) {
          const nextStepName = step.nextStep(result);
          if (nextStepName) {
            const nextIndex = this.steps.findIndex(
              (s) => s.name === nextStepName,
            );
            if (nextIndex !== -1 && nextIndex > i) {
              // Fill skipped steps with null
              for (let k = i + 1; k < nextIndex; k++) {
                allResults.push(null);
              }
              i = nextIndex - 1; // Loop increment will make it nextIndex
            }
          }
        }
      } catch (error) {
        this.setState({ status: "error", error });
        return undefined;
      }
    }

    this.setState({ status: "success", progress: 100 });
    return allResults;
  }

  public reset(): void {
    this.steps.forEach((s) => s.flow.reset());
    this.setState({
      status: "idle",
      currentStepIndex: -1,
      results: [],
      error: null,
      progress: 0,
    });
  }

  public cancel(): void {
    this.steps.forEach((s) => s.flow.cancel());
    this.setState({ status: "idle" });
  }
}
