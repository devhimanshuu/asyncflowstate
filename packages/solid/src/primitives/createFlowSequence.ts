import { createSignal, createMemo, onCleanup } from "solid-js";
import {
  FlowSequence,
  type SequenceStep,
  type SequenceState,
} from "@asyncflowstate/core";

export function createFlowSequence(steps: SequenceStep[]) {
  const sequence = new FlowSequence(steps);
  const [state, setState] = createSignal<SequenceState>({ ...sequence.state });

  const currentStep = createMemo(() => {
    const s = state();
    return s.currentStepIndex >= 0 ? steps[s.currentStepIndex] : null;
  });

  const unsubscribe = sequence.subscribe((newState) =>
    setState({ ...newState }),
  );
  onCleanup(() => unsubscribe());

  return {
    state,
    status: () => state().status,
    progress: () => state().progress,
    results: () => state().results,
    error: () => state().error,
    currentStepIndex: () => state().currentStepIndex,
    loading: () => state().status === "loading",
    currentStep,
    execute: (initialInput?: any) => sequence.execute(initialInput),
    reset: () => sequence.reset(),
    cancel: () => sequence.cancel(),
  };
}
