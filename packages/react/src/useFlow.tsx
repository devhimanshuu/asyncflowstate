import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from "react";
import {
  Flow,
  type FlowAction,
  type FlowOptions,
  type FlowState,
} from "@asyncflowstate/core";
import { useFlowContext, mergeFlowOptions } from "./FlowProvider";

/**
 * Options for the `form()` helper.
 */
export interface FormHelperOptions<TArgs extends any[]> {
  /**
   * If true, automatically extracts form data using `new FormData(form)`
   * and passes it as the first argument to the action.
   */
  extractFormData?: boolean;
  /**
   * Optional validation function. If it returns an object of errors,
   * the action will not be executed.
   */
  validate?: (
    ...args: TArgs
  ) =>
    | Record<string, string>
    | null
    | undefined
    | Promise<Record<string, string> | null | undefined>;
  /** If true, resets the form element after a successful action completion. */
  resetOnSuccess?: boolean;
  /** Allow any other HTML attributes to be passed through. */
  [key: string]: any;
}

/**
 * Options for the `button()` helper.
 */
export interface ButtonHelperOptions extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Allow any other HTML attributes (like data-* or aria-*) to be passed through. */
  [key: string]: any;
}

/**
 * Accessibility options for automatic screen reader announcements.
 */
export interface A11yOptions<TData, TError> {
  /** Message or function to generate a message when the action succeeds. */
  announceSuccess?: string | ((data: TData) => string);
  /** Message or function to generate a message when the action fails. */
  announceError?: string | ((error: TError) => string);
  /** Relationship of the live region. Default is 'polite'. */
  liveRegionRel?: "polite" | "assertive";
}

/**
 * React-specific options for the `useFlow` hook.
 */
export interface ReactFlowOptions<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> extends FlowOptions<TData, TError, TArgs> {
  /** Accessibility configuration for automatic announcements. */
  a11y?: A11yOptions<TData, TError>;
  /**
   * Which usually happens when navigating away.
   * Default: true
   */
  cancelOnUnmount?: boolean;
  /**
   * If true, the flow will continue running in the background even if the component unmounts.
   * Useful for file uploads or critical updates. Overrides cancelOnUnmount.
   */
  keepAlive?: boolean;
  /**
   * If true, automatically re-executes the flow with the last arguments
   * when the window regains focus.
   */
  revalidateOnFocus?: boolean;
  /**
   * If true, automatically re-executes the flow with the last arguments
   * when the network reconnects.
   */
  revalidateOnReconnect?: boolean;
}

/**
 * useFlow is a React hook that orchestrates asynchronous actions and their UI states.
 * It provides a snapshot of the flow state and convenient helpers for buttons and forms.
 *
 * @param action The asynchronous function to manage.
 * @param options Configuration for the flow behavior and accessibility.
 * @returns An object containing the flow state and interaction helpers.
 *
 * @example Basic usage
 * ```tsx
 * const flow = useFlow(async (userId: string) => {
 *   return await api.fetchUser(userId);
 * });
 *
 * return (
 *   <button {...flow.button()}>
 *     {flow.loading ? 'Loading...' : 'Fetch User'}
 *   </button>
 * );
 * ```
 *
 * @example With timeout and retry
 * ```tsx
 * const flow = useFlow(fetchData, {
 *   timeout: 5000, // Cancel after 5 seconds
 *   retry: { maxAttempts: 3, backoff: 'exponential' },
 *   onError: (error) => {
 *     if (error.type === FlowErrorType.TIMEOUT) {
 *       toast.error('Request timed out');
 *     }
 *   }
 * });
 * ```
 *
 * @example Optimistic updates with rollback
 * ```tsx
 * const flow = useFlow(likePost, {
 *   optimisticResult: (prevData, [postId]) => ({
 *     ...prevData,
 *     likes: prevData.likes + 1,
 *     isLiked: true
 *   }),
 *   rollbackOnError: true,
 *   onError: () => toast.error('Like failed, changes reverted')
 * });
 * ```
 */
