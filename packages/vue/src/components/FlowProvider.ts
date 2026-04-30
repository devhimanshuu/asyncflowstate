import { provide, inject, type InjectionKey } from "vue";
import type { FlowOptions, FlowMiddleware } from "@asyncflowstate/core";
import type { VueFlowProviderConfig } from "../types";

const FLOW_CONFIG_KEY: InjectionKey<VueFlowProviderConfig> = Symbol(
  "asyncflowstate-config",
);

/**
 * Provides global flow configuration to all child components.
 *
 * @example
 * ```ts
 * // In a parent component's setup()
 * provideFlowConfig({
 *   onError: (err) => toast.error(err.message),
 *   retry: { maxAttempts: 3, backoff: 'exponential' },
 *   loading: { minDuration: 300 },
 * });
 * ```
 */
export function provideFlowConfig(config: VueFlowProviderConfig): void {
  provide(FLOW_CONFIG_KEY, config);
}

/**
 * Injects the global flow configuration (internal).
 */
export function useFlowConfig(): VueFlowProviderConfig | undefined {
  return inject(FLOW_CONFIG_KEY, undefined);
}

/**
 * Merges global and local flow options with proper precedence.
 * - Shallow copies simple options
 * - Deep-merges nested config (retry, autoReset, loading)
 * - Chains lifecycle callbacks (global fires before local)
 * - Merges meta objects
 */
export function mergeFlowOptions<TData, TError, TArgs extends any[]>(
  global: VueFlowProviderConfig | undefined,
  local: FlowOptions<TData, TError, TArgs>,
): FlowOptions<TData, TError, TArgs> {
  if (!global) return local;

  const { overrideMode = "merge", behaviors, ...globalOptions } = global;

  if (overrideMode === "replace" && Object.keys(local).length > 0) {
    return local;
  }

  const merged: FlowOptions<TData, TError, TArgs> = {
    ...globalOptions,
  } as FlowOptions<TData, TError, TArgs>;

  // Deep merge nested options
  if (globalOptions.retry || local.retry) {
    merged.retry = { ...globalOptions.retry, ...local.retry };
  }
  if (globalOptions.autoReset || local.autoReset) {
    merged.autoReset = { ...globalOptions.autoReset, ...local.autoReset };
  }
  if (globalOptions.loading || local.loading) {
    merged.loading = { ...globalOptions.loading, ...local.loading };
  }

  // Chain lifecycle callbacks (global fires first, then local)
  const callbacks: (keyof FlowOptions)[] = [
    "onStart",
    "onSuccess",
    "onError",
    "onRetry",
    "onCancel",
    "onSettled",
    "onStream",
    "onBlocked",
  ];

  for (const key of callbacks) {
    const globalCb = globalOptions[key] as
      | ((...args: any[]) => void)
      | undefined;
    const localCb = local[key] as ((...args: any[]) => void) | undefined;

    if (globalCb && localCb) {
      (merged as any)[key] = (...args: any[]) => {
        globalCb(...args);
        localCb(...args);
      };
    } else {
      (merged as any)[key] = localCb || globalCb;
    }
  }

  // Merge meta objects
  if (globalOptions.meta || local.meta) {
    merged.meta = { ...globalOptions.meta, ...local.meta };
  }

  // Merge middleware arrays
  if (behaviors || (local as any).middleware) {
    const globalMiddleware = behaviors || [];
    const localMiddleware =
      ((local as any).middleware as FlowMiddleware[]) || [];
    (merged as any).middleware = [...globalMiddleware, ...localMiddleware];
  }

  // Pass through remaining local overrides
  const passthrough: (keyof FlowOptions)[] = [
    "concurrency",
    "optimisticResult",
    "rollbackOnError",
    "timeout",
    "debounce",
    "throttle",
    "autoProgress",
    "persist",
    "circuitBreaker",
    "triggerOn",
    "circuitBreakerKey",
    "polling",
    "sync",
    "debugName",
    "precondition",
    "dedupKey",
    "staleTime",
    "mapError",
    "middleware",
    "purgatory",
    "ghost",
    "deadLetter",
    "predictive",
    "probabilityModel",
    "streamingPolicy",
    "autoThrottle",
  ];

  for (const key of passthrough) {
    if ((local as any)[key] !== undefined) {
      (merged as any)[key] = (local as any)[key];
    }
  }

  return merged;
}
