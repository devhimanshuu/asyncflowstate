import { ref, reactive } from "vue";
import type { FlowAction } from "@asyncflowstate/core";
import { useFlow } from "./useFlow";
import type { VueInfiniteFlowOptions } from "../types";

/**
 * Vue 3 composable for infinite scrolling / paginated data fetching.
 * Manages cumulative pages of data with automatic next-page detection.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useInfiniteFlow } from '@asyncflowstate/vue';
 *
 * const infinite = useInfiniteFlow(
 *   async (cursor) => api.getPostsPage(cursor),
 *   {
 *     getNextPageParam: (lastPage) => lastPage.nextCursor,
 *     initialPageParam: undefined,
 *   }
 * );
 * </script>
 *
 * <template>
 *   <div v-for="page in infinite.pages" :key="page.cursor">
 *     <div v-for="post in page.items" :key="post.id">{{ post.title }}</div>
 *   </div>
 *   <button
 *     v-if="infinite.hasNextPage"
 *     @click="infinite.fetchNextPage()"
 *     :disabled="infinite.isFetchingNextPage"
 *   >
 *     {{ infinite.isFetchingNextPage ? 'Loading...' : 'Load More' }}
 *   </button>
 * </template>
 * ```
 */
export function useInfiniteFlow<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: FlowAction<TData, TArgs>,
  options: VueInfiniteFlowOptions<TData, TError, TArgs>,
) {
  const pages = ref<TData[]>([]);
  const pageParams = ref<any[]>([options.initialPageParam]);
  const hasNextPage = ref(true);
  const isFetchingNextPage = ref(false);

  const flow = useFlow(action, options);

  function reset() {
    pages.value = [];
    pageParams.value = [options.initialPageParam];
    hasNextPage.value = true;
    isFetchingNextPage.value = false;
    flow.reset();
  }

  async function fetchNextPage(): Promise<TData | undefined> {
    if (!hasNextPage.value || isFetchingNextPage.value) return;

    isFetchingNextPage.value = true;
    const param = pageParams.value[pageParams.value.length - 1];

    try {
      const args = [param] as unknown as TArgs;
      const result = await flow.execute(...args);

      if (result !== undefined) {
        const allPages = [...pages.value, result] as TData[];
        pages.value = allPages as any;

        const nextParam = options.getNextPageParam(result, allPages);
        if (nextParam !== undefined && nextParam !== null) {
          pageParams.value = [...pageParams.value, nextParam];
          hasNextPage.value = true;
        } else {
          hasNextPage.value = false;
        }
        return result;
      }
    } finally {
      isFetchingNextPage.value = false;
    }
  }

  async function refetch() {
    isFetchingNextPage.value = true;
    try {
      const param = options.initialPageParam;
      const args = [param] as unknown as TArgs;
      const result = await flow.execute(...args);
      if (result !== undefined) {
        pages.value = [result] as any;
        pageParams.value = [param];
        const nextParam = options.getNextPageParam(result, [result]);
        if (nextParam !== undefined && nextParam !== null) {
          pageParams.value = [param, nextParam];
          hasNextPage.value = true;
        } else {
          hasNextPage.value = false;
        }
      }
    } finally {
      isFetchingNextPage.value = false;
    }
  }

  return reactive({
    ...flow,
    pages,
    pageParams,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    reset,
  });
}
