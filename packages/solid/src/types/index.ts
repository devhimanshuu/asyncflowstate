import { type FlowOptions, type FlowMiddleware } from "@asyncflowstate/core";

/**
 * Solid-specific options extending core FlowOptions.
 */
export interface SolidFlowOptions<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> extends FlowOptions<TData, TError, TArgs> {
  /**
   * If true, automatically re-executes with last args when window regains focus.
   */
  revalidateOnFocus?: boolean;
  /**
   * If true, automatically re-executes with last args when network reconnects.
   */
  revalidateOnReconnect?: boolean;
  /**
   * Accessibility options for automatic screen reader announcements.
   */
  a11y?: SolidA11yOptions<TData, TError>;
}

/**
 * Accessibility options for automatic screen reader announcements.
 */
export interface SolidA11yOptions<TData, TError> {
  /** Message or function to generate a message when the action succeeds. */
  announceSuccess?: string | ((data: TData) => string);
  /** Message or function to generate a message when the action fails. */
  announceError?: string | ((error: TError) => string);
  /** Relationship of the live region. Default is 'polite'. */
  liveRegionRel?: "polite" | "assertive";
}

/**
 * Global configuration for all flows within a Solid FlowProvider.
 */
export interface SolidFlowProviderConfig extends SolidFlowOptions {
  /**
   * Global interceptors or behaviors that apply to every flow.
   */
  behaviors?: FlowMiddleware[];
  /**
   * If true, local flow options will completely override global options.
   * If false (default), local options will be merged with global options.
   */
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
  /**
   * Function to determine the next page parameter.
   */
  getNextPageParam: (lastPage: TData, allPages: TData[]) => any;
  /**
   * Initial page parameter.
   */
  initialPageParam?: any;
}
