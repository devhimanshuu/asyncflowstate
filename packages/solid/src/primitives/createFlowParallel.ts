import { createSignal, createMemo, onCleanup } from "solid-js";
import {
  FlowParallel,
  type ParallelState,
  type ParallelStrategy,
  type Flow,
} from "@asyncflowstate/core";

export function createFlowParallel(
  input: Flow<any, any, any>[] | Record<string, Flow<any, any, any>>,
  strategy: ParallelStrategy = "all",
) {
  const parallel = new FlowParallel(input, strategy);
  const [state, setState] = createSignal<ParallelState>({ ...parallel.state });

  const loading = createMemo(() => state().status === "loading");

  const unsubscribe = parallel.subscribe((newState) =>
    setState({ ...newState }),
  );
  onCleanup(() => unsubscribe());

  return {
    state,
    status: createMemo(() => state().status),
    progress: createMemo(() => state().progress),
    results: createMemo(() => state().results),
    errors: createMemo(() => state().errors),
    loading,
    execute: (...args: any[]) => parallel.execute(...args),
    reset: () => parallel.reset(),
    cancel: () => parallel.cancel(),
  };
}
