import React, { createContext, useContext, type ReactNode } from "react";
import { type FlowOptions, type FlowMiddleware } from "@asyncflowstate/core";

/**
 * Global configuration options for all flows within a FlowProvider.
 */
export interface FlowProviderConfig<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> extends FlowOptions<TData, TError, TArgs> {
  /**
   * Global interceptors or behaviors that apply to every flow.
   * Useful for auth, telemetry, or notifications.
   */
  behaviors?: FlowMiddleware<TData, TError, TArgs>[];
  /**
   * If true, local flow options will completely override global options.
   * If false (default), local options will be merged with global options,
   * with local options taking precedence.
   */
  overrideMode?: "merge" | "replace";
}

/**
 * Context for sharing global flow configuration.
 */
const FlowContext = createContext<FlowProviderConfig | null>(null);

/**
 * Props for the FlowProvider component.
 */
export interface FlowProviderProps {
  /** Global configuration to apply to all flows within this provider */
  config?: FlowProviderConfig;
  /** Child components */
  children: ReactNode;
}

/**
 * FlowProvider allows you to set global defaults for all flows within your application.
 *
 * @example
 * ```tsx
 * <FlowProvider
 *   config={{
 *     onError: (err) => toast.error(err.message),
 *     retry: { maxAttempts: 3, backoff: 'exponential' },
 *     loading: { minDuration: 300 }
 *   }}
 * >
 *   <App />
 * </FlowProvider>
 * ```
 */
export function FlowProvider({ config, children }: FlowProviderProps) {
  return (
    <FlowContext.Provider value={config || null}>
      {children}
    </FlowContext.Provider>
  );
}

/**
 * Hook to access the global flow configuration.
 * Used internally by useFlow to merge global and local options.
 *
 * @returns The global flow configuration, or null if not within a FlowProvider.
 */
export function useFlowContext() {
  return useContext(FlowContext);
}

/**
 * Merges global and local flow options.
 * Local options take precedence over global options.
 *
 * @param globalConfig Global configuration from FlowProvider
 * @param localOptions Local options passed to useFlow
 * @returns Merged options
 */
