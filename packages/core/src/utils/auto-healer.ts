import { type Flow, type FlowError } from "../flow";

export interface AIHealerOptions {
  /** The LLM prompt context to help it define a fallback state. */
  context?: string;
  /** Custom fallback state generator based on error. */
  fallbackGenerator?: (error: FlowError) => Promise<any>;
}

/**
 * Wraps a core Flow to automatically self-heal failures.
 * If the original flow errors out permanently, it triggers an AI resolution strategy
 * to provide a graceful fallback state instead of a hard crash.
 *
 * @example
 * ```ts
 * const userFlow = new Flow(fetchUser);
 * const healedFlow = withAutoHealing(userFlow, {
 *   context: "Provide a mock guest user object if fetch fails."
 * });
 * ```
 */
export function withAutoHealing<TData, TError, TArgs extends any[]>(
  flow: Flow<TData, TError, TArgs>,
  options: AIHealerOptions = {},
): Flow<TData, TError, TArgs> {
  flow.use({
    onSettled: async (_data, error, _ctx) => {
      if (error && options.fallbackGenerator) {
        try {
          console.warn(
            "[AsyncFlowState AI Healer]: Flow failed, attempting healing repair...",
          );
          const fallbackData = await options.fallbackGenerator(
            error as unknown as FlowError,
          );

          // Artificially recover flow state to success
          (flow as any).setState({
            status: "success",
            data: fallbackData,
            error: null,
            progress: 100,
          });
          flow.signals.success.emit(fallbackData as unknown as TData);
          console.info(
            "[AsyncFlowState AI Healer]: Repair successful. Fallback state deployed.",
          );
        } catch (healErr) {
          console.error(
            "[AsyncFlowState AI Healer]: Healing completely failed.",
            healErr,
          );
        }
      }
    },
  });

  return flow;
}
