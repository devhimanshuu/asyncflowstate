import {
  DEFAULT_RETRY,
  DEFAULT_LOADING,
  DEFAULT_CONCURRENCY,
  PROGRESS,
  BACKOFF_MULTIPLIER,
} from "./constants";

/**
 * Status of the flow.
 * - `idle`: Initial state or after reset.
 * - `loading`: Action is currently executing.
 * - `success`: Action completed successfully.
 * - `error`: Action failed after all retry attempts.
 */
export type FlowStatus = "idle" | "loading" | "success" | "error";

/**
 * The internal state of a Flow instance.
 */
export interface FlowState<TData = any, TError = any> {
  /** Current status of the flow */
  status: FlowStatus;
  /** The data returned by the last successful action execution */
  data: TData | null;
  /** The error object thrown by the last failed action execution */
  error: TError | null;
  /** Progress of the current operation (0-100) */
  progress?: number;
}

/**
 * Categorization of errors to help automate UI feedback and retry logic.
 */
export enum FlowErrorType {
  NETWORK = "NETWORK",
  TIMEOUT = "TIMEOUT",
  VALIDATION = "VALIDATION",
  PERMISSION = "PERMISSION",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

/**
 * Enhanced error object with metadata.
 */
export interface FlowError<TError = any> {
  type: FlowErrorType;
  message: string;
  originalError: TError;
  /** Whether this error is considered transient and safe to retry. */
  isRetryable: boolean;
}

/**
 * An asynchronous action that can be executed by a Flow.
 */
export type FlowAction<TData, TArgs extends any[]> = (
  ...args: TArgs
) => Promise<TData>;

/**
 * Options for automatic retry logic.
 */
export interface RetryOptions {
  /** Maximum number of attempts to try the action. Default is 1 (no retry). */
  maxAttempts?: number;
  /** Delay between retries in milliseconds. Default is 1000. */
  delay?: number;
  /** Backoff strategy to use for retries. Default is 'fixed'. */
  backoff?: "fixed" | "linear" | "exponential";
  /** Optional callback to determine if a specific error should trigger a retry. */
  shouldRetry?: (error: any, attempt: number) => boolean | Promise<boolean>;
}

/**
 * Options for automatically resetting the flow state back to 'idle'.
 */
export interface AutoResetOptions {
  /** Whether auto-reset is enabled. Default is true if delay is provided. */
  enabled?: boolean;
  /** Time in milliseconds to wait after a success before resetting. */
  delay?: number;
}

/**
 * UX options for managing loading state visibility.
 */
export interface LoadingOptions {
  /** Minimum time in ms to stay in 'loading' state, preventing UI flashes for fast actions. */
  minDuration?: number;
  /** Delay in ms before switching to 'loading' status, preventing spinners for near-instant actions. */
  delay?: number;
}

/**
 * Configuration options for a Flow instance.
 */
export interface FlowOptions<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> {
  /** Callback fired when the action starts executing */
  onStart?: (args: TArgs) => void;
  /** Callback fired on successful execution */
  onSuccess?: (data: TData) => void;
  /** Callback fired on terminal error after retries */
  onError?: (error: TError) => void;
  /** Callback fired on every retry attempt */
  onRetry?: (error: TError, attempt: number, maxAttempts: number) => void;
  /** Callback fired when cancel() is called */
  onCancel?: () => void;
  /** Callback fired after either success or error (like finally) */
  onSettled?: (data: TData | null, error: TError | null) => void;
  /** Configuration for automatic retries */
  retry?: RetryOptions;
  /** Configuration for automatic state reset after success */
  autoReset?: AutoResetOptions;
  /** Options for controlling loading state perceived performance */
  loading?: LoadingOptions;
  /**
   * Concurrency strategy when execute() is called while already loading.
   * - `keep`: Ignore the new request and keep the current one (default).
   * - `restart`: Cancel the current request and start the new one.
   * - `enqueue`: Queue the request and execute it after the current one finishes.
   */
  concurrency?: "keep" | "restart" | "enqueue";
  /**
   * If provided, calls to execute() will be debounced by this many milliseconds.
   */
  debounce?: number;
  /**
   * If provided, calls to execute() will be throttled by this many milliseconds.
   */
  throttle?: number;
  /**
   * Maximum time in milliseconds to wait for the action to complete.
   * If the action exceeds this time, it will be automatically cancelled
   * and the flow will transition to an error state with FlowErrorType.TIMEOUT.
   *
   * @example
   * ```ts
   * timeout: 5000 // Cancel after 5 seconds
   * ```
   */
  timeout?: number;
  /**
   * Optimistic update configuration.
   * - Static value: Immediately set this as the result
   * - Function: Calculate optimistic result from previous data and arguments
   *
   * @example Static optimistic result
   * ```ts
   * optimisticResult: { status: 'pending', id: '123' }
   * ```
   *
   * @example Dynamic optimistic result
   * ```ts
   * optimisticResult: (prevData, [itemId, quantity]) => ({
   *   ...prevData,
   *   items: prevData.items.map(item =>
   *     item.id === itemId ? { ...item, quantity } : item
   *   )
   * })
   * ```
   */
  optimisticResult?: TData | ((prevData: TData | null, args: TArgs) => TData);
  /**
   * Whether to automatically rollback optimistic updates on error.
   * Default: true
   *
   * @example
   * ```ts
   * rollbackOnError: true // Automatically revert to previous data on error
   * ```
   */
  rollbackOnError?: boolean;
}

/**
 * Flow is the core engine for orchestrating asynchronous actions and their UI states.
 * It manages loading, success/error data, retries, concurrency, and optimistic updates.
 *
 * Designed to be framework-agnostic, it can be used in any JavaScript environment.
 *
 * @template TData - The type of data returned by successful action execution
 * @template TError - The type of error object thrown on failure
 * @template TArgs - The tuple type of arguments passed to the action
 *
 * @example Basic usage
 * ```ts
 * const flow = new Flow(async (id: string) => {
 *   return await api.fetchUser(id);
 * });
 *
 * flow.subscribe((state) => {
 *   console.log('Status:', state.status);
 * });
 *
 * await flow.execute('user-123');
 * console.log(flow.data); // User data
 * ```
 *
 * @example With retry configuration
 * ```ts
 * const flow = new Flow(saveData, {
 *   retry: {
 *     maxAttempts: 3,
 *     delay: 1000,
 *     backoff: 'exponential'
 *   },
 *   onSuccess: (data) => console.log('Saved!', data),
 *   onError: (err) => console.error('Failed:', err)
 * });
 * ```
 *
 * @example Optimistic UI updates
 * ```ts
 * const flow = new Flow(updateProfile, {
 *   optimisticResult: { name: 'New Name', id: '123' },
 *   onError: () => alert('Update failed, reverting...')
 * });
 * ```
 *
 * @example Dynamic optimistic updates with rollback
 * ```ts
 * const flow = new Flow(likePost, {
 *   optimisticResult: (prevData, [postId]) => ({
 *     ...prevData,
 *     likes: prevData.likes + 1,
 *     isLiked: true
 *   }),
 *   rollbackOnError: true,
 *   onError: () => toast.error('Like failed, changes reverted')
 * });
 * ```
 *
 * @example Timeout handling
 * ```ts
 * const flow = new Flow(fetchDataFromSlowAPI, {
 *   timeout: 5000, // Cancel after 5 seconds
 *   onError: (error) => {
 *     if (error.type === FlowErrorType.TIMEOUT) {
 *       toast.error('Request timed out, please try again');
 *     }
 *   }
 * });
 * ```
 */
export class Flow<TData = any, TError = any, TArgs extends any[] = any[]> {
  // --- Core State ---
  private _state: FlowState<TData, TError> = {
    status: "idle",
    data: null,
    error: null,
    progress: PROGRESS.INITIAL,
  };

