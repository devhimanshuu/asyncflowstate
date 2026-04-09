import type { FlowOptions } from "@asyncflowstate/core";

/**
 * Svelte-specific options extending core FlowOptions.
 */
export interface SvelteFlowOptions<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> extends FlowOptions<TData, TError, TArgs> {
  /** If true, automatically re-executes with last args when window regains focus. */
  revalidateOnFocus?: boolean;
  /** If true, automatically re-executes with last args when network reconnects. */
  revalidateOnReconnect?: boolean;
  /**
   * Predictive execution options.
   * Tracks user intent (hover, pointer velocity) to prefetch the action.
   */
  predictive?: {
    /** Whether to enable prefetching on hover. */
    prefetchOnHover?: boolean;
    /** Minimum hover duration (ms) before triggering prefetch. Default: 100 */
    hoverDelay?: number;
  };
}

/**
 * Options for the infinite flow store.
 */
export interface SvelteInfiniteFlowOptions<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> extends SvelteFlowOptions<TData, TError, TArgs> {
  /** Function to determine the next page parameter. Return undefined/null for no more pages. */
  getNextPageParam: (lastPage: TData, allPages: TData[]) => any;
  /** Initial page parameter. */
  initialPageParam?: any;
}
