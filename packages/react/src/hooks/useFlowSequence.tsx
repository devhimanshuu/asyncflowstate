import { useState, useEffect, useRef, useCallback } from "react";
import {
  FlowSequence,
  type SequenceStep,
  type SequenceState,
} from "@asyncflowstate/core";

function isSameSteps(a: SequenceStep[], b: SequenceStep[]): boolean {
  if (a.length !== b.length) return false;

  return a.every((step, index) => {
    const other = b[index];
    return (
      step.name === other.name &&
      step.flow === other.flow &&
      step.mapInput === other.mapInput &&
      step.skipIf === other.skipIf &&
      step.nextStep === other.nextStep
    );
  });
}

export function useFlowSequence(steps: SequenceStep[]) {
  const [sequence, setSequence] = useState(() => new FlowSequence(steps));
  const [state, setState] = useState<SequenceState>(() => sequence.state);
  const previousStepsRef = useRef<SequenceStep[]>(steps);

  useEffect(() => {
    if (isSameSteps(previousStepsRef.current, steps)) return;
    previousStepsRef.current = steps;
    setSequence(new FlowSequence(steps));
  }, [steps]);

  useEffect(() => {
    setState(sequence.state);
    return sequence.subscribe(setState);
  }, [sequence]);

  const execute = useCallback(
    (initialInput?: any) => sequence.execute(initialInput),
    [sequence],
  );
  const reset = useCallback(() => sequence.reset(), [sequence]);
  const cancel = useCallback(() => sequence.cancel(), [sequence]);

  return {
    ...state,
    execute,
    reset,
    cancel,
    loading: state.status === "loading",
    error: state.error,
    currentStep:
      state.currentStepIndex >= 0 ? steps[state.currentStepIndex] : null,
  };
}
