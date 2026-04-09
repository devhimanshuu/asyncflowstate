import { writable, get } from "svelte/store";
import {
  Flow,
  type FlowAction,
  type FlowOptions,
  type FlowState,
} from "@asyncflowstate/core";

/**
 * Creates a Svelte store for managing multiple keyed flow instances.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createFlowList } from '@asyncflowstate/svelte';
 *   const list = createFlowList(async (id) => api.deleteItem(id));
 * </script>
 *
 * {#each items as item}
 *   <button on:click={() => list.execute(item.id, item.id)}
 *           disabled={$list.states[item.id]?.status === 'loading'}>
 *     Delete
 *   </button>
 * {/each}
 * ```
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

  const store = writable<{
    states: Record<string, FlowState<TData, TError>>;
    isAnyLoading: boolean;
  }>({
    states: {},
    isAnyLoading: false,
  });

  function getFlow(id: string): Flow<TData, TError, TArgs> {
    if (flows[id]) return flows[id];

    const flow = new Flow<TData, TError, TArgs>(action, options);
    flows[id] = flow;

    unsubs[id] = flow.subscribe((state) => {
      store.update((current) => {
        const newStates = { ...current.states, [id]: { ...state } };
        return {
          states: newStates,
          isAnyLoading: Object.values(newStates).some(
            (s) => s.status === "loading",
          ),
        };
      });
    });

    store.update((current) => ({
      ...current,
      states: { ...current.states, [id]: { ...flow.state } },
    }));

    return flow;
  }

  function destroy() {
    Object.values(unsubs).forEach((u) => u());
    Object.values(flows).forEach((f) => f.dispose());
  }

  return {
    subscribe: store.subscribe,
    execute: (id: string, ...args: TArgs) => getFlow(id).execute(...args),
    reset: (id: string) => flows[id]?.reset(),
    cancel: (id: string) => flows[id]?.cancel(),
    getStatus: (id: string): FlowState<TData, TError> => {
      const currentState = get(store);
      return (
        currentState.states[id] || {
          status: "idle" as const,
          data: null,
          error: null,
          progress: 0,
        }
      );
    },
    destroy,
  };
}
