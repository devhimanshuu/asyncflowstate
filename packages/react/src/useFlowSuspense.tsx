import { type FlowAction } from "@asyncflowstate/core";
import { useFlow, type ReactFlowOptions } from "./useFlow";

/**
 * A Suspense-enabled version of useFlow.
 * - Throws a Promise when loading (for <Suspense>).
 * - Throws an Error when failed (for <ErrorBoundary>).
 * - Returns the flow object when successful or idle.
 *
 * @param action The asynchronous function to manage.
 * @param options Configuration for the flow.
 */
export function useFlowSuspense<
    TData = any,
    TError = any,
    TArgs extends any[] = any[],
>(
    action: FlowAction<TData, TArgs>,
    options: ReactFlowOptions<TData, TError, TArgs> = {},
) {
    const flowState = useFlow(action, options);
    const { flow, status, error, loading } = flowState;

    // 1. Handle Error Boundary
    if (status === "error" && error) {
        throw error;
    }

    // 2. Handle Suspense
    if (loading) {
        throw new Promise<void>((resolve) => {
            const unsubscribe = flow.subscribe((state) => {
                if (state.status !== "loading") {
                    unsubscribe();
                    resolve();
                }
            });
        });
    }

    return flowState;
}
