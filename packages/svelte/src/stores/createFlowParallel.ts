import { writable } from "svelte/store";
import {
  FlowParallel,
  type ParallelState,
  type ParallelStrategy,
  type Flow,
} from "@asyncflowstate/core";

/**
 * Creates a Svelte store for running multiple flows in parallel.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createFlowParallel } from '@asyncflowstate/svelte';
 *   const parallel = createFlowParallel(
 *     { users: usersFlow.flow, posts: postsFlow.flow },
 *     'allSettled'
 *   );
 * </script>
 * ```
 */
export function createFlowParallel(
  input: Flow<any, any, any>[] | Record<string, Flow<any, any, any>>,
  strategy: ParallelStrategy = "all",
) {
  const parallel = new FlowParallel(input, strategy);

  const store = writable<ParallelState & { loading: boolean }>({
    ...parallel.state,
    loading: false,
  });

  const unsubscribe = parallel.subscribe((state) => {
    store.set({
      ...state,
      loading: state.status === "loading",
    });
  });

  return {
    subscribe: store.subscribe,
    execute: (...args: any[]) => parallel.execute(...args),
    reset: () => parallel.reset(),
    cancel: () => parallel.cancel(),
    destroy: () => unsubscribe(),
  };
}
