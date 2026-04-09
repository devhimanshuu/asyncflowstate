import type { FlowOptions, FlowMiddleware } from "@asyncflowstate/core";

/**
 * SolidJS-specific options extending core FlowOptions.
 */
export interface SolidFlowOptions<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> extends FlowOptions<TData, TError, TArgs> {
  /** If true, automatically re-executes with last args when window regains focus. */
  revalidateOnFocus?: boolean;
  /** If true, automatically re-executes with last args when network reconnects. */
  revalidateOnReconnect?: boolean;
  /** Predictive execution options. */
  predictive?: {
    /** Whether to enable prefetching on hover. */
    prefetchOnHover?: boolean;
    /** Minimum hover duration (ms) before triggering prefetch. Default: 100 */
    hoverDelay?: number;
  };
}

/**
 * Global configuration for all flows within a FlowProvider.
 */
export interface SolidFlowProviderConfig extends FlowOptions {
  behaviors?: FlowMiddleware[];
  overrideMode?: "merge" | "replace";
}

/**
 * Options for the infinite flow primitive.
 */
export interface SolidInfiniteFlowOptions<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> extends SolidFlowOptions<TData, TError, TArgs> {
  /** Function to determine the next page parameter. Return undefined/null for no more pages. */
  getNextPageParam: (lastPage: TData, allPages: TData[]) => any;
  /** Initial page parameter. */
  initialPageParam?: any;
}
