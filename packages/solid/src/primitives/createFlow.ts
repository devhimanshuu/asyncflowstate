import { createSignal, createMemo, onCleanup } from "solid-js";
import {
  Flow,
  type FlowAction,
  type FlowState,
  type FlowStatus,
} from "@asyncflowstate/core";
import { useFlowConfig, mergeFlowOptions } from "../components/FlowProvider";
import { runSchemaValidation } from "../utils/schema-validation";
import type { SolidFlowOptions } from "../types";

/**
 * SolidJS primitive for managing async actions with fine-grained reactivity.
 *
 * @example
 * ```tsx
 * function UserCard() {
 *   const flow = createFlow(async (id: string) => api.fetchUser(id));
 *   return (
 *     <button onClick={() => flow.execute('user-123')} disabled={flow.loading()}>
 *       {flow.loading() ? 'Loading...' : 'Fetch User'}
 *     </button>
 *   );
 * }
 * ```
 */
export function createFlow<TData = any, TError = any, TArgs extends any[] = any[]>(
  action: FlowAction<TData, TArgs>,
  options: SolidFlowOptions<TData, TError, TArgs> = {},
) {
  const globalConfig = useFlowConfig();
  const mergedOptions = mergeFlowOptions(globalConfig, options);

  const flow = new Flow<TData, TError, TArgs>(action, mergedOptions);

  const [status, setStatus] = createSignal<FlowStatus>(flow.status);
  const [data, setData] = createSignal<TData | null>(flow.data);
  const [error, setError] = createSignal<TError | null>(flow.error);
  const [progress, setProgressSignal] = createSignal<number>(flow.progress);
  const [rollbackDiff, setRollbackDiff] = createSignal<any[] | null>(null);
  const [isLoadingSignal, setIsLoading] = createSignal<boolean>(flow.isLoading);
  const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});

  const loading = isLoadingSignal;
  const isLoading = isLoadingSignal;
  const isSuccess = createMemo(() => status() === "success");
  const isError = createMemo(() => status() === "error");
  const isIdle = createMemo(() => status() === "idle");
  const isStreaming = createMemo(() => status() === "streaming");

  let lastArgs: TArgs | null = null;

  const unsubscribe = flow.subscribe((state: FlowState<TData, TError>) => {
    setStatus(state.status);
    setData(() => state.data);
    setError(() => state.error);
    setProgressSignal(state.progress ?? 0);
    setRollbackDiff((state as any).rollbackDiff ?? null);
    setIsLoading(flow.isLoading);
  });

  function execute(...args: TArgs): Promise<TData | undefined> {
    lastArgs = args;
    return flow.execute(...args);
  }

  function button(props: Record<string, any> = {}) {
    const { onClick, ...rest } = props;
    return {
      disabled: loading(),
      "aria-busy": loading(),
      onClick: (e: Event) => {
        if (onClick) { onClick(e); }
        else { (flow.execute as any)(); }
      },
      ...rest,
    };
  }

  function form(formProps: {
    extractFormData?: boolean;
    validate?: (...args: TArgs) => Record<string, string> | null | Promise<Record<string, string> | null>;
    schema?: any;
    resetOnSuccess?: boolean;
    [key: string]: any;
  } = {}) {
    const { extractFormData = false, validate, schema, resetOnSuccess = false, ...rest } = formProps;

    return {
      "aria-busy": loading(),
      onSubmit: async (e: Event) => {
        e.preventDefault();
        setFieldErrors({});

        let args = [] as unknown as TArgs;
        const formEl = e.target as HTMLFormElement;

        if (extractFormData) {
          const formData = new FormData(formEl);
          args = [Object.fromEntries(formData.entries())] as unknown as TArgs;
        }

        if (schema) {
          const schemaErrors = await runSchemaValidation(schema, extractFormData ? args[0] : args);
          if (schemaErrors) { setFieldErrors(schemaErrors); return; }
        }

        if (validate) {
          const errors = await validate(...args);
          if (errors && Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
        }

        const result = await execute(...args);
        if (result !== undefined && resetOnSuccess) formEl.reset();
      },
      ...rest,
    };
  }

  // Auto-revalidation
  if (typeof window !== "undefined") {
    if (options.revalidateOnFocus) {
      const handleFocus = () => {
        if (document.visibilityState === "visible" && lastArgs) flow.execute(...lastArgs);
      };
      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleFocus);
      onCleanup(() => {
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleFocus);
      });
    }
    if (options.revalidateOnReconnect) {
      const handleOnline = () => { if (lastArgs) flow.execute(...lastArgs); };
      window.addEventListener("online", handleOnline);
      onCleanup(() => window.removeEventListener("online", handleOnline));
    }
  }

  onCleanup(() => {
    unsubscribe();
    flow.cancel();
    flow.dispose();
  });

  return {
    status, data, error, progress, rollbackDiff,
    loading, isLoading, isSuccess, isError, isIdle, isStreaming,
    execute,
    reset: flow.reset.bind(flow),
    cancel: flow.cancel.bind(flow),
    setProgress: flow.setProgress.bind(flow),
    exportState: flow.exportState.bind(flow),
    importState: flow.importState.bind(flow),
    triggerUndo: flow.triggerUndo.bind(flow),
    worker: flow.worker.bind(flow),
    button, form, fieldErrors,
    flow,
    signals: flow.signals,
  };
}
