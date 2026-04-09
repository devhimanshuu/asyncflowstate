import { BehaviorSubject } from "rxjs";
import {
  Flow,
  type FlowAction,
  type FlowOptions,
  type FlowState,
} from "@asyncflowstate/core";

/**
 * Creates an Angular-friendly keyed flow list instance.
 */
export function createFlowList<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: FlowAction<TData, TArgs>,
  options: FlowOptions<TData, TError, TArgs> = {},
) {
  const flows: Record<string, Flow<TData, TError, TArgs>> = {};
  const unsubs: Record<string, () => void> = {};

  type ListState = {
    states: Record<string, FlowState<TData, TError>>;
    isAnyLoading: boolean;
  };

  const state$ = new BehaviorSubject<ListState>({
    states: {},
    isAnyLoading: false,
  });

  function getFlow(id: string): Flow<TData, TError, TArgs> {
    if (flows[id]) return flows[id];

    const flow = new Flow<TData, TError, TArgs>(action, options);
    flows[id] = flow;

    unsubs[id] = flow.subscribe((state) => {
      const current = state$.getValue();
      const newStates = { ...current.states, [id]: { ...state } };
      state$.next({
        states: newStates,
        isAnyLoading: (
          Object.values(newStates) as FlowState<TData, TError>[]
        ).some((s) => s.status === "loading"),
      });
    });

    const current = state$.getValue();
    state$.next({
      ...current,
      states: { ...current.states, [id]: { ...flow.state } },
    });

    return flow;
  }

  return {
    state$,
    state: state$.asObservable(),
    execute: (id: string, ...args: TArgs) => getFlow(id).execute(...args),
    reset: (id: string) => flows[id]?.reset(),
    cancel: (id: string) => flows[id]?.cancel(),
    getStatus: (id: string): FlowState<TData, TError> => {
      const current = state$.getValue();
      return (
        current.states[id] || {
          status: "idle" as const,
          data: null,
          error: null,
          progress: 0,
        }
      );
    },
    snapshot: () => state$.getValue(),
    destroy: () => {
      Object.values(unsubs).forEach((u) => u());
      Object.values(flows).forEach((f) => f.dispose());
      state$.complete();
    },
  };
}