  // --- Subscriptions ---
  private listeners = new Set<(state: FlowState<TData, TError>) => void>();

  // --- External Control ---
  private abortController: AbortController | null = null;

  // --- UX & Performance State ---
  private loadingStartTime: number | null = null;
  private loadingDelayTimer: ReturnType<typeof setTimeout> | null = null;
  private _isDelayingLoading = false;
  private autoResetTimer: ReturnType<typeof setTimeout> | null = null;

  // --- Concurrency Management ---
  private queue: {
    args: TArgs;
    resolve: (data: TData | undefined) => void;
  }[] = [];
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastExecutedTime = 0;
  private throttleTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingThrottleArgs: TArgs | null = null;
  private pendingThrottleResolvers: ((data: TData | undefined) => void)[] = [];

  // --- Optimistic Update Management ---
  private previousDataSnapshot: TData | null = null;

  // --- Timeout Management ---
  private timeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private isTimeout = false;

  /**
   * Creates a new Flow instance.
   *
   * @param action The asynchronous function to manage.
   * @param options Configuration for the flow's behavior.
   *
   * @example
   * ```ts
   * const flow = new Flow(
   *   async (email: string) => api.subscribe(email),
   *   { onSuccess: () => toast.success('Subscribed!') }
   * );
   * ```
   */
  constructor(
    private action: FlowAction<TData, TArgs>,
    private options: FlowOptions<TData, TError, TArgs> = {},
  ) {}

