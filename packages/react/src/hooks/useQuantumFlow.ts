import { useState, useEffect, useCallback } from "react";
import {
  FlowParallel,
  type ParallelState,
  type Flow,
} from "@asyncflowstate/core";

type QuantumInput = Flow<any, any, any>[] | Record<string, Flow<any, any, any>>;

/**
 * useQuantumFlow is a React hook for racing multiple backends/actions.
 * The first one to resolve successfully wins, and all others are automatically cancelled.
 * 
 * @param input Array or Record of Flow instances to race.
 * @returns State and helper methods for the quantum race.
 */
export function useQuantumFlow(input: QuantumInput) {
  const [parallel] = useState(() => new FlowParallel(input, "quantum"));
  const [state, setState] = useState<ParallelState>(() => parallel.state);

  useEffect(() => {
    return parallel.subscribe(setState);
  }, [parallel]);

  const execute = useCallback(
    (...args: any[]) => parallel.execute(...args),
    [parallel],
  );
  const reset = useCallback(() => parallel.reset(), [parallel]);
  const cancel = useCallback(() => parallel.cancel(), [parallel]);

  return {
    ...state,
    loading: state.status === "loading",
    execute,
    reset,
    cancel,
  };
}
