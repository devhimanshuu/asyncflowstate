import { useFlow, type VueFlowOptions } from "@asyncflowstate/vue";

/**
 * Nuxt-specific flow options.
 */
export interface NuxtFlowOptions<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> extends VueFlowOptions<TData, TError, TArgs> {
  /**
   * Optional key for useAsyncData integration.
   */
  key?: string;
}

/**
 * A specialized hook for Nuxt 3 that integrates useFlow with Nuxt context.
 */
export function useNuxtFlow<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: (...args: TArgs) => Promise<TData>,
  options: NuxtFlowOptions<TData, TError, TArgs> = {},
) {
  const flow = useFlow(action, options);

  const originalExecute = flow.execute;

  flow.execute = async (...args: TArgs) => {
    return await originalExecute(...args);
  };

  return flow;
}
