import { createContext, useContext } from "solid-js";
import type { FlowOptions, FlowMiddleware } from "@asyncflowstate/core";
import type { SolidFlowProviderConfig } from "../types";

const FlowConfigContext = createContext<SolidFlowProviderConfig | undefined>();

/**
 * Provides global flow configuration to all child components.
 */
export function FlowProvider(props: {
  config: SolidFlowProviderConfig;
  children: any;
}) {
  return FlowConfigContext.Provider({
    value: props.config,
    children: props.children,
  });
}

export function getFlowConfig() {
  return useContext(FlowConfigContext);
}

export function mergeFlowOptions<TData, TError, TArgs extends any[]>(
  global: SolidFlowProviderConfig | undefined,
  local: FlowOptions<TData, TError, TArgs>,
): FlowOptions<TData, TError, TArgs> {
  if (!global) return local;

  const { overrideMode = "merge", behaviors, ...globalOptions } = global;
  if (overrideMode === "replace" && Object.keys(local).length > 0) return local;

  const merged: FlowOptions<TData, TError, TArgs> = {
    ...globalOptions,
  } as FlowOptions<TData, TError, TArgs>;

  if (globalOptions.retry || local.retry) {
    merged.retry = { ...globalOptions.retry, ...local.retry };
  }
  if (globalOptions.autoReset || local.autoReset) {
    merged.autoReset = { ...globalOptions.autoReset, ...local.autoReset };
  }
  if (globalOptions.loading || local.loading) {
    merged.loading = { ...globalOptions.loading, ...local.loading };
  }

  const callbacks: (keyof FlowOptions)[] = [
    "onStart", "onSuccess", "onError", "onRetry",
    "onCancel", "onSettled", "onStream", "onBlocked",
  ];

  for (const key of callbacks) {
    const globalCb = globalOptions[key] as ((...args: any[]) => void) | undefined;
    const localCb = local[key] as ((...args: any[]) => void) | undefined;
    if (globalCb && localCb) {
      (merged as any)[key] = (...args: any[]) => { globalCb(...args); localCb(...args); };
    } else {
      (merged as any)[key] = localCb || globalCb;
    }
  }

  if (globalOptions.meta || local.meta) {
    merged.meta = { ...globalOptions.meta, ...local.meta };
  }

  if (behaviors || (local as any).middleware) {
    const globalMiddleware = behaviors || [];
    const localMiddleware = ((local as any).middleware as FlowMiddleware[]) || [];
    (merged as any).middleware = [...globalMiddleware, ...localMiddleware];
  }

  const passthrough: (keyof FlowOptions)[] = [
    "concurrency", "optimisticResult", "rollbackOnError", "timeout",
    "debounce", "throttle", "autoProgress", "persist", "circuitBreaker",
    "triggerOn", "circuitBreakerKey", "polling", "sync", "debugName",
    "precondition", "dedupKey", "staleTime", "mapError", "middleware",
    "purgatory", "ghost", "deadLetter"
  ];
  for (const key of passthrough) {
    if ((local as any)[key] !== undefined) (merged as any)[key] = (local as any)[key];
  }

  return merged;
}
