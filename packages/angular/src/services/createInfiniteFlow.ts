import { BehaviorSubject } from "rxjs";
import type { FlowAction } from "@asyncflowstate/core";
import { createFlow } from "./createFlow";
import type { AngularInfiniteFlowOptions } from "../types";

/**
 * Creates an Angular-friendly infinite flow instance for paginated data.
 */
export function createInfiniteFlow<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: FlowAction<TData, TArgs>,
  options: AngularInfiniteFlowOptions<TData, TError, TArgs>,
) {
  const flowInstance = createFlow(action, options);

  type InfiniteState = {
    pages: TData[];
    pageParams: any[];
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    loading: boolean;
    error: TError | null;
    status: string;
  };

  const state$ = new BehaviorSubject<InfiniteState>({
    pages: [],
    pageParams: [options.initialPageParam],
    hasNextPage: true,
    isFetchingNextPage: false,
    loading: false,
    error: null,
    status: "idle",
  });

  function reset() {
    state$.next({
      pages: [],
      pageParams: [options.initialPageParam],
      hasNextPage: true,
      isFetchingNextPage: false,
      loading: false,
      error: null,
      status: "idle",
    });
    flowInstance.reset();
  }

  async function fetchNextPage(): Promise<TData | undefined> {
    const current = state$.getValue();
    if (!current.hasNextPage || current.isFetchingNextPage) return;

    state$.next({ ...current, isFetchingNextPage: true, loading: true });
    const param = current.pageParams[current.pageParams.length - 1];

    try {
      const args = [param] as unknown as TArgs;
      const result = await flowInstance.execute(...args);

      if (result !== undefined) {
        const allPages = [...current.pages, result];
        const nextParam = options.getNextPageParam(result, allPages);
        const hasMore = nextParam !== undefined && nextParam !== null;

        state$.next({
          pages: allPages,
          pageParams: hasMore
            ? [...current.pageParams, nextParam]
            : current.pageParams,
          hasNextPage: hasMore,
          isFetchingNextPage: false,
          loading: false,
          error: null,
          status: "success",
        });

        return result;
      }
    } catch (err) {
      const c = state$.getValue();
      state$.next({
        ...c,
        isFetchingNextPage: false,
        loading: false,
        error: err as TError,
        status: "error",
      });
    }
  }

  async function refetch() {
    state$.next({
      ...state$.getValue(),
      isFetchingNextPage: true,
      loading: true,
    });
    try {
      const param = options.initialPageParam;
      const args = [param] as unknown as TArgs;
      const result = await flowInstance.execute(...args);
      if (result !== undefined) {
        const nextParam = options.getNextPageParam(result, [result]);
        const hasMore = nextParam !== undefined && nextParam !== null;
        state$.next({
          pages: [result],
          pageParams: hasMore ? [param, nextParam] : [param],
          hasNextPage: hasMore,
          isFetchingNextPage: false,
          loading: false,
          error: null,
          status: "success",
        });
      }
    } catch (err) {
      const c = state$.getValue();
      state$.next({
        ...c,
        isFetchingNextPage: false,
        loading: false,
        error: err as TError,
        status: "error",
      });
    }
  }

  return {
    state$,
    state: state$.asObservable(),
    fetchNextPage,
    refetch,
    reset,
    snapshot: () => state$.getValue(),
    destroy: () => {
      flowInstance.destroy();
      state$.complete();
    },
  };
}
