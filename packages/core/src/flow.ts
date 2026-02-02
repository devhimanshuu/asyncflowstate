import {
  DEFAULT_RETRY,
  DEFAULT_LOADING,
  DEFAULT_CONCURRENCY,
  PROGRESS,
  BACKOFF_MULTIPLIER,
} from "./constants";
import { getStorage, restoreData, persistData, clearData } from "./storage";

/**
 * Status of the flow.
 * - `idle`: Initial state or after reset.
 * - `loading`: Action is currently executing.
 * - `success`: Action completed successfully.
 * - `error`: Action failed after all retry attempts.
 */
export type FlowStatus = "idle" | "loading" | "success" | "error";

/**
 * Types of events emitted by a Flow instance.
 */
export type FlowEventType =
  | "start"
  | "success"
  | "error"
  | "retry"
  | "cancel"
  | "reset"
  | "progress"
  | "blocked";

/**
 * An event emitted for debugging purposes.
 */
export interface FlowEvent {
  type: FlowEventType;
  flowName: string;
  timestamp: number;
  state: FlowState;
  payload?: any;
}

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
  CIRCUIT_OPEN = "CIRCUIT_OPEN",
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
  /**
   * If true, pauses execution when the network is offline and resumes when online.
   * Only works in browser environments with `navigator.onLine`.
   */
  pauseOffline?: boolean;
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
 * Middleware interface for intercepting flow lifecycle events.
 */
export interface FlowMiddleware<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> {
  onStart?: (args: TArgs) => void;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onSettled?: (data: TData | null, error: TError | null) => void;
}

/**
 * Options for the Circuit Breaker pattern.
 */
export interface CircuitBreakerOptions {
  /** Number of failures allowed before opening the circuit. */
  failureThreshold: number;
  /** Time in milliseconds to wait before attempting to half-open the circuit. */
  resetTimeout: number;
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
  /** Callback fired when a precondition fails */
  onBlocked?: () => void;
  /**
   * Middleware hooks to intercept lifecycle events.
   */
  middleware?: FlowMiddleware<TData, TError, TArgs>[];
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
  /**
   * Optional function to transform raw errors into FlowErrors.
   * Useful for mapping backend error codes to retryable states.
   */
  mapError?: (error: any) => Partial<FlowError<any>>;
  /**
   * Automation for simulated progress updates.
   */
  autoProgress?: {
    /** Duration in milliseconds to reach the target percentage. */
    duration: number;
    /** Target percentage to reach (0-100). */
    end: number;
  };
  /**
   * Unique key to persist success data in storage.
   * If present, data will be restored on initialization.
   */
  persistKey?: string;
  /**
   * Storage type for persistence. Default is 'local'.
   */
  persistStorage?: "local" | "session";
  /**
   * Configuration for Circuit Breaker pattern.
   * If provided, enables circuit breaking for this flow.
   * The scope of the circuit is defined by `dedupKey` or defaults to global if not specific enough (though usually per-key is best).
   * Actually, we should probably add a `scope` or just use `dedupKey`.
   * For now, let's assume it shares state via `dedupKey` if present, or we can add a explicit `circuitBreakerKey`.
   */
  circuitBreaker?: CircuitBreakerOptions;
  /**
   * Unique key to identify the circuit breaker scope.
   * If not provided, it defaults to `dedupKey`.
   */
  circuitBreakerKey?: string;
  /**
   * Configuration for automatic polling.
   */
  polling?: {
    /** Interval in milliseconds between poll attempts. */
    interval: number;
    /** Whether polling is enabled. Default is true if interval is provided. */
    enabled?: boolean;
    /** Optional function to determine when to stop polling based on the result. */
    stopIf?: (data: TData) => boolean;
    /** Optional function to determine if polling should stop on error. Default is true. */
    stopOnError?: boolean;
  };
  /**
   * Configuration for cross-tab synchronization.
   */
  sync?: {
    /** Unique channel name to broadcast state changes to other tabs. */
    channel: string;
    /** Whether to sync loading states (can be noisy). Default: true. */
    syncLoading?: boolean;
  };
  /**
   * Optional name for debugging purposes.
   */
  debugName?: string;
  /**
   * Optional function to determine if the action should be allowed to execute.
   * If it returns false (or a Promise that resolves to false), execute() will
   * be blocked and onBlocked() will be called.
   */
  precondition?: () => boolean | Promise<boolean>;
  /**
   * Key to identify requests for deduplication.
   * If multiple flows with the same dedupKey are executed, they will reuse the same in-flight promise.
   */
  dedupKey?: string;
  /**
   * Time in milliseconds during which a successful result is considered fresh.
   * If valid data exists within this window, execute() will return it immediately
   * without triggering a new network request.
   */
  staleTime?: number;
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
  // --- Debugger Support ---
  private static eventListeners = new Set<(event: FlowEvent) => void>();

