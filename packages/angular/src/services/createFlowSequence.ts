import { BehaviorSubject } from "rxjs";
import {
  FlowSequence,
  type SequenceStep,
  type SequenceState,
} from "@asyncflowstate/core";

/**
 * Creates an Angular-friendly sequential flow instance.
 */
export function createFlowSequence(steps: SequenceStep[]) {
  const sequence = new FlowSequence(steps);

  type ExtendedState = SequenceState & {
    loading: boolean;
    currentStep: SequenceStep | null;
  };

  const state$ = new BehaviorSubject<ExtendedState>({
    ...sequence.state,
    loading: false,
    currentStep: null,
  });

  const unsubscribe = sequence.subscribe((state) => {
    state$.next({
      ...state,
      loading: state.status === "loading",
      currentStep:
        state.currentStepIndex >= 0 ? steps[state.currentStepIndex] : null,
    });
  });

  return {
    state$,
    state: state$.asObservable(),
    execute: (initialInput?: any) => sequence.execute(initialInput),
    reset: () => sequence.reset(),
    cancel: () => sequence.cancel(),
    snapshot: () => state$.getValue(),
    destroy: () => {
      unsubscribe();
      state$.complete();
    },
  };
}