  /**
   * Updates the flow options at runtime.
   *
   * @param options New options to merge with existing configuration
   *
   * @example
   * ```ts
   * const flow = new Flow(uploadFile);
   * // Later, update retry strategy
   * flow.setOptions({
   *   retry: { maxAttempts: 5, backoff: 'exponential' }
   * });
   * ```
   */
  public setOptions(options: FlowOptions<TData, TError, TArgs>): void {
    this.options = { ...this.options, ...options };
  }

  // --- Getters ---

  /** The current state of the flow. */
  public get state(): FlowState<TData, TError> {
    return { ...this._state };
  }

  /** The current execution status. */
  public get status(): FlowStatus {
    return this._state.status;
  }

  /** The data from the last successful execution. */
  public get data(): TData | null {
    return this._state.data;
  }

  /** The error from the last failed execution. */
  public get error(): TError | null {
    return this._state.error;
  }

  /**
   * Returns true if the flow is currently loading.
   * Note: Respects loading.delay - if a delay is active, this returns false.
   */
  public get isLoading(): boolean {
    return this._state.status === "loading" && !this._isDelayingLoading;
  }

  /** Returns true if the flow completed successfully. */
  public get isSuccess(): boolean {
    return this._state.status === "success";
  }

  /** Returns true if the flow is in an error state. */
  public get isError(): boolean {
    return this._state.status === "error";
  }

  /** The current progress (0-100). */
  public get progress(): number {
    return this._state.progress ?? 0;
  }

  // --- Public Methods ---

  /**
   * Manually sets the progress value. Only effective while loading.
   * @param progress Progress percentage (0-100).
   * @example
   * ```ts
   * const flow = new Flow(uploadFile);
   * flow.setProgress(50); // Sets progress to 50%
   * ```
   */
  public setProgress(progress: number): void {
    if (this._state.status === "loading") {
      this.setState({
        progress: Math.min(PROGRESS.MAX, Math.max(PROGRESS.MIN, progress)),
      });
    }
  }

  /**
   * Subscribes to state changes.
   *
   * @param listener Callback fired whenever state changes.
   * @returns Unsubscribe function to remove the listener.
   *
   * @example
   * ```ts
   * const flow = new Flow(fetchData);
   * const unsubscribe = flow.subscribe((state) => {
   *   console.log('Status:', state.status);
   *   console.log('Data:', state.data);
   * });
   *
   * // Later, cleanup
   * unsubscribe();
   * ```
   */
  public subscribe(
    listener: (state: FlowState<TData, TError>) => void,
  ): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Cancels the currently running action and resets state to idle.
   * @example
   * ```ts
   * const flow = new Flow(longRunningTask);
   * flow.execute();
   * // Later, cancel if needed
   * flow.cancel();
   * ```
   */
  public cancel(): void {
    this.clearAllTimers();
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.setState({ status: "idle", error: null, progress: PROGRESS.INITIAL });
    this.options.onCancel?.();
  }

  /**
   * Resets the flow state back to initial 'idle' state.
   * @example
   * ```ts
   * const flow = new Flow(submitForm);
   * // After success, reset manually
   * flow.reset();
   * ```
   */
  public reset(): void {
    this.clearAllTimers();
    this.setState({
      status: "idle",
      data: null,
      error: null,
      progress: PROGRESS.INITIAL,
    });
  }

