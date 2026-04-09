import { BehaviorSubject } from "rxjs";
import {
  FlowParallel,
  type ParallelState,
  type ParallelStrategy,
  type Flow,
} from "@asyncflowstate/core";

/**
 * Creates an Angular-friendly parallel flow instance.
 */
export function createFlowParallel(
  input: Flow<any, any, any>[] | Record<string, Flow<any, any, any>>,
  strategy: ParallelStrategy = "all",
) {
  const parallel = new FlowParallel(input, strategy);

  const state$ = new BehaviorSubject<ParallelState & { loading: boolean }>({
    ...parallel.state,
    loading: false,
  });

  const unsubscribe = parallel.subscribe((state) => {
    state$.next({
      ...state,
      loading: state.status === "loading",
    });
  });

  return {
    state$,
    state: state$.asObservable(),
    execute: (...args: any[]) => parallel.execute(...args),
    reset: () => parallel.reset(),
    cancel: () => parallel.cancel(),
    snapshot: () => state$.getValue(),
    destroy: () => {
      unsubscribe();
      state$.complete();
    },
  };
}
