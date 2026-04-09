import { useState, useEffect, useRef, useCallback } from "react";
import {
  FlowParallel,
  type ParallelState,
  type ParallelStrategy,
  type Flow,
} from "@asyncflowstate/core";

type ParallelInput =
  | Flow<any, any, any>[]
  | Record<string, Flow<any, any, any>>;

function isSameParallelInput(a: ParallelInput, b: ParallelInput): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((flow, index) => flow === b[index]);
  }

  if (!Array.isArray(a) && !Array.isArray(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => b[key] === a[key]);
  }

  return false;
}

export function useFlowParallel(
  input: ParallelInput,
  strategy: ParallelStrategy = "all",
) {
  const [parallel, setParallel] = useState(
    () => new FlowParallel(input, strategy),
  );
  const [state, setState] = useState<ParallelState>(() => parallel.state);
  const previousInputRef = useRef<ParallelInput>(input);
  const previousStrategyRef = useRef<ParallelStrategy>(strategy);

  useEffect(() => {
    const sameInput = isSameParallelInput(previousInputRef.current, input);
    const sameStrategy = previousStrategyRef.current === strategy;
    if (sameInput && sameStrategy) return;

    previousInputRef.current = input;
    previousStrategyRef.current = strategy;
    setParallel(new FlowParallel(input, strategy));
  }, [input, strategy]);

  useEffect(() => {
    setState(parallel.state);
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
