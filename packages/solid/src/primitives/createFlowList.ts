import { createSignal, createMemo, onCleanup } from "solid-js";
import {
  Flow,
  type FlowAction,
  type FlowOptions,
  type FlowState,
} from "@asyncflowstate/core";

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
  const [states, setStates] = createSignal<
    Record<string, FlowState<TData, TError>>
  >({});

  const isAnyLoading = createMemo(() =>
    (Object.values(states()) as FlowState<TData, TError>[]).some(
      (s) => s.status === "loading",
    ),
  );

  function getFlow(id: string): Flow<TData, TError, TArgs> {
    if (flows[id]) return flows[id];

    const flow = new Flow<TData, TError, TArgs>(action, options);
    flows[id] = flow;

    unsubs[id] = flow.subscribe((state) => {
      setStates((prev: Record<string, FlowState<TData, TError>>) => ({
        ...prev,
        [id]: { ...state },
      }));
    });

    setStates((prev: Record<string, FlowState<TData, TError>>) => ({
      ...prev,
      [id]: { ...flow.state },
    }));
    return flow;
  }

  onCleanup(() => {
    Object.values(unsubs).forEach((u) => u());
    Object.values(flows).forEach((f) => f.dispose());
  });

  return {
    states,
    isAnyLoading,
    execute: (id: string, ...args: TArgs) => getFlow(id).execute(...args),
    reset: (id: string) => flows[id]?.reset(),
    cancel: (id: string) => flows[id]?.cancel(),
    getStatus: (id: string): FlowState<TData, TError> =>
      states()[id] || {
        status: "idle" as const,
        data: null,
        error: null,
        progress: 0,
      },
  };
}