export function mergeFlowOptions<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  globalConfig: FlowProviderConfig | null,
  localOptions: FlowOptions<TData, TError, TArgs>,
): FlowOptions<TData, TError, TArgs> {
  if (!globalConfig) {
    return localOptions;
  }

  const { overrideMode = "merge", ...globalOptions } = globalConfig;

  if (overrideMode === "replace" && Object.keys(localOptions).length > 0) {
    return localOptions;
  }

  // Deep merge for nested options
  const merged: FlowOptions<TData, TError, TArgs> = {
    ...globalOptions,
  } as FlowOptions<TData, TError, TArgs>;

  // Merge retry options
  if (globalOptions.retry || localOptions.retry) {
    merged.retry = {
      ...globalOptions.retry,
      ...localOptions.retry,
    };
  }

  // Merge autoReset options
  if (globalOptions.autoReset || localOptions.autoReset) {
    merged.autoReset = {
      ...globalOptions.autoReset,
      ...localOptions.autoReset,
    };
  }

  // Merge loading options
  if (globalOptions.loading || localOptions.loading) {
    merged.loading = {
      ...globalOptions.loading,
      ...localOptions.loading,
    };
  }

  // Chain lifecycle callbacks to support Global Middleware pattern

  // onStart
  if (globalOptions.onStart && localOptions.onStart) {
    merged.onStart = (args: TArgs) => {
      globalOptions.onStart!(args);
      localOptions.onStart!(args);
    };
  } else {
    merged.onStart = localOptions.onStart || globalOptions.onStart;
  }

  // onSuccess
  if (globalOptions.onSuccess && localOptions.onSuccess) {
    merged.onSuccess = (data: TData) => {
      globalOptions.onSuccess!(data);
      localOptions.onSuccess!(data);
    };
  } else {
    merged.onSuccess = localOptions.onSuccess || globalOptions.onSuccess;
  }

  // onError
  if (globalOptions.onError && localOptions.onError) {
    merged.onError = (error: TError) => {
      globalOptions.onError!(error);
      localOptions.onError!(error);
    };
  } else {
    merged.onError = localOptions.onError || globalOptions.onError;
  }

  // onRetry
  if (globalOptions.onRetry && localOptions.onRetry) {
    merged.onRetry = (error: TError, attempt: number, maxAttempts: number) => {
      globalOptions.onRetry!(error, attempt, maxAttempts);
      localOptions.onRetry!(error, attempt, maxAttempts);
    };
  } else {
    merged.onRetry = localOptions.onRetry || globalOptions.onRetry;
  }

  // onCancel
  if (globalOptions.onCancel && localOptions.onCancel) {
    merged.onCancel = () => {
      globalOptions.onCancel!();
      localOptions.onCancel!();
    };
  } else {
    merged.onCancel = localOptions.onCancel || globalOptions.onCancel;
  }

  // onSettled
  if (globalOptions.onSettled && localOptions.onSettled) {
    merged.onSettled = (data: TData | null, error: TError | null) => {
      globalOptions.onSettled!(data, error);
      localOptions.onSettled!(data, error);
    };
  } else {
    merged.onSettled = localOptions.onSettled || globalOptions.onSettled;
  }

  // onStream
  if (globalOptions.onStream && localOptions.onStream) {
    merged.onStream = (chunk: any, accumulated: TData) => {
      globalOptions.onStream!(chunk, accumulated);
      localOptions.onStream!(chunk, accumulated);
    };
  } else {
    merged.onStream = localOptions.onStream || globalOptions.onStream;
  }

  // onBlocked
  if (globalOptions.onBlocked && localOptions.onBlocked) {
    merged.onBlocked = () => {
      globalOptions.onBlocked!();
      localOptions.onBlocked!();
    };
  } else {
    merged.onBlocked = localOptions.onBlocked || globalOptions.onBlocked;
  }

  // mapError - Merge the results of the mappings
  if (globalOptions.mapError && localOptions.mapError) {
    merged.mapError = (error: any) => ({
      ...globalOptions.mapError!(error),
      ...localOptions.mapError!(error),
    });
  } else {
    merged.mapError = localOptions.mapError || globalOptions.mapError;
  }

  // Merge meta
  if (globalOptions.meta || localOptions.meta) {
    merged.meta = {
      ...globalOptions.meta,
      ...localOptions.meta,
    };
  }

  // Merge behaviors (middleware)
  if (globalConfig.behaviors || localOptions.middleware) {
    merged.middleware = [
      ...((globalConfig.behaviors as any[]) || []),
      ...(localOptions.middleware || []),
    ];
  }

  if (localOptions.concurrency !== undefined) {
    merged.concurrency = localOptions.concurrency;
  }

  if (localOptions.optimisticResult !== undefined) {
    merged.optimisticResult = localOptions.optimisticResult;
  }

  if (localOptions.rollbackOnError !== undefined) {
    merged.rollbackOnError = localOptions.rollbackOnError;
  }

  if (localOptions.timeout !== undefined) {
    merged.timeout = localOptions.timeout;
  }

  if (localOptions.debounce !== undefined) {
    merged.debounce = localOptions.debounce;
  }

  if (localOptions.throttle !== undefined) {
    merged.throttle = localOptions.throttle;
  }

  // Pass through additional FlowOptions not explicitly deep-merged above.
  if (localOptions.autoProgress !== undefined) {
    merged.autoProgress = localOptions.autoProgress;
  }

  if (localOptions.persist !== undefined) {
    merged.persist = localOptions.persist;
  }

  if (localOptions.persistKey !== undefined) {
    merged.persistKey = localOptions.persistKey;
  }

  if (localOptions.persistStorage !== undefined) {
    merged.persistStorage = localOptions.persistStorage;
  }

  if (localOptions.circuitBreaker !== undefined) {
    merged.circuitBreaker = localOptions.circuitBreaker;
  }

  if (localOptions.triggerOn !== undefined) {
    merged.triggerOn = localOptions.triggerOn;
  }

  if (localOptions.circuitBreakerKey !== undefined) {
    merged.circuitBreakerKey = localOptions.circuitBreakerKey;
  }

  if (localOptions.polling !== undefined) {
    merged.polling = localOptions.polling;
  }

  if (localOptions.sync !== undefined) {
    merged.sync = localOptions.sync;
  }

  if (localOptions.debugName !== undefined) {
    merged.debugName = localOptions.debugName;
  }

  if (localOptions.precondition !== undefined) {
    merged.precondition = localOptions.precondition;
  }

  if (localOptions.dedupKey !== undefined) {
    merged.dedupKey = localOptions.dedupKey;
  }

  if (localOptions.staleTime !== undefined) {
    merged.staleTime = localOptions.staleTime;
  }

  // 2.0.0 Advanced Features
  if (localOptions.purgatory !== undefined) {
    merged.purgatory = localOptions.purgatory;
  }

  if (localOptions.ghost !== undefined) {
    merged.ghost = localOptions.ghost;
  }

  if (localOptions.deadLetter !== undefined) {
    merged.deadLetter = localOptions.deadLetter;
  }

  if ((localOptions as any).predictive !== undefined) {
    (merged as any).predictive = (localOptions as any).predictive;
  }

  return merged;
}
