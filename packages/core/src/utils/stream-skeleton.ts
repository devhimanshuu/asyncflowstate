export interface AISkeletonOptions {
  /** The expected shape of the data that the LLM/API is returning. */
  schema: Record<string, "string" | "number" | "boolean" | "list" | "object">;
  /** Artificial delay between streaming properties to screen. */
  streamingDelay?: number;
}

/**
 * Utility to generate an intelligent loading skeleton matching the exact data schema expected.
 * This simulates a chunked LLM response bringing in a skeleton piece by piece.
 *
 * @example
 * ```ts
 * const stream = streamAISkeleton({
 *   schema: { name: "string", age: "number", connected: "boolean" }
 * });
 * for await (const chunk of stream) {
 *   // Update UI with chunk
 * }
 * ```
 */
export async function* streamAISkeleton(
  options: AISkeletonOptions,
): AsyncGenerator<any> {
  const { schema, streamingDelay = 150 } = options;
  const keys = Object.keys(schema);
  const skeletonObject: Record<string, any> = {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const type = schema[key];

    // Assign generic placeholder based on type
    if (type === "string") skeletonObject[key] = "█████████";
    else if (type === "number") skeletonObject[key] = "000";
    else if (type === "boolean") skeletonObject[key] = false;
    else if (type === "list") skeletonObject[key] = [];
    else skeletonObject[key] = "████";

    await new Promise((resolve) => setTimeout(resolve, streamingDelay));

    // Deep clone before yielding
    yield JSON.parse(JSON.stringify(skeletonObject));
  }
}
