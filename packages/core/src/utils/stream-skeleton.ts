export interface AISkeletonOptions {
  /** The expected shape of the data that the LLM/API is returning. */
  schema: Record<string, "string" | "number" | "boolean" | "list" | "object">;
  /** Artificial delay between streaming properties to screen. */
  streamingDelay?: number;
  /** Optional key to fetch historical data for high-fidelity blurring. */
  persistenceKey?: string;
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
  const { schema, streamingDelay = 150, persistenceKey } = options;
  const keys = Object.keys(schema);
  const skeletonObject: Record<string, any> = {};

  // Try to load historical data for "Ghost" effect
  let historicalData: any = null;
  if (persistenceKey && typeof localStorage !== "undefined") {
    try {
      const saved = localStorage.getItem(`af_ghost_${persistenceKey}`);
      if (saved) historicalData = JSON.parse(saved);
    } catch {
      /* ignore */
    }
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const type = schema[key];

    if (historicalData && historicalData[key] !== undefined) {
      // Use historical data but "obfuscate" it slightly if it's a string
      if (typeof historicalData[key] === "string") {
        skeletonObject[key] = historicalData[key].replace(/[a-zA-Z0-9]/g, "█");
      } else {
        skeletonObject[key] = historicalData[key];
      }
    } else {
      // Fallback to generic placeholders
      if (type === "string") skeletonObject[key] = "█████████";
      else if (type === "number") skeletonObject[key] = "000";
      else if (type === "boolean") skeletonObject[key] = false;
      else if (type === "list") skeletonObject[key] = [];
      else skeletonObject[key] = "████";
    }

    await new Promise((resolve) =>
      setTimeout(resolve, i === 0 ? 0 : streamingDelay),
    );

    // Deep clone before yielding
    yield JSON.parse(JSON.stringify(skeletonObject));
  }
}

/**
 * Saves a data snapshot for future high-fidelity ghost previews.
 */
export function recordGhostData(key: string, data: any): void {
  if (typeof localStorage === "undefined" || !data) return;
  try {
    localStorage.setItem(`af_ghost_${key}`, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}
