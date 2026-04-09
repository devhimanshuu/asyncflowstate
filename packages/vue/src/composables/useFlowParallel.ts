import { ref, reactive, computed, onUnmounted } from "vue";
import {
  FlowParallel,
  type ParallelState,
  type ParallelStrategy,
  type Flow,
} from "@asyncflowstate/core";

type ParallelInput =
  | Flow<any, any, any>[]
  | Record<string, Flow<any, any, any>>;

/**
 * Vue 3 composable for running multiple flows in parallel.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFlowParallel } from '@asyncflowstate/vue';
 *
 * const parallel = useFlowParallel(
 *   { users: usersFlow, posts: postsFlow },
 *   'allSettled'
 * );
 * </script>
 *
 * <template>
 *   <button @click="parallel.execute()" :disabled="parallel.loading">
 *     Load All Data ({{ parallel.progress }}%)
 *   </button>
 * </template>
 * ```
 */
export function useFlowParallel(
  input: ParallelInput,
  strategy: ParallelStrategy = "all",
) {
  const parallel = new FlowParallel(input, strategy);

  const status = ref(parallel.state.status);
  const progress = ref(parallel.state.progress);
  const results = ref(parallel.state.results);
  const errors = ref(parallel.state.errors);

  const loading = computed(() => status.value === "loading");

  const unsubscribe = parallel.subscribe((state: ParallelState) => {
    status.value = state.status;
    progress.value = state.progress;
    results.value = state.results;
    errors.value = state.errors;
  });

  onUnmounted(() => {
    unsubscribe();
  });

  return reactive({
    status,
    progress,
    results,
    errors,
    loading,
    execute: (...args: any[]) => parallel.execute(...args),
    reset: () => parallel.reset(),
    cancel: () => parallel.cancel(),
  });
}
