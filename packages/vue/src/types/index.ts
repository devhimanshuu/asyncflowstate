import type { FlowOptions, FlowMiddleware } from "@asyncflowstate/core";

/**
 * Vue-specific options extending the core FlowOptions.
 */
export interface VueFlowOptions<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> extends FlowOptions<TData, TError, TArgs> {
  /**
   * If true, cancels the flow when the component is unmounted.
   * Default: true
   */
  cancelOnUnmount?: boolean;
  /**
   * If true, the flow continues running even after the component unmounts.
   * Overrides cancelOnUnmount.
   */
  keepAlive?: boolean;
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
  a11y?: VueA11yOptions<TData, TError>;
}

/**
 * Accessibility options for automatic screen reader announcements.
 */
export interface VueA11yOptions<TData, TError> {
  /** Message or function to generate a message when the action succeeds. */
  announceSuccess?: string | ((data: TData) => string);
  /** Message or function to generate a message when the action fails. */
  announceError?: string | ((error: TError) => string);
  /** Relationship of the live region. Default is 'polite'. */
  liveRegionRel?: "polite" | "assertive";
}

/**
 * Global configuration for all flows within a FlowProvider.
 */
export interface VueFlowProviderConfig extends VueFlowOptions {
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
 * Options for the `form()` helper.
 */
export interface VueFormHelperOptions<TArgs extends any[] = any[]> {
  /**
   * If true, automatically extracts form data using `new FormData(form)`.
   */
  extractFormData?: boolean;
  /**
   * Optional validation function.
   */
  validate?: (
    ...args: TArgs
  ) =>
    | Record<string, string>
    | null
    | undefined
    | Promise<Record<string, string> | null | undefined>;
  /**
   * Optional validation schema (Zod, Valibot, Superstruct, etc.).
   */
  schema?: any;
  /** If true, resets the form element after a successful action completion. */
  resetOnSuccess?: boolean;
  /** Allow any other HTML attributes to be passed through. */
  [key: string]: any;
}

/**
 * Options for the infinite flow composable.
 */
export interface VueInfiniteFlowOptions<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> extends VueFlowOptions<TData, TError, TArgs> {
  /**
   * Function to determine the next page parameter.
   * Return undefined or null to indicate there are no more pages.
   */
  getNextPageParam: (lastPage: TData, allPages: TData[]) => any;
  /**
   * Initial page parameter to use for the first page.
   */
  initialPageParam?: any;
}
