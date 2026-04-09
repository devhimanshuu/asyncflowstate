import { ref, reactive, computed, watch, onUnmounted, type Ref } from "vue";
import {
  Flow,
  type FlowAction,
  type FlowState,
  type FlowStatus,
} from "@asyncflowstate/core";
import { useFlowConfig, mergeFlowOptions } from "../components/FlowProvider";
import { runSchemaValidation } from "../utils/schema-validation";
import type { VueFlowOptions, VueFormHelperOptions } from "../types";

/**
 * Vue 3 composable for managing async actions with full lifecycle control.
 *
 * Features:
 * - Reactive state tracking (status, data, error, progress)
 * - Button & form helpers for v-bind
 * - Field-level validation (Zod, Yup, Valibot, manual)
 * - Auto-revalidation on focus/reconnect
 * - Automatic cleanup on unmount
 * - Signal-based inter-flow communication
 * - Trigger-based auto-execution
 * - Optimistic updates with rollback
 * - Retry, timeout, debounce, throttle, circuit breaker
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFlow } from '@asyncflowstate/vue';
 *
 * const { loading, data, error, execute, button } = useFlow(
 *   async (id: string) => api.fetchUser(id),
 *   { onSuccess: (user) => console.log('Fetched:', user.name) }
 * );
 * </script>
 *
 * <template>
 *   <button v-bind="button()">
 *     {{ loading ? 'Loading...' : 'Fetch User' }}
 *   </button>
 * </template>
 * ```
 */
