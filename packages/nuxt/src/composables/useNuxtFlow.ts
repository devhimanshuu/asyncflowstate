import { useFlow, type VueFlowOptions } from "@asyncflowstate/vue";
import { useNuxtApp } from "#app";

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
  const nuxtApp = useNuxtApp();
  const flow = useFlow(action, options);

  // We can add Nuxt-specific logic here, like integrating with Nuxt's error handling
  const originalExecute = flow.execute;

  flow.execute = async (...args: TArgs) => {
    try {
      return await originalExecute(...args);
    } catch (err: any) {
      // Potentially trigger clearError() or other Nuxt patterns
      throw err;
    }
  };

  return flow;
}