  /**
   * Executes the action with the provided arguments.
   * Handles debounce, throttle, and concurrency logic before execution.
   *
   * @param args Arguments to pass to the action function
   * @returns Promise resolving to the action result, or undefined if cancelled/debounced
   *
   * @example Basic execution
   * ```ts
   * const flow = new Flow(async (name: string) => api.save(name));
   * const result = await flow.execute('John');
   * ```
   *
   * @example With debouncing
   * ```ts
   * const flow = new Flow(searchAPI, { debounce: 300 });
   * // Only the last call within 300ms will execute
   * flow.execute('hello');
   * flow.execute('hello world'); // This one executes
   * ```
   *
   * @example Handling concurrency
   * ```ts
   * const flow = new Flow(saveData, { concurrency: 'restart' });
   * flow.execute(data1); // Will be cancelled
   * flow.execute(data2); // This one completes
   * ```
   */
  public async execute(...args: TArgs): Promise<TData | undefined> {
    const { debounce, throttle } = this.options;

    // 1. Handle Debounce
    if (debounce && debounce > 0) {
      return this.handleDebounce(args, debounce);
    }

    // 2. Handle Throttle
    if (throttle && throttle > 0) {
      return this.handleThrottle(args, throttle);
    }

    // 3. Direct Execution
    return this.internalExecute(args);
  }

  // --- Private Internal Logic ---

  /**
   * Core execution logic that handles concurrency strategies.
   * @private
   * @param args Arguments to pass to the action
   * @returns Promise that resolves with the action result
   */
  private internalExecute(args: TArgs): Promise<TData | undefined> {
    const { concurrency = DEFAULT_CONCURRENCY } = this.options;

    if (this._state.status === "loading") {
      switch (concurrency) {
        case "keep":
          return Promise.resolve(undefined);
        case "restart":
          this.cancel();
          break;
        case "enqueue":
          return new Promise((resolve) => {
            this.queue.push({ args, resolve });
          });
      }
    }

    this.abortController = new AbortController();
    const currentSignal = this.abortController.signal;

    // Fire onStart lifecycle hook
    this.options.onStart?.(args);

    // Set up timeout if configured
    if (this.options.timeout && this.options.timeout > 0) {
      this.isTimeout = false;
      this.timeoutTimer = setTimeout(() => {
        if (this.abortController) {
          this.isTimeout = true;
          this.abortController.abort();
          // The runAction method will handle the aborted signal
        }
      }, this.options.timeout);
    }

    // Optimistic Update Handling
    if (this.options.optimisticResult !== undefined) {
      // Store previous data for potential rollback
      this.previousDataSnapshot = this._state.data;

      // Calculate optimistic data (static or dynamic)
      let optimisticData: TData;
      const optimisticConfig = this.options.optimisticResult;

      // Check if it's a function by verifying it's callable
      if (
        typeof optimisticConfig === "function" &&
        "call" in optimisticConfig
      ) {
        // It's a function - call it with prevData and args
        optimisticData = (optimisticConfig as Function)(
          this._state.data,
          args,
        ) as TData;
      } else {
        // It's a static value
        optimisticData = optimisticConfig as TData;
      }

      this.setState({
        status: "success",
        data: optimisticData,
        error: null,
        progress: PROGRESS.INITIAL,
      });
    } else {
      this.loadingStartTime = Date.now();
      this.setState({
        status: "loading",
        error: null,
        progress: PROGRESS.INITIAL,
      });

      // Handle UX Loading Delay
      const delay = this.options.loading?.delay ?? DEFAULT_LOADING.DELAY;
      if (delay > 0) {
        this._isDelayingLoading = true;
        this.loadingDelayTimer = setTimeout(() => {
          this._isDelayingLoading = false;
          this.notify();
        }, delay);
      }
    }

    return this.runAction(args, currentSignal);
  }