  public static onEvent(listener: (event: FlowEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private emit(type: FlowEventType, payload?: any): void {
    const event: FlowEvent = {
      type,
      flowName: this.options.debugName || "Unnamed Flow",
      timestamp: Date.now(),
      state: this.state,
      payload,
    };
    Flow.eventListeners.forEach((l) => l(event));
  }

  // --- Core State ---
  private _state: FlowState<TData, TError> = {
    status: "idle",
    data: null,
    error: null,
    progress: PROGRESS.INITIAL,
  };

  // --- Time-Travel State ---
  private _history: FlowState<TData, TError>[] = [];
  private historyLimit = 50;

  // --- Persistence State ---
  private hasRestoredState = false;

  // --- Subscriptions ---
  private listeners = new Set<(state: FlowState<TData, TError>) => void>();

  // --- External Control ---
  private abortController: AbortController | null = null;

  // --- UX & Performance State ---
  private loadingStartTime: number | null = null;
  private loadingDelayTimer: ReturnType<typeof setTimeout> | null = null;
  private _isDelayingLoading = false;
  private autoResetTimer: ReturnType<typeof setTimeout> | null = null;
  private progressTimer: ReturnType<typeof setTimeout> | null = null;
  private pollingTimer: ReturnType<typeof setTimeout> | null = null;

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

  // --- Middleware ---
  private middlewares: FlowMiddleware<TData, TError, TArgs>[] = [];
  private static globalMiddlewares: FlowMiddleware[] = [];

  // --- Sync State ---
  private bc: BroadcastChannel | null = null;
  private isProcessingSync = false;

  // --- Deduplication State ---
  private static dedupRegistry: Map<string, Promise<any>> = new Map();
  private static cacheRegistry: Map<string, { data: any; timestamp: number }> =
    new Map();
  // --- Circuit Breaker State ---
  // Map<key, { failures: number, lastFailure: number, state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' }>
  private static circuitRegistry: Map<
    string,
    {
      failures: number;
      lastFailure: number;
      state: "CLOSED" | "OPEN" | "HALF_OPEN";
    }
  > = new Map();

  /**
   * Registers a global middleware that applies to ALL Flow instances.
   * @param middleware The middleware to register.
   */
  public static useGlobal(middleware: FlowMiddleware): void {
    Flow.globalMiddlewares.push(middleware);
  }

  /**
   * Registers a middleware for this Flow instance.
   * @param middleware The middleware to register.
   */
  public use(middleware: FlowMiddleware<TData, TError, TArgs>): void {
    this.middlewares.push(middleware);
  }

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
  ) {
    if (options.middleware) {
      this.middlewares.push(...options.middleware);
    }
    if (this.options.persistKey) {
      const storage = getStorage(this.options.persistStorage);
      const data = restoreData<TData>(this.options.persistKey, storage);
      if (data) {
        this._state = {
          ...this._state,
          status: "success",
          data,
          progress: PROGRESS.COMPLETE,
        };
        this.hasRestoredState = true;
      }
    }

    // Initialize Sync
    if (this.options.sync?.channel && typeof BroadcastChannel !== "undefined") {
      this.bc = new BroadcastChannel(this.options.sync.channel);
      this.bc.onmessage = this.handleSyncMessage.bind(this);
    }
  }

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
    if (options.middleware) {
      this.middlewares.push(...options.middleware);
    }
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

  /**
   * Returns the history of state changes (Time-Travel Debugging).
   */
  public get history(): FlowState<TData, TError>[] {
    return this._history;
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
   * Reverts the state to the previous snapshot (Time-Travel Debugging).
   */
  public undo(): void {
    if (this._history.length === 0) return;

    const previous = this._history.pop();
    if (previous) {
      // Restore state without adding to history (it's an undo)
      this._state = previous;
      this.notify();
      this.emit("reset"); // Emit reset or specific undo event? relying on reset for now or state change
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
    this.emit("cancel");
    this.options.onCancel?.();
  }

  /**
   * Starts polling if configured.
   * @param args Arguments to pass to each execute call.
   */
  public startPolling(...args: TArgs): void {
    if (!this.options.polling || this.options.polling.enabled === false) return;
    this.scheduleNextPoll(args);
  }

  /**
   * Stops any active polling.
   */
  public stopPolling(): void {
    this.clearTimer("pollingTimer");
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
    this.emit("reset");

    if (this.options.persistKey) {
      clearData(
        this.options.persistKey,
        getStorage(this.options.persistStorage),
      );
    }
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
    // Check Precondition
    if (this.options.precondition) {
      const allowed = await this.options.precondition();
      if (!allowed) {
        this.emit("blocked");
        this.options.onBlocked?.();
        return undefined;
      }
    }

    const { debounce, throttle } = this.options;

    // 1. Handle Debounce
    if (debounce && debounce > 0) {
      return this.handleDebounce(args, debounce);
    }

    // 2. Handle Throttle
    if (throttle && throttle > 0) {
      return this.handleThrottle(args, throttle);
    }

    // 3. Circuit Breaker Check
    const cbKey = this.options.circuitBreakerKey || this.options.dedupKey;
    if (this.options.circuitBreaker && cbKey) {
      const circuit = Flow.circuitRegistry.get(cbKey);
      if (circuit && circuit.state === "OPEN") {
        const now = Date.now();
        if (
          now - circuit.lastFailure >
          this.options.circuitBreaker.resetTimeout
        ) {
          // Half-Open: Allow one request to pass
          Flow.circuitRegistry.set(cbKey, { ...circuit, state: "HALF_OPEN" });
        } else {
          // Fast fail
          const error: FlowError = {
            type: FlowErrorType.CIRCUIT_OPEN,
            message: `Circuit breaker is open for key: ${cbKey}`,
            originalError: new Error("Circuit Open"),
            isRetryable: false, // Don't retry immediately if circuit is open
          };
          this.setState({ status: "error", error: error as TError });
          this.options.onError?.(error as TError);
          return undefined;
        }
      }
    }

    // 4. Direct Execution
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

    // Deduplication & Cache Check
    if (this.options.dedupKey) {
      const key = this.options.dedupKey;

      // Check Cache
      if (this.options.staleTime && this.options.staleTime > 0) {
        const cached = Flow.cacheRegistry.get(key);
        if (cached && Date.now() - cached.timestamp < this.options.staleTime) {
          // Cache hit - return immediately
          this.setState({
            status: "success",
            data: cached.data,
            progress: PROGRESS.COMPLETE,
          });
          this.options.onSuccess?.(cached.data);
          this.runMiddleware("onSuccess", cached.data);
          this.options.onSettled?.(cached.data, null);
          this.runMiddleware("onSettled", cached.data, null);
          return Promise.resolve(cached.data);
        }
      }

      // Check In-Flight Deduplication
      const pendingPromise = Flow.dedupRegistry.get(key);
      if (pendingPromise) {
        this.setState({ status: "loading", error: null });
        return pendingPromise
          .then((data) => {
            this.setState({
              status: "success",
              data,
              progress: PROGRESS.COMPLETE,
            });
            this.options.onSuccess?.(data);
            this.runMiddleware("onSuccess", data);
            this.options.onSettled?.(data, null);
            this.runMiddleware("onSettled", data, null);
            return data;
          })
          .catch((error) => {
            this.setState({ status: "error", error });
            this.options.onError?.(error);
            this.runMiddleware("onError", error);
            this.options.onSettled?.(null, error);
            this.runMiddleware("onSettled", null, error);
            throw error;
          });
      }
    }

    // Fire onStart lifecycle hook
    this.emit("start", { args });
    this.options.onStart?.(args);
    this.runMiddleware("onStart", args);

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

      // Check if it's a function
      if (typeof optimisticConfig === "function") {
        optimisticData = (
          optimisticConfig as (prevData: TData | null, args: TArgs) => TData
        )(this._state.data, args);
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
          // Start auto-progress when delay finishes
          this.startAutoProgress();
          this.notify();
        }, delay);
      } else {
        // Start auto-progress if no delay or delay is 0
        this.startAutoProgress();
      }
    }

    const promise = this.runAction(args, currentSignal);

    // Register for deduplication
    if (this.options.dedupKey) {
      Flow.dedupRegistry.set(
        this.options.dedupKey,
        promise
          .then((data) => {
            // Optimization: Update cache on success
            if (data !== undefined && this.options.dedupKey) {
              Flow.cacheRegistry.set(this.options.dedupKey, {
                data,
                timestamp: Date.now(),
              });
            }
            return data;
          })
          .finally(() => {
            // Cleanup registry
            if (this.options.dedupKey) {
              Flow.dedupRegistry.delete(this.options.dedupKey);
            }
          }),
      );
    }

    return promise;
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
    const cbKey = this.options.circuitBreakerKey || this.options.dedupKey;
    let attempt = 0;
    const maxAttempts =
      this.options.retry?.maxAttempts ?? DEFAULT_RETRY.MAX_ATTEMPTS;

    while (attempt < maxAttempts) {
      // Offline Pause Logic
      if (
        this.options.retry?.pauseOffline &&
        typeof navigator !== "undefined" &&
        !navigator.onLine
      ) {
        // Wait for online event
        await new Promise<void>((resolve) => {
          const target = typeof window !== "undefined" ? window : self;
          const handler = () => {
            target.removeEventListener("online", handler);
            resolve();
          };
          target.addEventListener("online", handler);

          // If aborted while waiting, resolve to let the loop handle it
          signal.addEventListener("abort", () => {
            target.removeEventListener("online", handler);
            resolve();
          });
        });
      }

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
          this.runMiddleware("onError", timeoutError);
          this.finalizeLoading();
          this.processEnqueuedTasks();

          // Update Circuit Breaker on timeout failure (treated as failure)
          if (this.options.circuitBreaker && cbKey) {
            const current = Flow.circuitRegistry.get(cbKey) || {
              failures: 0,
              lastFailure: 0,
              state: "CLOSED",
            };
            const newFailures = current.failures + 1;
            const newState =
              newFailures >= this.options.circuitBreaker.failureThreshold
                ? "OPEN"
                : "CLOSED";
            Flow.circuitRegistry.set(cbKey, {
              failures: newFailures,
              lastFailure: Date.now(),
              state: newState,
            });
          }
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
        this.runMiddleware("onSuccess", data);
        this.options.onSettled?.(data, null);
        this.runMiddleware("onSettled", data, null);

        // Clear snapshot on successful completion
        this.previousDataSnapshot = null;

        this.finalizeLoading();
        this.scheduleAutoReset();
        this.processEnqueuedTasks();

        // Handle Polling
        if (
          this.options.polling?.enabled !== false &&
          this.options.polling?.interval
        ) {
          const shouldStop = this.options.polling.stopIf?.(data);
          if (!shouldStop) {
            this.scheduleNextPoll(args);
          }
        }

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
          this.runMiddleware("onError", timeoutError);
          this.options.onSettled?.(null, timeoutError);
          this.runMiddleware("onSettled", null, timeoutError);
          this.finalizeLoading();
          this.processEnqueuedTasks();

          // Handle polling stop on error
          if (this.options.polling?.stopOnError !== false) {
            this.stopPolling();
          }
          return;
        }

        if (signal.aborted) return;

        const finalError = error as TError;
        let retryOverride: boolean | undefined;

        // Apply Smart Error Mapping
        if (this.options.mapError) {
          try {
            const mapped = this.options.mapError(error);
            // If the user wants to return a transformed error object (e.g. FlowError),
            // we can structurally merge or replace.
            // For safety with TError, we'll assume the user might want to attach props to the original error
            // or return a completely new object that typically satisfies TError.
            if (mapped) {
              // We'll trust the user if they're replacing the error, or just attaching metadata.
              // If mapped is an object, we can try to use it as the new error.
              // Note: This relies on runtime behavior.
              Object.assign(finalError as object, mapped);
              // Or if valid replacement: finalError = { ...finalError, ...mapped };

              if (mapped.isRetryable !== undefined) {
                retryOverride = mapped.isRetryable;
              }
            }
          } catch (e) {
            console.error("Flow: mapError threw an error", e);
          }
        }

        const shouldRetry =
          retryOverride !== undefined
            ? retryOverride && attempt < maxAttempts
            : await this.evaluateRetry(finalError, attempt);

        if (!shouldRetry) {
          await this.waitMinDuration();

          // Handle rollback for optimistic updates
          const shouldRollback =
            this.options.rollbackOnError !== false &&
            this.previousDataSnapshot !== undefined;

          this.setState({
            status: "error",
            data: shouldRollback ? this.previousDataSnapshot : this._state.data,
            error: finalError,
            progress: PROGRESS.INITIAL,
          });

          // Update Circuit Breaker on failure
          if (this.options.circuitBreaker && cbKey) {
            const current = Flow.circuitRegistry.get(cbKey) || {
              failures: 0,
              lastFailure: 0,
              state: "CLOSED",
            };

            // If we were HALF_OPEN and failed, go back to OPEN
            if (current.state === "HALF_OPEN") {
              Flow.circuitRegistry.set(cbKey, {
                failures: current.failures + 1,
                lastFailure: Date.now(),
                state: "OPEN",
              });
            } else {
              // Normal CLOSED state failure count
              const newFailures = current.failures + 1;
              const newState =
                newFailures >= this.options.circuitBreaker.failureThreshold
                  ? "OPEN"
                  : "CLOSED";
              Flow.circuitRegistry.set(cbKey, {
                failures: newFailures,
                lastFailure: Date.now(),
                state: newState,
              });
            }
          }

          // Clear snapshot after rollback
          if (shouldRollback) {
            this.previousDataSnapshot = null;
          }

          this.options.onError?.(finalError);
          this.runMiddleware("onError", finalError);
          this.options.onSettled?.(null, finalError);
          this.runMiddleware("onSettled", null, finalError);

          this.finalizeLoading();
          this.processEnqueuedTasks();

          // Handle polling stop on error
          if (this.options.polling?.stopOnError !== false) {
            this.stopPolling();
          }
          return;
        }

        // Fire onRetry lifecycle hook
        this.emit("retry", { attempt, maxAttempts, error: finalError });
        this.options.onRetry?.(finalError, attempt, maxAttempts);
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

  private scheduleNextPoll(args: TArgs): void {
    this.clearTimer("pollingTimer");
    const interval = this.options.polling?.interval;
    if (interval && interval > 0) {
      this.pollingTimer = setTimeout(() => {
        this.internalExecute(args);
      }, interval);
    }
  }

  private startAutoProgress(): void {
    if (!this.options.autoProgress || this._state.status !== "loading") return;

    const { duration, end } = this.options.autoProgress;
    // Update roughly every 50ms for smoothness
    const interval = 50;
    const steps = duration / interval;
    const increment = end / steps;

    let current = this.progress;

    this.clearTimer("progressTimer");
    this.progressTimer = setInterval(() => {
      // Safety check: stop if we are no longer loading
      if (this._state.status !== "loading") {
        this.clearTimer("progressTimer");
        return;
      }

      current += increment;
      if (current >= end) {
        current = end;
        this.clearTimer("progressTimer");
      }

      // Update state directly to avoid re-triggering logic in setProgress public method
      // but ensure we notify listeners
      this.setState({ progress: Math.min(Math.max(current, 0), 100) });
    }, interval);
  }

  private runMiddleware(hook: keyof FlowMiddleware, ...args: any[]): void {
    const allMiddlewares = [...Flow.globalMiddlewares, ...this.middlewares];

    allMiddlewares.forEach((mw) => {
      const fn = mw[hook];
      if (typeof fn === "function") {
        try {
          (fn as Function)(...args);
        } catch (err) {
          console.error(`Flow: Middleware error in ${hook}`, err);
        }
      }
    });
  }

  private handleSyncMessage(event: MessageEvent): void {
    if (!event.data || typeof event.data !== "object") return;
    const { type, state } = event.data;

    // Only accept state sync messages
    if (type !== "FLOW_SYNC" || !state) return;

    this.isProcessingSync = true;
    this.setState({
      ...state,
      // Ensure we don't sync functions or sensitive internal state accidentally if they existed
      status: state.status,
      data: state.data,
      error: state.error,
      progress: state.progress,
    });
    this.isProcessingSync = false;
  }

  // --- Maintenance Helpers ---

  private setState(updates: Partial<FlowState<TData, TError>>): void {
    // Record history before updating
    // We only record significant state changes, ignoring pure progress updates to avoid spamming history
    if (!updates.progress || Object.keys(updates).length > 1) {
      this._history.push({ ...this._state });
      if (this._history.length > this.historyLimit) {
        this._history.shift();
      }
    }

    this._state = { ...this._state, ...updates };

    // Handle persistence on success
    if (
      this.options.persistKey &&
      updates.status === "success" &&
      this._state.data !== null &&
      this._state.data !== undefined
    ) {
      persistData(
        this.options.persistKey,
        this._state.data,
        getStorage(this.options.persistStorage),
      );
    }

    this.notify();
    this.emit(
      updates.status === "loading" ? "progress" : (updates.status as any),
    );

    // Sync across tabs
    if (this.bc && !this.isProcessingSync) {
      // Avoid syncing high-frequency loading updates if disabled
      if (
        updates.status === "loading" &&
        this.options.sync?.syncLoading === false
      ) {
        return;
      }

      this.bc.postMessage({
        type: "FLOW_SYNC",
        state: this._state,
      });
    }
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
      | "timeoutTimer"
      | "progressTimer"
      | "pollingTimer",
  ): void {
    const timer = this[key];
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer as any); // Handle both timeout and interval
      (this as any)[key] = null;
    }
  }

  private clearAllTimers(): void {
    this.clearTimer("loadingDelayTimer");
    this.clearTimer("autoResetTimer");
    this.clearTimer("debounceTimer");
    this.clearTimer("throttleTimer");
    this.clearTimer("timeoutTimer");
    this.clearTimer("progressTimer");
    this.clearTimer("pollingTimer");
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
