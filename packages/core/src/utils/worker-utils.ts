/**
 * Utilities for offloading heavy operations to Web Workers.
 */

export interface WorkerOptions {
  /** Map of environment variables or global constants to inject into the worker. */
  env?: Record<string, any>;
  /** Optional script to initialize the worker environment. */
  setupScript?: string;
}

/**
 * Wraps an async function to execute it in a dedicated Web Worker.
 * Automatically handles serialization and clean up.
 * 
 * @param action The function to execute in the worker. Note: Must be self-contained (no closures).
 * @returns An async function that proxies to the worker.
 */
export function createWorkerAction<TData, TArgs extends any[]>(
  action: (...args: TArgs) => TData | Promise<TData>
): (...args: TArgs) => Promise<TData> {
  const actionSource = action.toString();
  
  const workerBlob = new Blob([`
    self.onmessage = async (e) => {
      const { args, actionSource } = e.data;
      try {
        const fn = new Function('return ' + actionSource)();
        const result = await fn(...args);
        self.postMessage({ type: 'SUCCESS', result });
      } catch (error) {
        self.postMessage({ 
          type: 'ERROR', 
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        });
      }
    };
  `], { type: 'application/javascript' });

  return (...args: TArgs): Promise<TData> => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(URL.createObjectURL(workerBlob));
      
      worker.onmessage = (e) => {
        const { type, result, error } = e.data;
        if (type === 'SUCCESS') {
          resolve(result);
        } else {
          const err = new Error(error.message);
          err.name = error.name;
          err.stack = error.stack;
          reject(err);
        }
        worker.terminate();
      };

      worker.onerror = (e) => {
        reject(new Error(e.message));
        worker.terminate();
      };

      worker.postMessage({ args, actionSource });
    });
  };
}
