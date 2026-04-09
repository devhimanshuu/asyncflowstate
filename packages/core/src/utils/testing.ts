import { Flow } from "../flow";

/**
 * Creates a Flow instance with controllable resolution.
 * Useful for unit testing components that consume a Flow.
 *
 * @example
 * ```ts
 * const { flow, resolve, reject } = createMockFlow();
 *
 * // Pass flow to component
 * render(<MyComponent flow={flow} />);
 *
 * // Simulate success
 * await act(async () => {
 *   flow.execute();
 *   resolve({ id: 1 });
 * });
 * ```
 */
export function createMockFlow<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>() {
  let resolvePromise: ((data: TData) => void) | undefined;
  let rejectPromise: ((error: TError) => void) | undefined;

  const action = async (..._args: TArgs) => {
    return new Promise<TData>((res, rej) => {
      resolvePromise = res;
      rejectPromise = rej;
    });
  };

  const flow = new Flow<TData, TError, TArgs>(action);

  return {
    flow,
    resolve: (data: TData) => {
      if (resolvePromise) resolvePromise(data);
    },
    reject: (error: TError) => {
      if (rejectPromise) rejectPromise(error);
    },
  };
}

/**
 * Creates an action wrapper that simulates real-world network conditions.
 * Adds artificial latency, random failures (jitter), and bandwidth constraints.
 * 
 * @example
 * ```ts
 * const flakyAction = simulateJitter(api.fetchUser, {
 *   latency: [200, 800], // random delay between 200ms and 800ms
 *   failureRate: 0.3,    // 30% chance to throw Network Error
 * });
 * ```
 */
export function simulateJitter<TData, TArgs extends any[]>(
  action: (...args: TArgs) => Promise<TData>,
  options: {
    /** Fixed latency or a [min, max] range in milliseconds */
    latency?: number | [number, number];
    /** Probability of a random failure (0.0 to 1.0) */
    failureRate?: number;
    /** The error object to throw on random failure */
    errorObj?: any;
  } = {}
): (...args: TArgs) => Promise<TData> {
  return async (...args: TArgs) => {
    const { latency = 0, failureRate = 0, errorObj = new Error("Simulated Network Jitter Error") } = options;

    if (latency) {
      const ms = Array.isArray(latency) 
        ? Math.floor(Math.random() * (latency[1] - latency[0] + 1)) + latency[0]
        : latency;
      await new Promise(res => setTimeout(res, ms));
    }

    if (failureRate > 0 && Math.random() < failureRate) {
      throw errorObj;
    }

    return action(...args);
  };
}