export function useFlow<TData = any, TError = any, TArgs extends any[] = any[]>(
  action: FlowAction<TData, TArgs>,
  options: VueFlowOptions<TData, TError, TArgs> = {},
) {
  const globalConfig = useFlowConfig();
  const mergedOptions: VueFlowOptions<TData, TError, TArgs> = mergeFlowOptions(
    globalConfig,
    options,
  );

  // Create the core Flow instance
  const flow = new Flow<TData, TError, TArgs>(action, mergedOptions);

  // ─── Reactive State ──────────────────────────────────────────────────────
  const status = ref<FlowStatus>(flow.status) as Ref<FlowStatus>;
  const data = ref<TData | null>(flow.data) as Ref<TData | null>;
  const error = ref<TError | null>(flow.error) as Ref<TError | null>;
  const progress = ref<number>(flow.progress);
  const rollbackDiff = ref<any[] | null>(flow.state.rollbackDiff ?? null);
  const fieldErrors = ref<Record<string, string>>({});

  const loading = ref(flow.isLoading);
  const isLoading = loading;
  const isSuccess = computed(() => status.value === "success");
  const isError = computed(() => status.value === "error");
  const isIdle = computed(() => status.value === "idle");
  const isStreaming = computed(() => status.value === "streaming");

  // Track last args for revalidation
  let lastArgs: TArgs | null = null;

  // ─── Core State Subscription ─────────────────────────────────────────────
  const unsubscribe = flow.subscribe((state: FlowState<TData, TError>) => {
    status.value = state.status;
    data.value = state.data;
    error.value = state.error;
    progress.value = state.progress ?? 0;
    rollbackDiff.value = state.rollbackDiff ?? null;
    loading.value = flow.isLoading;
  });

  // ─── Execute ─────────────────────────────────────────────────────────────
  function execute(...args: TArgs): Promise<TData | undefined> {
    lastArgs = args;
    return flow.execute(...args);
  }

  // ─── Button Helper ───────────────────────────────────────────────────────
  function button(props: Record<string, any> = {}) {
    const { onClick, ...rest } = props;
    return {
      disabled: flow.isLoading,
      "aria-busy": flow.isLoading,
      onClick: (e: Event) => {
        if (onClick) {
          onClick(e);
        } else {
          (flow.execute as any)();
        }
      },
      onMouseenter: (e: Event) => {
        if (mergedOptions.predictive?.prefetchOnHover) {
          (flow.execute as any)();
        }
        if (props.onMouseenter) props.onMouseenter(e);
      },
      ...rest,
    };
  }

  // ─── Form Helper ─────────────────────────────────────────────────────────
  function form(formProps: VueFormHelperOptions<TArgs> = {}) {
    const {
      extractFormData = false,
      validate,
      schema,
      resetOnSuccess = false,
      ...rest
    } = formProps;

    return {
      "aria-busy": flow.isLoading,
      onSubmit: async (e: Event) => {
        e.preventDefault();
        fieldErrors.value = {};

        let args = [] as unknown as TArgs;
        const formEl = e.target as HTMLFormElement;

        if (extractFormData) {
          const formData = new FormData(formEl);
          const formDataObj = Object.fromEntries(formData.entries());
          args = [formDataObj] as unknown as TArgs;
        }

        // Schema validation (Zod, Valibot, Yup, etc.)
        if (schema) {
          const schemaErrors = await runSchemaValidation(
            schema,
            extractFormData ? args[0] : args,
          );
          if (schemaErrors) {
            fieldErrors.value = schemaErrors;
            return;
          }
        }

        // Manual validation
        if (validate) {
          const errors = await validate(...args);
          if (errors && Object.keys(errors).length > 0) {
            fieldErrors.value = errors;
            return;
          }
        }

        const result = await execute(...args);
        if (result !== undefined && resetOnSuccess) {
          formEl.reset();
        }
      },
      ...rest,
    };
  }

  // ─── Boolean Triggers ────────────────────────────────────────────────────
  if (options.triggerOn) {
    const prevBooleans: boolean[] = [];
    watch(
      () => options.triggerOn,
      (triggers) => {
        if (!triggers) return;
        let booleanIndex = 0;
        triggers.forEach((trigger: any) => {
          if (typeof trigger === "boolean") {
            const prev = prevBooleans[booleanIndex] || false;
            prevBooleans[booleanIndex] = trigger;
            booleanIndex++;
            if (trigger && !prev) {
              flow.execute(...([] as unknown as TArgs));
            }
          }
        });
      },
      { deep: true, immediate: true },
    );
  }

  // ─── Auto-Revalidation ──────────────────────────────────────────────────
  if (typeof window !== "undefined") {
    if (options.revalidateOnFocus) {
      const handleFocus = () => {
        if (document.visibilityState === "visible" && lastArgs) {
          flow.execute(...lastArgs);
        }
      };
      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleFocus);
      onUnmounted(() => {
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleFocus);
      });
    }

    if (options.revalidateOnReconnect) {
      const handleOnline = () => {
        if (lastArgs) {
          flow.execute(...lastArgs);
        }
      };
      window.addEventListener("online", handleOnline);
      onUnmounted(() => {
        window.removeEventListener("online", handleOnline);
      });
    }
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────
  onUnmounted(() => {
    unsubscribe();
    const shouldCancel =
      options.cancelOnUnmount !== false && !options.keepAlive;
    if (shouldCancel) {
      flow.cancel();
    }
    flow.dispose();
  });

  // ─── Return ──────────────────────────────────────────────────────────────
  return reactive({
    /** Current flow status */
    status,
    /** Data from the last successful execution */
    data,
    /** Error from the last failed execution */
    error,
    /** Current progress (0-100) */
    progress,
    /** Whether the flow is currently loading */
    loading,
    /** Alias */
    isLoading,
    /** Whether the flow completed successfully */
    isSuccess,
    /** Whether the flow is in error state */
    isError,
    /** Whether the flow is idle */
    isIdle,
    /** Whether the flow is streaming */
    isStreaming,
    /** Execute the action */
    execute,
    /** Reset flow state to idle */
    reset: flow.reset.bind(flow),
    /** Cancel the currently running action */
    cancel: flow.cancel.bind(flow),
    /** Set progress manually */
    setProgress: flow.setProgress.bind(flow),
    exportState: flow.exportState.bind(flow),
    importState: flow.importState.bind(flow),
    triggerUndo: flow.triggerUndo.bind(flow),
    worker: flow.worker.bind(flow),
    rollbackDiff,
    /** Button helper — returns attributes for v-bind */
    button,
    /** Form helper — returns attributes for v-bind */
    form,
    /** Field-level validation errors */
    fieldErrors,
    /** The underlying Flow instance */
    flow,
    /** Signals for inter-flow communication */
    signals: flow.signals,
  });
}
