import { useFlow, ReactFlowOptions } from "@asyncflowstate/react";
import { useCallback } from "react";

/**
 * A specialized hook for Next.js Server Actions.
 * Integrates with useFlow to provide declarative loading and error states for server-side logic.
 */
export function useServerActionFlow<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: (...args: TArgs) => Promise<TData>,
  options: ReactFlowOptions<TData, TError, TArgs> = {},
): ReturnType<typeof useFlow<TData, TError, TArgs>> {
  // Wrap the action to ensure it works well with Server Action semantics if needed
  // For now, it's a thin wrapper around useFlow but can be extended for transition handling
  const flow = useFlow(action, options);

  return flow;
}
