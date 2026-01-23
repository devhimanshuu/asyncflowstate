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
export interface FlowOptions<TData = any, TError = any> {
  /** Callback fired on successful execution */
  onSuccess?: (data: TData) => void;
  /** Callback fired on terminal error after retries */
  onError?: (error: TError) => void;
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
   */
  concurrency?: "keep" | "restart";
  /** If provided, the flow instantly transitions to success with this data before the real action completes. */
  optimisticResult?: TData;
}

/**
 * Flow is the core engine for orchestrating asynchronous actions and their UI states.
 * It manages loading, success/error data, retries, concurrency, and optimistic updates.
 */
export class Flow<TData = any, TError = any, TArgs extends any[] = any[]> {
  private _state: FlowState<TData, TError> = {
    status: "idle",
    data: null,
    error: null,
  };

  private abortController: AbortController | null = null;
  private loadingStartTime: number | null = null;
  private loadingDelayTimer: any = null;
  private _isDelayingLoading = false;

  private listeners = new Set<(state: FlowState<TData, TError>) => void>();

  /**
   * Creates a new Flow instance.
   * @param action The asynchronous function to manage.
   * @param options Configuration for the flow's behavior.
   */
  constructor(
    private action: FlowAction<TData, TArgs>,
    private options: FlowOptions<TData, TError> = {},
  ) {}

  /**
   * Updates the flow options at runtime.
   */
  setOptions(options: FlowOptions<TData, TError>) {
    this.options = { ...this.options, ...options };
  }

  /**
   * The current state of the flow.
   */
  get state() {
    return this._state;
  }

  /**
   * The current execution status.
   */
  get status() {
    return this._state.status;
  }

  /**
   * The data from the last successful execution.
   */
  get data() {
    return this._state.data;
  }

  /**
   * The error from the last failed execution.
   */
  get error() {
    return this._state.error;
  }

  /**
   * Returns true if the flow is currently loading.
   * Note: Respects loading.delay - if a delay is active, this returns false.
   */
  get isLoading() {
    return this._state.status === "loading" && !this._isDelayingLoading;
  }

  /**
   * Returns true if the flow completed successfully.
   */
  get isSuccess() {
    return this._state.status === "success";
  }

  /**
   * Returns true if the flow is in an error state.
   */
  get isError() {
    return this._state.status === "error";
  }

  /**
   * The current progress (0-100).
   */
  get progress() {
    return this._state.progress ?? 0;
  }

  /**
   * Manually sets the progress value. Only effective while loading.
   */
  setProgress(progress: number) {
    if (this._state.status === "loading") {
      this.setState({ progress: Math.min(100, Math.max(0, progress)) });
    }
  }

