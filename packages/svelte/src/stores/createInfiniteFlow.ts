import { writable, get } from "svelte/store";
import type { FlowAction } from "@asyncflowstate/core";
import { createFlow } from "./createFlow";
import type { SvelteInfiniteFlowOptions } from "../types";

/**
 * Creates a Svelte store for infinite scrolling / paginated data fetching.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createInfiniteFlow } from '@asyncflowstate/svelte';
 *   const infinite = createInfiniteFlow(
 *     async (cursor) => api.getPostsPage(cursor),
 *     {
 *       getNextPageParam: (lastPage) => lastPage.nextCursor,
 *       initialPageParam: undefined,
 *     }
 *   );
 * </script>
 *
 * {#each $infinite.pages as page}
 *   {#each page.items as item}
 *     <p>{item.title}</p>
 *   {/each}
 * {/each}
 *
 * {#if $infinite.hasNextPage}
 *   <button on:click={() => infinite.fetchNextPage()} disabled={$infinite.isFetchingNextPage}>
 *     Load More
 *   </button>
 * {/if}
 * ```
 */
export function createInfiniteFlow<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: FlowAction<TData, TArgs>,
  options: SvelteInfiniteFlowOptions<TData, TError, TArgs>,
) {
  const flowStore = createFlow(action, options);

  const store = writable<{
    pages: TData[];
    pageParams: any[];
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    loading: boolean;
    error: TError | null;
    status: string;
  }>({
    pages: [],
    pageParams: [options.initialPageParam],
    hasNextPage: true,
    isFetchingNextPage: false,
    loading: false,
    error: null,
    status: "idle",
  });

  function reset() {
    store.set({
      pages: [],
      pageParams: [options.initialPageParam],
      hasNextPage: true,
      isFetchingNextPage: false,
      loading: false,
      error: null,
      status: "idle",
    });
    flowStore.reset();
  }

  async function fetchNextPage(): Promise<TData | undefined> {
    const current = get(store);
    if (!current.hasNextPage || current.isFetchingNextPage) return;

    store.update((s) => ({ ...s, isFetchingNextPage: true, loading: true }));
    const param = current.pageParams[current.pageParams.length - 1];

    try {
      const args = [param] as unknown as TArgs;
      const result = await flowStore.execute(...args);

      if (result !== undefined) {
        const allPages = [...current.pages, result];
        const nextParam = options.getNextPageParam(result, allPages);
        const hasMore = nextParam !== undefined && nextParam !== null;

        store.update((s) => ({
          ...s,
          pages: allPages,
          pageParams: hasMore ? [...s.pageParams, nextParam] : s.pageParams,
          hasNextPage: hasMore,
          isFetchingNextPage: false,
          loading: false,
          status: "success",
        }));

        return result;
      }
    } catch (err) {
      store.update((s) => ({
        ...s,
        isFetchingNextPage: false,
        loading: false,
        error: err as TError,
        status: "error",
      }));
    }
  }

  async function refetch() {
    store.update((s) => ({ ...s, isFetchingNextPage: true, loading: true }));
    try {
      const param = options.initialPageParam;
      const args = [param] as unknown as TArgs;
      const result = await flowStore.execute(...args);
      if (result !== undefined) {
        const nextParam = options.getNextPageParam(result, [result]);
        const hasMore = nextParam !== undefined && nextParam !== null;
        store.set({
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
      store.update((s) => ({
        ...s,
        isFetchingNextPage: false,
        loading: false,
        error: err as TError,
        status: "error",
      }));
    }
  }

  return {
    subscribe: store.subscribe,
    fetchNextPage,
    refetch,
    reset,
    destroy: flowStore.destroy,
  };
}
