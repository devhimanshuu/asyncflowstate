import { useState, useEffect, useRef, useCallback } from "react";
import { FlowSequence, SequenceStep, SequenceState } from "@asyncflowstate/core";

export function useFlowSequence(steps: SequenceStep[]) {
    const stepsRef = useRef(steps);

    useEffect(() => {
        stepsRef.current = steps;
    }, [steps]);

    const [sequence] = useState(() => new FlowSequence(stepsRef.current));
    const [state, setState] = useState<SequenceState>(() => sequence.state);

    useEffect(() => {
        return sequence.subscribe(setState);
    }, [sequence]);

    const execute = useCallback((initialInput?: any) => {
        return sequence.execute(initialInput);
    }, [sequence]);

    const reset = useCallback(() => {
        sequence.reset();
    }, [sequence]);

    const cancel = useCallback(() => {
        sequence.cancel();
    }, [sequence]);

    return {
        ...state,
        execute,
        reset,
        cancel,
        loading: state.status === "loading",
        error: state.error,
        currentStep: state.currentStepIndex >= 0 ? steps[state.currentStepIndex] : null,
    };
}