  /**
   * Performs the actual asynchronous action with retry logic.
   * @private
   * @param args Arguments for the action
   * @param signal AbortSignal for cancellation
   * @returns Promise that resolves with the action result
   */
  private async runAction(
    args: TArgs,
    signal: AbortSignal,
  ): Promise<TData | undefined> {
    let attempt = 0;
    const maxAttempts =
      this.options.retry?.maxAttempts ?? DEFAULT_RETRY.MAX_ATTEMPTS;

    while (attempt < maxAttempts) {
      if (signal.aborted) {
        // Check if this was a timeout abort
        if (this.isTimeout) {
          // Timeout occurred - create timeout error
          const timeoutError = this.createTimeoutError() as TError;
          await this.waitMinDuration();

          // Handle rollback for optimistic updates
          const shouldRollback =
            this.options.rollbackOnError !== false &&
            this.previousDataSnapshot !== undefined;

          this.setState({
            status: "error",
            data: shouldRollback ? this.previousDataSnapshot : this._state.data,
            error: timeoutError,
            progress: PROGRESS.INITIAL,
          });

          if (shouldRollback) {
            this.previousDataSnapshot = null;
          }

          this.options.onError?.(timeoutError);
          this.finalizeLoading();
          this.processEnqueuedTasks();
        }
        return;
      }

      attempt++;
      try {
        // Race the action against abort signal
        const data = await Promise.race([
          this.action(...args),
          new Promise<never>((_, reject) => {
            if (signal.aborted) {
              reject(new Error("Aborted"));
            }
            signal.addEventListener("abort", () => {
              reject(new Error("Aborted"));
            });
          }),
        ]);

        if (signal.aborted) return;

        // Ensure minimum duration for UX if configured
        await this.waitMinDuration();

        // Clear timeout timer on success
        this.clearTimer("timeoutTimer");

        this.setState({ status: "success", data, progress: PROGRESS.COMPLETE });
        this.options.onSuccess?.(data);
        this.options.onSettled?.(data, null);

        // Clear snapshot on successful completion
        this.previousDataSnapshot = null;

        this.finalizeLoading();
        this.scheduleAutoReset();
        this.processEnqueuedTasks();

        return data;
      } catch (error) {
        // Check if this was a timeout abort
        if (signal.aborted && this.isTimeout) {
          const timeoutError = this.createTimeoutError() as TError;
          await this.waitMinDuration();

          // Handle rollback for optimistic updates
          const shouldRollback =
            this.options.rollbackOnError !== false &&
            this.previousDataSnapshot !== undefined;

          this.setState({
            status: "error",
            data: shouldRollback ? this.previousDataSnapshot : this._state.data,
            error: timeoutError,
            progress: PROGRESS.INITIAL,
          });

          if (shouldRollback) {
            this.previousDataSnapshot = null;
          }

          this.options.onError?.(timeoutError);
          this.options.onSettled?.(null, timeoutError);
          this.finalizeLoading();
          this.processEnqueuedTasks();
          return;
        }

        if (signal.aborted) return;

        const typedError = error as TError;
        const shouldRetry = await this.evaluateRetry(typedError, attempt);

        if (!shouldRetry) {
          await this.waitMinDuration();

          // Handle rollback for optimistic updates
          const shouldRollback =
            this.options.rollbackOnError !== false &&
            this.previousDataSnapshot !== undefined;

          this.setState({
            status: "error",
            data: shouldRollback ? this.previousDataSnapshot : this._state.data,
            error: typedError,
            progress: PROGRESS.INITIAL,
          });

          // Clear snapshot after rollback
          if (shouldRollback) {
            this.previousDataSnapshot = null;
          }

          this.options.onError?.(typedError);
          this.options.onSettled?.(null, typedError);

          this.finalizeLoading();
          this.processEnqueuedTasks();
          return;
        }

        // Fire onRetry lifecycle hook
        this.options.onRetry?.(typedError, attempt, maxAttempts);
        await this.delayRetry(attempt);
      }
    }
  }

  // --- Concurrency Helpers ---

  private handleDebounce(
    args: TArgs,
    delay: number,
  ): Promise<TData | undefined> {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    return new Promise((resolve) => {
      this.debounceTimer = setTimeout(() => {
        this.debounceTimer = null;
        this.internalExecute(args).then(resolve);
      }, delay);
    });
  }

  private handleThrottle(
    args: TArgs,
    delay: number,
  ): Promise<TData | undefined> {
    const now = Date.now();
    const remaining = delay - (now - this.lastExecutedTime);

    if (remaining <= 0) {
      this.lastExecutedTime = now;
      return this.internalExecute(args);
    }

    this.pendingThrottleArgs = args;
    const promise = new Promise<TData | undefined>((resolve) => {
      this.pendingThrottleResolvers.push(resolve);
    });

    if (!this.throttleTimer) {
      this.throttleTimer = setTimeout(() => {
        this.throttleTimer = null;
        this.lastExecutedTime = Date.now();

        const argsToUse = this.pendingThrottleArgs!;
        const resolvers = [...this.pendingThrottleResolvers];

        this.pendingThrottleArgs = null;
        this.pendingThrottleResolvers = [];

        this.internalExecute(argsToUse).then((result) => {
          resolvers.forEach((res) => res(result));
        });
      }, remaining);
    }

    return promise;
  }

