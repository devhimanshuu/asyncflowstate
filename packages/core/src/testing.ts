import { Flow } from "./flow";

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

  const action = async (...args: TArgs) => {
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