  /**
   * Subscribes to state changes.
   * @param listener Callback fired whenever state changes.
   * @returns Unsubscribe function.
   */
  subscribe(listener: (state: FlowState<TData, TError>) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(updates: Partial<FlowState<TData, TError>>) {
    this._state = { ...this._state, ...updates };
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this._state));
  }

  /**
   * Cancels the currently running action and resets state to idle.
   */
  cancel() {
    this.clearLoadingDelay();
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.setState({ status: "idle", error: null, progress: 0 });
  }

  /**
   * Executes the action with the provided arguments.
   * @param args Arguments to pass to the action function.
   * @returns A promise that resolves with the action result or undefined if aborted.
   */
  execute(...args: TArgs): Promise<TData | undefined> {
    const { concurrency = "keep" } = this.options;

    // Concurrency Logic
    if (this._state.status === "loading") {
      if (concurrency === "keep") {
        return Promise.resolve(undefined);
      } else if (concurrency === "restart") {
        this.cancel();
      }
    }

    this.abortController = new AbortController();
    const currentSignal = this.abortController.signal;

    // Set state SYNCHRONOUSLY before async execution
    if (this.options.optimisticResult !== undefined) {
      this.setState({
        status: "success",
        data: this.options.optimisticResult,
        error: null,
        progress: 0,
      });
    } else {
      this.loadingStartTime = Date.now();
      this.setState({ status: "loading", error: null, progress: 0 });

      // Handle loading delay
      const delay = this.options.loading?.delay ?? 0;
      if (delay > 0) {
        this._isDelayingLoading = true;
        this.loadingDelayTimer = setTimeout(() => {
          this._isDelayingLoading = false;
          this.notify();
        }, delay);
      }
    }

    // Delegate to async execution
    return this.executeAsync(args, currentSignal);
  }

  private async executeAsync(
    args: TArgs,
    currentSignal: AbortSignal,
  ): Promise<TData | undefined> {
    let attempt = 0;
    const maxAttempts = this.options.retry?.maxAttempts ?? 1;

    while (attempt < maxAttempts) {
      if (currentSignal.aborted) return;

      attempt++;
      try {
        const data = await this.action(...args);

        if (currentSignal.aborted) return;

        // Enforce minDuration
        await this.enforceMinDuration();

        this.setState({ status: "success", data, progress: 100 });
        this.options.onSuccess?.(data);
        this.scheduleAutoReset();

        this.abortController = null;
        this.clearLoadingDelay();
        return data;
      } catch (error) {
        if (currentSignal.aborted) return;

        const typedError = error as TError;
        const shouldRetry = await this.checkShouldRetry(
          typedError,
          attempt,
          maxAttempts,
        );

        if (!shouldRetry) {
          await this.enforceMinDuration();
          this.setState({ status: "error", error: typedError, progress: 0 });
          this.options.onError?.(typedError);
          this.abortController = null;
          this.clearLoadingDelay();
          return;
        } else {
          await this.wait(attempt);
        }
      }
    }
  }

  private async checkShouldRetry(
    error: TError,
    attempt: number,
    maxAttempts: number,
  ): Promise<boolean> {
    if (attempt >= maxAttempts) return false;

    if (this.options.retry?.shouldRetry) {
      return this.options.retry.shouldRetry(error, attempt);
    }

    return true; // Default behavior: retry until maxAttempts
  }

  /**
   * Resets the flow state back to initial 'idle' state.
   */
  reset() {
    this.clearAutoReset();
    this.clearLoadingDelay();
    this.setState({
      status: "idle",
      data: null,
      error: null,
      progress: 0,
    });
  }

  private autoResetTimer: any = null;

  private scheduleAutoReset() {
    this.clearAutoReset();
    const options = this.options.autoReset;
    if (
      options &&
      options.enabled !== false &&
      options.delay &&
      options.delay > 0
    ) {
      this.autoResetTimer = setTimeout(() => {
        if (this._state.status === "success") {
          this.reset();
        }
      }, options.delay);
    }
  }

  private clearAutoReset() {
    if (this.autoResetTimer) {
      clearTimeout(this.autoResetTimer);
      this.autoResetTimer = null;
    }
  }

  private clearLoadingDelay() {
    if (this.loadingDelayTimer) {
      clearTimeout(this.loadingDelayTimer);
      this.loadingDelayTimer = null;
    }
    this._isDelayingLoading = false;
  }

  private async enforceMinDuration() {
    const minDuration = this.options.loading?.minDuration ?? 0;
    if (minDuration > 0 && this.loadingStartTime) {
      const elapsed = Date.now() - this.loadingStartTime;
      const remaining = minDuration - elapsed;
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
    }
  }

  private async wait(attempt: number) {
    const delay = this.options.retry?.delay ?? 1000;
    const backoff = this.options.retry?.backoff ?? "fixed";

    let waitTime = delay;
    if (backoff === "linear") {
      waitTime = delay * attempt;
    } else if (backoff === "exponential") {
      waitTime = delay * Math.pow(2, attempt - 1);
    }

    return new Promise((resolve) => setTimeout(resolve, waitTime));
  }
}
