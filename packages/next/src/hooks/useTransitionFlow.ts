import { useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFlow, ReactFlowOptions } from "@asyncflowstate/react";

/**
 * Options for useTransitionFlow.
 */
export interface TransitionFlowOptions<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> extends ReactFlowOptions<TData, TError, TArgs> {
  /**
   * If true, triggers a router.refresh() after the flow succeeds.
   * Useful for Server Actions that mutate data.
   */
  refresh?: boolean;
  /**
   * Optional path to revalidate using Next.js revalidatePath.
   * Note: revalidatePath must be called from a Server Action; this option
   * serves as metadata and ensures router.refresh() is called on the client.
   */
  revalidatePath?: string;
  /**
   * Optional tag to revalidate using Next.js revalidateTag.
   */
  revalidateTag?: string;
  /**
   * If true, scrolls to the top of the page after the flow succeeds.
   */
  scrollToTop?: boolean;
}

/**
 * A specialized hook for React 19 / Next.js 15 that uses transitions for the action execution.
 * Transitions allow the UI to remain interactive while an update is pending.
 */
export function useTransitionFlow<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: (...args: TArgs) => Promise<TData>,
  options: TransitionFlowOptions<TData, TError, TArgs> = {},
) {
  const router = useRouter();
  const [isTransitionPending, startTransition] = useTransition();

  // We wrap the action to handle refresh/scroll logic on success
  const wrappedAction = useCallback(
    async (...args: TArgs) => {
      const result = await action(...args);

      if (options.refresh || options.revalidatePath || options.revalidateTag) {
        startTransition(() => {
          router.refresh();
        });
      }

      if (options.scrollToTop) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      return result;
    },
    [action, options.refresh, options.scrollToTop, router],
  );

  const flow = useFlow(wrappedAction, options);

  // Override execute to use startTransition
  const execute = useCallback(
    (...args: TArgs) => {
      return new Promise<TData | undefined>((resolve, reject) => {
        startTransition(async () => {
          try {
            const result = await flow.execute(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    },
    [flow],
  );

  return {
    ...flow,
    execute,
    /**
     * True when either the flow is loading OR the router/transition is pending.
     */
    isPending: flow.isLoading || isTransitionPending,
    /**
     * Specifically true when the React transition is pending.
     */
    isTransitionPending,
  };
}
