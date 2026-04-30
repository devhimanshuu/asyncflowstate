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
   * Accessibility options for automatic screen reader announcements.
   */
  a11y?: SvelteA11yOptions<TData, TError>;
}

/**
 * Accessibility options for automatic screen reader announcements.
 */
export interface SvelteA11yOptions<TData, TError> {
  /** Message or function to generate a message when the action succeeds. */
  announceSuccess?: string | ((data: TData) => string);
  /** Message or function to generate a message when the action fails. */
  announceError?: string | ((error: TError) => string);
  /** Relationship of the live region. Default is 'polite'. */
  liveRegionRel?: "polite" | "assertive";
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
