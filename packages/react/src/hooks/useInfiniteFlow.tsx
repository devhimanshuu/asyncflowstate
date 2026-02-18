import { useState, useCallback } from "react";
import type { FlowAction, FlowOptions } from "@asyncflowstate/core";
import { useFlow } from "./useFlow";

export interface InfiniteFlowOptions<
  TData,
  TError,
  TArgs extends any[],
> extends FlowOptions<TData, TError, TArgs> {
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

export interface InfiniteFlowResult<TData, TError> {
  pages: TData[];
  pageParams: any[];
  status: "idle" | "loading" | "success" | "error";
  error: TError | null;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<TData | undefined>;
  refetch: () => Promise<void>;
  reset: () => void;
}

export function useInfiniteFlow<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: FlowAction<TData, TArgs>,
  options: InfiniteFlowOptions<TData, TError, TArgs>,
) {
  const [pages, setPages] = useState<TData[]>([]);
  const [pageParams, setPageParams] = useState<any[]>([
    options.initialPageParam,
  ]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  // We use a single flow instance to fetch pages one by one
  const flow = useFlow(action, options);

  // Reset pagination when the flow resets
  const reset = useCallback(() => {
    setPages([]);
    setPageParams([options.initialPageParam]);
    setHasNextPage(true);
    setIsFetchingNextPage(false);
    flow.reset();
  }, [flow, options.initialPageParam]);

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    setIsFetchingNextPage(true);
    const param = pageParams[pageParams.length - 1];

    try {
      // Execute the action with the page param
      // Note: We assume the action takes the page param as the LAST argument?
      // Or we just pass it as an argument.
      // Usually, useInfiniteFlow actions expect the param.
      // Let's assume action(param, ...otherargs) or just action(param)
      // For simplicity, we pass `param` as the first arg, or `...args` if provided?
      // But fetchNextPage usually doesn't take args.
      // Let's assume the action signature includes the page param.

      // We need to cast because TArgs might be complex.
      // Ideally, the user provides a wrapper.
      const args = [param] as unknown as TArgs;
      const result = await flow.execute(...args);

      if (result !== undefined) {
        setPages((prev) => [...prev, result]);

        const nextParam = options.getNextPageParam(result, [...pages, result]);
        if (nextParam !== undefined && nextParam !== null) {
          setPageParams((prev) => [...prev, nextParam]);
          setHasNextPage(true);
        } else {
          setHasNextPage(false);
        }
        return result;
      }
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [flow, hasNextPage, isFetchingNextPage, pageParams, pages, options]);

  const refetch = useCallback(async () => {
    // Refetch from scratch
    reset();
    // We need to wait for state update? No, reset sets state.
    // But we need to trigger the first fetch.
    // Since reset() is sync (state updates are batched/async), we might need to handle this carefully.
    // Actually, refetch usually just clears and calling fetchNextPage.
    // But fetchNextPage depends on state.

    // Better approach: Direct execution for first page.
    setIsFetchingNextPage(true);
    try {
      const param = options.initialPageParam;
      const args = [param] as unknown as TArgs;
      const result = await flow.execute(...args);
      if (result !== undefined) {
        setPages([result]);
        setPageParams([param]); // Reset params
        const nextParam = options.getNextPageParam(result, [result]);
        if (nextParam !== undefined && nextParam !== null) {
          setPageParams((prev) => [...prev, nextParam]);
          setHasNextPage(true);
        } else {
          setHasNextPage(false);
        }
      }
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [flow, options, reset]);

  // Initial fetch? Usually handled by user via useEffect or manual call.

  return {
    ...flow,
    pages,
    pageParams,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    reset,
  };
}
