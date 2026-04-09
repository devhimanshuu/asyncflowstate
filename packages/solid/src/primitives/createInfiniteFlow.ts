import { createSignal } from "solid-js";
import type { FlowAction } from "@asyncflowstate/core";
import { createFlow } from "./createFlow";
import type { SolidInfiniteFlowOptions } from "../types";

export function createInfiniteFlow<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: FlowAction<TData, TArgs>,
  options: SolidInfiniteFlowOptions<TData, TError, TArgs>,
) {
  const flowPrimitive = createFlow(action, options);

  const [pages, setPages] = createSignal<TData[]>([]);
  const [pageParams, setPageParams] = createSignal<any[]>([options.initialPageParam]);
  const [hasNextPage, setHasNextPage] = createSignal(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = createSignal(false);

  function reset() {
    setPages([]);
    setPageParams([options.initialPageParam]);
    setHasNextPage(true);
    setIsFetchingNextPage(false);
    flowPrimitive.reset();
  }

  async function fetchNextPage(): Promise<TData | undefined> {
    if (!hasNextPage() || isFetchingNextPage()) return;

    setIsFetchingNextPage(true);
    const params = pageParams();
    const param = params[params.length - 1];

    try {
      const args = [param] as unknown as TArgs;
      const result = await flowPrimitive.execute(...args);

      if (result !== undefined) {
        const allPages = [...pages(), result];
        setPages(allPages);

        const nextParam = options.getNextPageParam(result, allPages);
        if (nextParam !== undefined && nextParam !== null) {
          setPageParams((prev: any[]) => [...prev, nextParam]);
          setHasNextPage(true);
        } else {
          setHasNextPage(false);
        }
        return result;
      }
    } finally {
      setIsFetchingNextPage(false);
    }
  }

  async function refetch() {
    setIsFetchingNextPage(true);
    try {
      const param = options.initialPageParam;
      const args = [param] as unknown as TArgs;
      const result = await flowPrimitive.execute(...args);
      if (result !== undefined) {
        setPages([result]);
        setPageParams([param]);
        const nextParam = options.getNextPageParam(result, [result]);
        if (nextParam !== undefined && nextParam !== null) {
          setPageParams((prev: any[]) => [...prev, nextParam]);
          setHasNextPage(true);
        } else {
          setHasNextPage(false);
        }
      }
    } finally {
      setIsFetchingNextPage(false);
    }
  }

  return {
    ...flowPrimitive,
    pages,
    pageParams,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    reset,
  };
}
