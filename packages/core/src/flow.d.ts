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
 * An asynchronous action that can be executed by a Flow.
 */
export type FlowAction<TData, TArgs extends any[]> = (...args: TArgs) => Promise<TData>;
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
export declare class Flow<TData = any, TError = any, TArgs extends any[] = any[]> {
    private action;
    private options;
    private _state;
    private abortController;
    private loadingStartTime;
    private loadingDelayTimer;
    private _isDelayingLoading;
    private listeners;
    /**
     * Creates a new Flow instance.
     * @param action The asynchronous function to manage.
     * @param options Configuration for the flow's behavior.
     */
    constructor(action: FlowAction<TData, TArgs>, options?: FlowOptions<TData, TError>);
    /**
     * Updates the flow options at runtime.
     */
    setOptions(options: FlowOptions<TData, TError>): void;
    /**
     * The current state of the flow.
     */
    get state(): FlowState<TData, TError>;
    /**
     * The current execution status.
     */
    get status(): FlowStatus;
    /**
     * The data from the last successful execution.
     */
    get data(): TData | null;
    /**
     * The error from the last failed execution.
     */
    get error(): TError | null;
    /**
     * Returns true if the flow is currently loading.
     * Note: Respects loading.delay - if a delay is active, this returns false.
     */
    get isLoading(): boolean;
    /**
     * Returns true if the flow completed successfully.
     */
    get isSuccess(): boolean;
    /**
     * Returns true if the flow is in an error state.
     */
    get isError(): boolean;
    /**
     * The current progress (0-100).
     */
    get progress(): number;
    /**
     * Manually sets the progress value. Only effective while loading.
     */
    setProgress(progress: number): void;
    /**
     * Subscribes to state changes.
     * @param listener Callback fired whenever state changes.
     * @returns Unsubscribe function.
     */
    subscribe(listener: (state: FlowState<TData, TError>) => void): () => void;
    private setState;
    private notify;
    /**
     * Cancels the currently running action and resets state to idle.
     */
    cancel(): void;
    /**
     * Executes the action with the provided arguments.
     * @param args Arguments to pass to the action function.
     * @returns A promise that resolves with the action result or undefined if aborted.
     */
    execute(...args: TArgs): Promise<TData | undefined>;
    private executeAsync;
    /**
     * Resets the flow state back to initial 'idle' state.
     */
    reset(): void;
    private autoResetTimer;
    private scheduleAutoReset;
    private clearAutoReset;
    private clearLoadingDelay;
    private enforceMinDuration;
    private wait;
}
