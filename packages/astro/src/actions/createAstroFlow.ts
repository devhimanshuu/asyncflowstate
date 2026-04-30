import { Flow, type FlowOptions, type FlowAction } from "@asyncflowstate/core";

/**
 * A helper for Astro Actions (server-side or client-side).
 */
export function createAstroFlow<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: FlowAction<TData, TArgs>,
  options: FlowOptions<TData, TError, TArgs> = {},
) {
  // Astro Actions often return { data, error } objects
  const wrappedAction: FlowAction<TData, TArgs> = async (...args) => {
    const result = await action(...args);

    // Handle Astro Action result format if it looks like { data, error }
    if (
      result &&
      typeof result === "object" &&
      ("data" in result || "error" in result)
    ) {
      if ((result as any).error) throw (result as any).error;
      return (result as any).data;
    }

    return result as TData;
  };

  return new Flow<TData, TError, TArgs>(wrappedAction, options);
}
