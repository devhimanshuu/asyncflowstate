import React, { createContext, useContext, ReactNode } from "react";
import { FlowOptions } from "@asyncflowstate/core";

/**
 * Global configuration options for all flows within a FlowProvider.
 */
export interface FlowProviderConfig<
  TData = any,
  TError = any,
> extends FlowOptions<TData, TError> {
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
export function mergeFlowOptions<TData = any, TError = any>(
  globalConfig: FlowProviderConfig | null,
  localOptions: FlowOptions<TData, TError>,
): FlowOptions<TData, TError> {
  if (!globalConfig) {
    return localOptions;
  }

  const { overrideMode = "merge", ...globalOptions } = globalConfig;

  if (overrideMode === "replace" && Object.keys(localOptions).length > 0) {
    return localOptions;
  }

  // Deep merge for nested options
  const merged: FlowOptions<TData, TError> = { ...globalOptions };

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

  // Override simple properties with local values if provided
  if (localOptions.onSuccess !== undefined) {
    merged.onSuccess = localOptions.onSuccess;
  }

  if (localOptions.onError !== undefined) {
    merged.onError = localOptions.onError;
  } else if (globalOptions.onError) {
    // If no local onError, use global onError
    merged.onError = globalOptions.onError;
  }

  if (localOptions.concurrency !== undefined) {
    merged.concurrency = localOptions.concurrency;
  }

  if (localOptions.optimisticResult !== undefined) {
    merged.optimisticResult = localOptions.optimisticResult;
  }

  return merged;
}
