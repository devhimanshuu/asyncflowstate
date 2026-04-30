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
  /**
   * Accessibility options for automatic screen reader announcements.
   */
  a11y?: AngularA11yOptions<TData, TError>;
}

/**
 * Accessibility options for automatic screen reader announcements.
 */
export interface AngularA11yOptions<TData, TError> {
  /** Message or function to generate a message when the action succeeds. */
  announceSuccess?: string | ((data: TData) => string);
  /** Message or function to generate a message when the action fails. */
  announceError?: string | ((error: TError) => string);
  /** Relationship of the live region. Default is 'polite'. */
  liveRegionRel?: "polite" | "assertive";
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
  isPrewarmed: boolean;
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