export function useFlow<TData = any, TError = any, TArgs extends any[] = any[]>(
  action: FlowAction<TData, TArgs>,
  options: ReactFlowOptions<TData, TError, TArgs> = {},
) {
  // Get global configuration from FlowProvider
  const globalConfig = useFlowContext();

  // Persist the action and options to avoid re-creation effects
  const actionRef = useRef(action);
  const optionsRef = useRef<ReactFlowOptions<TData, TError, TArgs>>(options);

  useEffect(() => {
    actionRef.current = action;
    optionsRef.current = options;
    optionsRef.current = options;
  }, [action, options]);

  // Track last arguments for revalidation
  const lastArgsRef = useRef<TArgs | null>(null);

  // Initial merged options for the first creation
  const initialMergedOptions = useRef(mergeFlowOptions(globalConfig, options));

  // Initialize Flow instance once
  const [flow] = useState(
    () =>
      new Flow<TData, TError, TArgs>(
        (...args: TArgs) => actionRef.current(...args),
        initialMergedOptions.current,
      ),
  );

  // Sync React state with Flow state snapshot
  const [snapshot, setSnapshot] = useState<FlowState<TData, TError>>(
    () => flow.state,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [announcement, setAnnouncement] = useState("");

  // Sync options to the flow instance when they change
  useEffect(() => {
    flow.setOptions(mergeFlowOptions(globalConfig, options));
  }, [flow, options, globalConfig]);

  // Cleanup: Cancel flow on unmount
  useEffect(() => {
    return () => {
      const shouldCancel = options.cancelOnUnmount !== false && !options.keepAlive;
      if (shouldCancel) {
        flow.cancel();
      }
    };
  }, [flow, options.cancelOnUnmount, options.keepAlive]);

  // Accessibility: Auto-focus error when it appears
  const errorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (snapshot.status === "error" && errorRef.current) {
      errorRef.current.focus();
    }
  }, [snapshot.status]);

  // Accessibility: Handle announcements
  useEffect(() => {
    if (snapshot.status === "success" && options.a11y?.announceSuccess) {
      const msg =
        typeof options.a11y.announceSuccess === "function"
          ? options.a11y.announceSuccess(snapshot.data!)
          : options.a11y.announceSuccess;
      setAnnouncement(msg);
    } else if (snapshot.status === "error" && options.a11y?.announceError) {
      const msg =
        typeof options.a11y.announceError === "function"
          ? options.a11y.announceError(snapshot.error!)
          : options.a11y.announceError;
      setAnnouncement(msg);
    }
  }, [snapshot.status, snapshot.data, snapshot.error, options.a11y]);

  /**
   * An ARIA live region component that automatically announces success/error states.
   * Place this anywhere in your component tree.
   */
  const LiveRegion = useCallback(
    () => (
      <div
        aria-live={options.a11y?.liveRegionRel || "polite"}
        aria-atomic="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: "0",
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: "0",
        }}
      >
        {announcement}
      </div>
    ),
    [announcement, options.a11y?.liveRegionRel],
  );

  /**
   * Returns props for a button element, including disabled and aria-busy states.
   * If no onClick is provided, clicking the button will execute the flow with no args.
   */
  const button = useCallback(
    (props: ButtonHelperOptions = {}) => {
      const { onClick, ...rest } = props;

      return {
        disabled: flow.isLoading,
        "aria-busy": flow.isLoading,
        onClick: async (e: MouseEvent<HTMLButtonElement>) => {
          if (onClick) {
            onClick(e);
          } else {
            // If TArgs allows zero arguments (length 0), we can safely call it.
            // We use a type cast here but guard it with a logic check or
            // accept that the user must manage args if TArgs is required.
            // To be truly type-safe, we should probably only auto-call if TArgs is []
            // but for convenience we keep it as is with a better internal handling.
            (flow.execute as any)();
          }
        },
        ...rest,
      };
    },
    [flow],
  );

  /**
   * Returns props for a form element, including aria-busy and onSubmit handling.
   * Supports automatic FormData extraction and validation.
   */
  const form = useCallback(
    (
      formProps: FormHelperOptions<TArgs> &
        React.FormHTMLAttributes<HTMLFormElement> = {},
    ) => {
      const {
        onSubmit,
        extractFormData = false,
        validate,
        resetOnSuccess = false,
        ...rest
      } = formProps;

      return {
        "aria-busy": flow.isLoading,
        onSubmit: async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          setFieldErrors({});

          let args = [] as unknown as TArgs;

          if (extractFormData) {
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            args = [data] as unknown as TArgs;
          }

          // Validation
          if (validate) {
            const errors = await validate(...args);
            if (errors && Object.keys(errors).length > 0) {
              setFieldErrors(errors);
              return;
            }
          }

          if (onSubmit) {
            onSubmit(e);
          } else {
            const result = await flow.execute(...args);
            lastArgsRef.current = args;
            if (result !== undefined && resetOnSuccess) {
              (e.currentTarget as HTMLFormElement).reset();
            }
          }
        },
        ...rest,
      };
    },
    [flow],
  );

  useEffect(() => {
    return flow.subscribe(setSnapshot);
  }, [flow]);

  // Handle Auto-Revalidation
  useEffect(() => {
    const handleFocus = () => {
      if (
        document.visibilityState === "visible" &&
        optionsRef.current.revalidateOnFocus &&
        lastArgsRef.current
      ) {
        flow.execute(...lastArgsRef.current);
      }
    };

    const handleOnline = () => {
      if (optionsRef.current.revalidateOnReconnect && lastArgsRef.current) {
        flow.execute(...lastArgsRef.current);
      }
    };

    window.addEventListener("focus", handleFocus); // Also listen to window focus for better coverage
    document.addEventListener("visibilitychange", handleFocus);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("online", handleOnline);
    };
  }, [flow]);

  // Memoize the return value to prevent unnecessary re-renders of consuming components
  return {
    /** The complete flow state snapshot */
    ...snapshot,
    /** Whether the flow is currently loading (respects loading.delay) */
    loading: flow.isLoading,
    /** Executes the action manually */
    execute: useCallback(
      (...args: TArgs) => {
        lastArgsRef.current = args;
        return flow.execute(...args);
      },
      [flow],
    ),
    /** Resets the flow state to idle */
    reset: flow.reset.bind(flow),
    /** Cancels the currently running action */
    cancel: flow.cancel.bind(flow),
    /** Manually sets the progress value */
    setProgress: flow.setProgress.bind(flow),
    /** Helper for button props */
    button,
    /** Helper for form props */
    form,
    /** React Ref to the error message element for auto-focus management */
    errorRef,
    /** Field-level errors from the form validation helper */
    fieldErrors,
    /** ARIA live region component for announcements */
    LiveRegion,
    /** The underlying Flow instance (advanced usage) */
    flow,
  };
}
