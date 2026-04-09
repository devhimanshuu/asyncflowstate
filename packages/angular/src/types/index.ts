import type { FlowOptions, FlowStatus } from "@asyncflowstate/core";

/**
 * Angular-specific options extending core FlowOptions.
 */
export interface AngularFlowOptions<
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
 * Mapped state emitted by the BehaviorSubject.
 */
export interface FlowSignalState<TData = any, TError = any> {
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
}

/**
 * Options for the infinite flow factory.
 */
export interface AngularInfiniteFlowOptions<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> extends AngularFlowOptions<TData, TError, TArgs> {
  /** Function to determine the next page parameter. Return undefined/null for no more pages. */
  getNextPageParam: (lastPage: TData, allPages: TData[]) => any;
  /** Initial page parameter. */
  initialPageParam?: any;
}
