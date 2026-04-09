import { writable, type Writable } from "svelte/store";
import {
  Flow,
  type FlowAction,
  type FlowState,
  type FlowStatus,
} from "@asyncflowstate/core";
import type { SvelteFlowOptions } from "../types";

/**
 * Creates a Svelte store that manages an async action with full lifecycle control.
 * Implements the Svelte store contract — use `$store` for auto-subscription.
 *
 * Features:
 * - Reactive state via Svelte's `$` auto-subscription
 * - Auto-revalidation on focus/reconnect
 * - Full access to core Flow (retry, timeout, debounce, circuit breaker, etc.)
 * - destroy() for manual cleanup
 *
 * @example
 * ```svelte
 * <script>
 *   import { createFlow } from '@asyncflowstate/svelte';
 *
 *   const flow = createFlow(async (id) => {
 *     const res = await fetch(`/api/users/${id}`);
 *     return res.json();
 *   }, { retry: { maxAttempts: 3 } });
 * </script>
 *
 * <button on:click={() => flow.execute('user-123')} disabled={$flow.loading}>
 *   {$flow.loading ? 'Loading...' : 'Fetch User'}
 * </button>
 *
 * {#if $flow.data}
 *   <p>{$flow.data.name}</p>
 * {/if}
 * ```
 */
export function createFlow<TData = any, TError = any, TArgs extends any[] = any[]>(
  action: FlowAction<TData, TArgs>,
  options: SvelteFlowOptions<TData, TError, TArgs> = {},
) {
  const flow = new Flow<TData, TError, TArgs>(action, options);

  const store: Writable<{
    status: FlowStatus;
    data: TData | null;
    error: TError | null;
    progress: number;
    loading: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    isIdle: boolean;
    isStreaming: boolean;
    rollbackDiff: any[] | null;
  }> = writable({
    status: flow.status,
    data: flow.data,
    error: flow.error,
    progress: flow.progress,
    loading: flow.isLoading,
    isLoading: flow.isLoading,
    isSuccess: flow.isSuccess,
    isError: flow.isError,
    isIdle: flow.status === "idle",
    isStreaming: flow.status === "streaming",
    rollbackDiff: flow.state.rollbackDiff ?? null,
  });

  let lastArgs: TArgs | null = null;
  const cleanupFns: (() => void)[] = [];

  const unsubscribeFlow = flow.subscribe((state: FlowState<TData, TError>) => {
    store.set({
      status: state.status,
      data: state.data,
      error: state.error,
      progress: state.progress ?? 0,
      loading: flow.isLoading,
      isLoading: flow.isLoading,
      isSuccess: state.status === "success",
      isError: state.status === "error",
      isIdle: state.status === "idle",
      isStreaming: state.status === "streaming",
      rollbackDiff: state.rollbackDiff ?? null,
    });
  });
  cleanupFns.push(unsubscribeFlow);

  // Auto-revalidation
  if (typeof window !== "undefined") {
    if (options.revalidateOnFocus) {
      const handleFocus = () => {
        if (document.visibilityState === "visible" && lastArgs) {
          flow.execute(...lastArgs);
        }
      };
      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleFocus);
      cleanupFns.push(() => {
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleFocus);
      });
    }

    if (options.revalidateOnReconnect) {
      const handleOnline = () => {
        if (lastArgs) flow.execute(...lastArgs);
      };
      window.addEventListener("online", handleOnline);
      cleanupFns.push(() => window.removeEventListener("online", handleOnline));
    }
  }

  function execute(...args: TArgs): Promise<TData | undefined> {
    lastArgs = args;
    return flow.execute(...args);
  }

  function destroy() {
    cleanupFns.forEach((fn) => fn());
    flow.dispose();
  }

  return {
    subscribe: store.subscribe,
    execute,
    reset: flow.reset.bind(flow),
    cancel: flow.cancel.bind(flow),
    setProgress: flow.setProgress.bind(flow),
    exportState: flow.exportState.bind(flow),
    importState: flow.importState.bind(flow),
    triggerUndo: flow.triggerUndo.bind(flow),
    worker: flow.worker.bind(flow),
    flow,
    signals: flow.signals,
    destroy,
  };
}
