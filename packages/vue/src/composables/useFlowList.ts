import { reactive, computed, onUnmounted } from "vue";
import {
  Flow,
  type FlowAction,
  type FlowOptions,
  type FlowState,
} from "@asyncflowstate/core";
import { useFlowConfig, mergeFlowOptions } from "../components/FlowProvider";

/**
 * Vue 3 composable for managing multiple keyed flow instances.
 * Ideal for lists where each item has its own async action (e.g., delete buttons).
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFlowList } from '@asyncflowstate/vue';
 *
 * const { execute, getStatus, isAnyLoading } = useFlowList(
 *   async (id: string) => api.deleteItem(id)
 * );
 * </script>
 *
 * <template>
 *   <div v-for="item in items" :key="item.id">
 *     <button
 *       @click="execute(item.id, item.id)"
 *       :disabled="getStatus(item.id).status === 'loading'"
 *     >
 *       {{ getStatus(item.id).status === 'loading' ? 'Deleting...' : 'Delete' }}
 *     </button>
 *   </div>
 * </template>
 * ```
 */
export function useFlowList<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: FlowAction<TData, TArgs>,
  options: FlowOptions<TData, TError, TArgs> = {},
) {
  const globalConfig = useFlowConfig();
  const flows: Record<string, Flow<TData, TError, TArgs>> = {};
  const unsubs: Record<string, () => void> = {};
  const states = reactive<Record<string, FlowState<TData, TError>>>({});

  const isAnyLoading = computed(() =>
    Object.values(states).some(
      (s: any) => s.status === "loading",
    ),
  );

  function getMergedOptions() {
    return mergeFlowOptions(globalConfig, options);
  }

  function getFlow(id: string): Flow<TData, TError, TArgs> {
    if (flows[id]) return flows[id];

    const flow = new Flow<TData, TError, TArgs>(action, getMergedOptions());
    flows[id] = flow;
    states[id] = { ...flow.state };

    unsubs[id] = flow.subscribe((state) => {
      states[id] = { ...state };
    });

    return flow;
  }

  onUnmounted(() => {
    Object.values(unsubs).forEach((u) => u());
    Object.values(flows).forEach((f) => f.dispose());
  });

  return reactive({
    states,
    execute: (id: string, ...args: TArgs) => getFlow(id).execute(...args),
    reset: (id: string) => flows[id]?.reset(),
    cancel: (id: string) => flows[id]?.cancel(),
    getStatus: (id: string): FlowState<TData, TError> =>
      states[id] || {
        status: "idle" as const,
        data: null,
        error: null,
        progress: 0,
      },
    isAnyLoading,
  });
}