  private processEnqueuedTasks(): void {
    if (this.queue.length > 0 && this._state.status !== "loading") {
      const { args, resolve } = this.queue.shift()!;
      this.internalExecute(args).then(resolve);
    }
  }

  // --- Retry Helpers ---

  /**
   * Evaluates whether a retry should be attempted.
   * @private
   * @param error The error that occurred
   * @param attempt Current attempt number
   * @returns Promise that resolves to true if retry should happen
   */
  private async evaluateRetry(
    error: TError,
    attempt: number,
  ): Promise<boolean> {
    const maxAttempts =
      this.options.retry?.maxAttempts ?? DEFAULT_RETRY.MAX_ATTEMPTS;
    if (attempt >= maxAttempts) {
      return false;
    }

    if (this.options.retry?.shouldRetry) {
      return this.options.retry.shouldRetry(error, attempt);
    }

    return true;
  }

  /**
   * Delays execution for retry with backoff strategy.
   * @private
   * @param attempt Current attempt number
   */
  private async delayRetry(attempt: number): Promise<void> {
    const delay = this.options.retry?.delay ?? DEFAULT_RETRY.DELAY;
    const backoff = this.options.retry?.backoff ?? DEFAULT_RETRY.BACKOFF;

    let waitTime = delay;
    if (backoff === "linear") {
      waitTime = delay * attempt * BACKOFF_MULTIPLIER.LINEAR;
    } else if (backoff === "exponential") {
      waitTime =
        delay * Math.pow(BACKOFF_MULTIPLIER.EXPONENTIAL_BASE, attempt - 1);
    }

    return new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  // --- UX Helpers ---

  /**
   * Waits for minimum loading duration if configured.
   * @private
   */
  private async waitMinDuration(): Promise<void> {
    const minDuration =
      this.options.loading?.minDuration ?? DEFAULT_LOADING.MIN_DURATION;
    if (minDuration > 0 && this.loadingStartTime) {
      const elapsed = Date.now() - this.loadingStartTime;
      const remaining = minDuration - elapsed;
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
    }
  }

  private scheduleAutoReset(): void {
    this.clearTimer("autoResetTimer");
    const options = this.options.autoReset;
    if (options?.enabled !== false && options?.delay && options.delay > 0) {
      this.autoResetTimer = setTimeout(() => {
        if (this._state.status === "success") {
          this.reset();
        }
      }, options.delay);
    }
  }

  // --- Maintenance Helpers ---

  private setState(updates: Partial<FlowState<TData, TError>>): void {
    this._state = { ...this._state, ...updates };
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener({ ...this._state }));
  }

  private finalizeLoading(): void {
    this.abortController = null;
    this.clearTimer("loadingDelayTimer");
    this.clearTimer("timeoutTimer");
    this._isDelayingLoading = false;
  }

  private clearTimer(
    key:
      | "loadingDelayTimer"
      | "autoResetTimer"
      | "debounceTimer"
      | "throttleTimer"
      | "timeoutTimer",
  ): void {
    const timer = this[key];
    if (timer) {
      clearTimeout(timer);
      (this as any)[key] = null;
    }
  }

  private clearAllTimers(): void {
    this.clearTimer("loadingDelayTimer");
    this.clearTimer("autoResetTimer");
    this.clearTimer("debounceTimer");
    this.clearTimer("throttleTimer");
    this.clearTimer("timeoutTimer");
    this._isDelayingLoading = false;
    this.isTimeout = false;
  }

  /**
   * Creates a timeout error with FlowErrorType.TIMEOUT.
   * @private
   * @returns Timeout error object
   */
  private createTimeoutError(): FlowError {
    return {
      type: FlowErrorType.TIMEOUT,
      message: `Action timed out after ${this.options.timeout}ms`,
      originalError: new Error("Timeout"),
      isRetryable: true,
    };
  }
}
