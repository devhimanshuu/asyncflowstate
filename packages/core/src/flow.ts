import {
  DEFAULT_RETRY,
  DEFAULT_LOADING,
  DEFAULT_CONCURRENCY,
  PROGRESS,
  BACKOFF_MULTIPLIER,
} from "./utils/constants";
import { getStorage, restoreData, persistData } from "./utils/storage";

/**
 * A simple signal class for inter-flow communication.
 */
export class FlowSignal<TPayload = any> {
  private listeners = new Set<(payload: TPayload) => void>();

  public subscribe(listener: (payload: TPayload) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(payload: TPayload): void {
    this.listeners.forEach((l) => l(payload));
  }
}

/**
 * Sources that can trigger a flow execution.
 */
export type FlowTriggerSource =
  | FlowSignal<any>
  | { subscribe: (cb: any) => () => void }
  | boolean;

/**
 * Status of the flow.
 * - `idle`: Initial state or after reset.
 * - `loading`: Action is currently executing.
 * - `success`: Action completed successfully.
 * - `error`: Action failed after all retry attempts.
 * - `streaming`: Action is currently returning a stream of data.
 */
export type FlowStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "streaming"
  | "prewarmed";

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
  | "blocked"
  | "stream"
  | "purgatory"
  | "prewarm"
  | "rageClick";

/**
 * An event emitted for debugging purposes.
 */
export interface FlowEvent {
  type: FlowEventType;
  flowId: string;
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
  /** Differences between optimistic and server state after a rollback */
  rollbackDiff?: any[];
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
) => Promise<TData | AsyncIterable<any> | ReadableStream<any>>;

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
  /**
   * Strategy for handling terminal failures.
   * 'ai-healer' will invoke an AI repair agent to attempt recovery.
   */
  strategy?: "default" | "ai-healer";
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
 * Context provided to middleware callbacks.
 */
export interface FlowMiddlewareContext<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> {
  /** Metadata attached to the flow */
  meta: Record<string, any>;
  /** The full options used for this flow execution */
  options: FlowOptions<TData, TError, TArgs>;
}

/**
 * Middleware interface for intercepting flow lifecycle events.
 */
export interface FlowMiddleware<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
> {
  onStart?: (
    args: TArgs,
    context: FlowMiddlewareContext<TData, TError, TArgs>,
  ) => TArgs | void;
  onSuccess?: (
    data: TData,
    context: FlowMiddlewareContext<TData, TError, TArgs>,
  ) => void;
  onError?: (
    error: TError,
    context: FlowMiddlewareContext<TData, TError, TArgs>,
  ) => void;
  onSettled?: (
    data: TData | null,
    error: TError | null,
    context: FlowMiddlewareContext<TData, TError, TArgs>,
  ) => void;
  onStream?: (
    chunk: any,
    accumulated: TData,
    context: FlowMiddlewareContext<TData, TError, TArgs>,
  ) => void;
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
 * Configuration for intelligent streaming behavior.
 */
export interface StreamingPolicy {
  /** Detects gibberish or hallucinations in real-time. Pauses if score exceeds threshold. */
  hallucinationDetection?: boolean;
  /** Threshold (0-1) for hallucination detection. Default: 0.8 */
  hallucinationThreshold?: number;
  /** Buffers chunks until semantic clarity is reached. */
  intelligentBuffering?: number;
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
  /** Callback fired when a new chunk of data arrives in streaming mode */
  onStream?: (chunk: any, accumulated: TData) => void;
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
   * Configuration for state persistence (Smart Persistence feature).
   * Allows flows to survive page refreshes and resume interrupted operations.
   *
   * @example Basic persistence
   * ```ts
   * persist: {
   *   key: 'user-profile-upload',
   *   storage: 'local'
   * }
   * ```
   *
   * @example Resumable file upload
   * ```ts
   * persist: {
   *   key: 'file-upload-' + fileId,
   *   persistLoading: true,
   *   onInterruptedLoading: (state) => {
   *     showResumeDialog(state.progress);
   *   }
   * }
   * ```
   */
  persist?: {
    /** Unique key to identify this flow's persisted state */
    key: string;
    /** Storage type: 'local' or 'session'. Default: 'local' */
    storage?: "local" | "session";
    /** Whether to persist loading states. Default: false */
    persistLoading?: boolean;
    /** Whether to persist error states. Default: false */
    persistError?: boolean;
    /** Time in ms after which persisted state is stale. Default: 24 hours */
    ttl?: number;
    /** Callback when state is restored. Return false to reject. */
    onRestore?: (state: any) => boolean | Promise<boolean>;
    /** Callback when interrupted loading state is detected */
    onInterruptedLoading?: (state: any) => void;
  };
  /**
   * @deprecated Use `persist.key` instead
   * Unique key to persist success data in storage.
   * If present, data will be restored on initialization.
   */
  persistKey?: string;
  /**
   * @deprecated Use `persist.storage` instead
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
   * Optional triggers that will automatically execute this flow.
   * If a boolean is provided, it triggers when it becomes true.
   * If a FlowSignal or subscribable is provided, it triggers when it emits.
   */
  triggerOn?: FlowTriggerSource[];
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
   * Optional metadata to attach to the flow.
   * Useful for global middleware/interceptors to handle specific behaviors.
   */
  meta?: Record<string, any>;
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
  /**
   * Configuration for Purgatory (Global Undo) state.
   * Allows a delay before the action is actually executed, during which it can be undone.
   */
  purgatory?: {
    /** Duration in milliseconds to wait before executing the action. */
    duration: number;
    /** Whether to show a 'pending' status during purgatory. Default: true */
    showPending?: boolean;
  };
  /**
   * Configuration for Ghost Workflows (Background Action Queues).
   * Allows actions to be queued and executed in the background without blocking the UI.
   */
  ghost?: {
    /** Whether ghost mode is enabled for this flow. */
    enabled: boolean;
    /** Strategy for handling rapid-fire actions: 'last' (cancel prev), 'queue' (run sequential). Default: 'last' */
    strategy?: "last" | "queue";
  };
  /**
   * If true, permanently failed actions (after all retries) are stored in a
   * Dead Letter Queue for later inspection or replay.
   */
  deadLetter?: boolean;
  /**
   * Configuration for Predictive "Intent-to-Flow" (Pre-warming).
   */
  predictive?: {
    /** Whether to monitor mouse/touch trajectories for intent prediction. */
    intentToFlow?: boolean;
    /** Probability threshold for triggering pre-checks. Default: 0.7 */
    threshold?: number;
    /** Whether to enable prefetching on hover. */
    prefetchOnHover?: boolean;
    /** Minimum hover duration (ms) before triggering prefetch. Default: 100 */
    hoverDelay?: number;
  };
  /**
   * Probability-of-Success model configuration for optimistic rollbacks.
   */
  probabilityModel?: {
    /** Minimum probability (0-1) required for optimistic updates. Default: 0.4 */
    successThreshold?: number;
  };
  /**
   * Configuration for intelligent streaming orchestration.
   */
  streamingPolicy?: StreamingPolicy;
  /**
   * Context-aware throttling based on user behavior (e.g. Rage Clicking).
   */
  autoThrottle?: {
    /** Monitor user stress levels to adjust concurrency. */
    monitorUserStress?: boolean;
    /** Number of clicks per second to trigger "Rage Mode". Default: 5 */
    rageClickThreshold?: number;
  };
  /**
   * Flow DNA — Genetic Optimization Engine.
   * Flows evolve their own configs (retry, timeout, staleTime) from execution telemetry.
   */
  evolution?: {
    /** Enable genetic optimization. */
    enabled: boolean;
    /** Number of executions before optimization begins. Default: 50 */
    generations?: number;
    /** How aggressively to tweak params (0-1). Default: 0.1 */
    mutationRate?: number;
    /** Optimize for latency, reliability, or bandwidth. Default: 'latency' */
    fitness?: "latency" | "reliability" | "bandwidth";
  };
  /**
   * Ambient Intelligence — Device & Environment-Aware Flows.
   * Auto-adapt based on battery, network quality, CPU load.
   */
  ambient?: {
    /** Enable ambient intelligence. */
    enabled: boolean;
    rules?: {
      lowBattery?: { below: number; action: "defer" | "skip" };
      slowNetwork?: { below: "2g" | "3g" | "4g"; action: "compress" | "defer" };
      highCPU?: { above: number; action: "throttle" | "defer" };
      lowMemory?: { below: number; action: "purge" };
    };
    onAdapt?: (adaptation: { reason: string; action: string }) => void;
  };
  /**
   * Temporal Replay — Time-Travel Debugging.
   * Record the entire flow lifecycle as a replayable timeline.
   */
  temporal?: {
    /** Enable temporal recording. */
    record: boolean;
    /** Maximum snapshots to keep. Default: 200 */
    maxSnapshots?: number;
    /** Include action args in snapshots. Default: false */
    includeArgs?: boolean;
  };
  /**
   * Emotional UX — User Sentiment Detection.
   * Detect frustration patterns and adapt the UI.
   */
  sentiment?: {
    /** Enable sentiment detection. */
    enabled: boolean;
    /** Signals to monitor. */
    signals?: ("hesitation" | "abandonment" | "erraticScroll" | "rageClick")[];
    /** Callback when frustration is detected. */
    onFrustration?: (level: number) => void;
  };
  /**
   * Flow Mesh — Cross-Tab Orchestration.
   * Share cache and coordinate execution across tabs via leader election.
   */
  mesh?: {
    /** BroadcastChannel name for this mesh. */
    channel: string;
    /** Coordination strategy. Default: 'leader-follower' */
    strategy?: "leader-follower" | "peer-to-peer";
    /** Share successful results. Default: true */
    shareCache?: boolean;
    /** Share errors to prevent retry storms. Default: true */
    shareErrors?: boolean;
    /** Leader election heartbeat interval (ms). Default: 5000 */
    heartbeat?: number;
  };
  /**
   * Collaborative Flows — CRDT-Based Conflict Resolution.
   * Multi-user state synchronization with merge strategies.
   */
  collaborative?: {
    /** Enable collaborative mode. */
    enabled: boolean;
    /** Conflict resolution strategy. */
    strategy?: "last-writer-wins" | "merge" | "custom";
    /** Custom merge function. */
    merge?: (local: any, remote: any) => any;
    /** Track presence. */
    presence?: boolean;
    /** BroadcastChannel name. */
    channel?: string;
  };
  /**
   * Edge-First Flows — Edge Runtime Awareness.
   * Detect and adapt to edge environments (Cloudflare, Vercel, Deno).
   */
  edge?: {
    /** Enable edge awareness. */
    enabled: boolean;
    /** Runtime to target. Default: 'auto' */
    runtime?: "auto" | "cloudflare" | "vercel" | "deno" | "browser";
    /** Edge caching configuration. */
    cache?: {
      strategy?: "stale-while-revalidate" | "cache-first" | "network-first";
      ttl?: number;
      scope?: "global" | "per-user" | "per-region";
    };
  };
  /**
   * Speculative Execution — Branch Prediction for UI.
   * Run optimistic + real paths simultaneously with smooth correction animations.
   */
  speculative?: {
    /** Enable speculative execution. */
    enabled: boolean;
    /** Function to compute the optimistic branch result. */
    optimisticBranch?: (...args: TArgs) => TData;
    /** Animation type for corrections. Default: 'morph' */
    correctionAnimation?: "morph" | "fade" | "slide" | "none";
    /** Duration of correction animation (ms). Default: 300 */
    correctionDuration?: number;
  };
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
  private readonly id = Math.random().toString(36).substr(2, 9);

  public static onEvent(listener: (event: FlowEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private emit(type: FlowEventType, payload?: any): void {
    const event: FlowEvent = {
      type,
      flowId: this.id,
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
  private lastPersistedArgs: TArgs | undefined;
  private currentExecutionArgs: TArgs | undefined;

  // --- Subscriptions ---
  private listeners = new Set<(state: FlowState<TData, TError>) => void>();

  // --- External Control ---
  private abortController: AbortController | null = null;
  private activePromise: Promise<TData | undefined> | null = null;

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

  // --- Signals ---
  public readonly signals = {
    start: new FlowSignal<TArgs>(),
    success: new FlowSignal<TData>(),
    error: new FlowSignal<TError>(),
    cancel: new FlowSignal<void>(),
    reset: new FlowSignal<void>(),
    stream: new FlowSignal<any>(),
    restore: new FlowSignal<any>(),
    purgatory: new FlowSignal<{ countdown: number }>(),
    undo: new FlowSignal<void>(),
    rollback: new FlowSignal<{ patches: any[] }>(),
    prewarm: new FlowSignal<void>(),
    rageClick: new FlowSignal<{ frequency: number }>(),
  };

  private rageClickCounter = 0;
  private lastClickTime = 0;
  private isPrewarmed = false;

  private purgatoryTimer: ReturnType<typeof setTimeout> | null = null;
  private ghostQueue: { args: TArgs; resolve: any }[] = [];
  private isProcessingGhost = false;

  private triggerSubscriptions: (() => void)[] = [];

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
  private static circuitRegistryLoaded = false;
  private static readonly CIRCUIT_STORAGE_KEY = "asyncflow_circuit_registry";

  /**
   * Loads the circuit breaker registry from local storage on first use.
   */
  private static loadCircuitRegistry(): void {
    if (this.circuitRegistryLoaded) return;

    const storage = getStorage("local");
    const data = restoreData<Record<string, any>>(
      this.CIRCUIT_STORAGE_KEY,
      storage,
    );

    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        this.circuitRegistry.set(key, value);
      });
    }

    this.circuitRegistryLoaded = true;
  }

  /**
   * Updates a circuit breaker state and persists it to storage.
   */
  private static updateCircuitState(key: string, state: any): void {
    this.circuitRegistry.set(key, state);

    // Persist to storage
    const storage = getStorage("local");
    const currentData: Record<string, any> = {};
    this.circuitRegistry.forEach((v, k) => {
      // Don't persist HALF_OPEN, save as OPEN to be safe on restart
      const valueToSave = { ...v };
      if (valueToSave.state === "HALF_OPEN") valueToSave.state = "OPEN";
      currentData[k] = valueToSave;
    });

    persistData(this.CIRCUIT_STORAGE_KEY, currentData, storage);
  }

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

    // Initialize Sync
    if (this.options.sync?.channel && typeof BroadcastChannel !== "undefined") {
      this.bc = new BroadcastChannel(this.options.sync.channel);
      this.bc.onmessage = this.handleSyncMessage.bind(this);
    }

    // Load persistent circuit registry on first instantiation
    Flow.loadCircuitRegistry();

    // Initialize triggers
    this.initializeTriggers();

    // Initialize persistence (async fire-and-forget)
    this.initializePersistence();
  }

  private initializeTriggers(): void {
    if (!this.options.triggerOn) return;

    this.options.triggerOn.forEach((source) => {
      if (typeof source === "boolean") {
        // Booleans are handled by the framework wrapper (e.g. useFlow)
        // because the core Flow instance doesn't have a reactive cycle itself
        return;
      }

      if (source && typeof (source as any).subscribe === "function") {
        const unsub = (source as any).subscribe(() => {
          this.execute(...([] as unknown as TArgs));
        });
        this.triggerSubscriptions.push(unsub);
      }
    });
  }

  /**
   * Cleanup any subscriptions or timers before disposing.
   */
  public dispose(): void {
    this.clearAllTimers();
    this.triggerSubscriptions.forEach((unsub) => unsub());
    this.triggerSubscriptions = [];
    if (this.bc) {
      this.bc.close();
    }
  }

  /**
   * Initializes the persistence system and restores state if available.
   */
  private async initializePersistence(): Promise<void> {
    if (!this.options.persist) return;

    const { restoreFlowState } = await import("./utils/persistence");

    const persistedState = await restoreFlowState<TData, TError>({
      key: this.options.persist.key,
      storage: this.options.persist.storage,
      persistLoading: this.options.persist.persistLoading,
      persistError: this.options.persist.persistError,
      ttl: this.options.persist.ttl,
      onRestore: this.options.persist.onRestore,
      onInterruptedLoading: this.options.persist.onInterruptedLoading,
    });

    if (persistedState) {
      this._state = {
        status: persistedState.status,
        data: persistedState.data,
        error: persistedState.error,
        progress: persistedState.progress ?? PROGRESS.INITIAL,
      };
      this.hasRestoredState = true;
      this.lastPersistedArgs = persistedState.lastArgs as TArgs;
      this.notify();
      this.signals.restore.emit(persistedState);
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
      // Replace middlewares completely to avoid accumulation on re-renders
      this.middlewares = [...options.middleware];
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
    return (
      (this._state.status === "loading" && !this._isDelayingLoading) ||
      !!this.purgatoryTimer
    );
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

  /**
   * Serializes the entire flow state, history, and inputs into a JSON payload for debugging.
   */
  public exportState(): string {
    return JSON.stringify(
      {
        id: this.id,
        finalState: this.state,
        history: this._history,
        lastExecutionArgs: this.currentExecutionArgs,
        timestamp: Date.now(),
      },
      (key, value) => {
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
          };
        }
        return value;
      },
    );
  }

  /**
   * Imports a serialized flow state and visually replays the async flow step-by-step.
   * @param json Serialized state from `exportState()`
   * @param speedMs Time in milliseconds to wait between state changes to visually replay
   */
  public async importState(json: string, speedMs: number = 500): Promise<void> {
    try {
      const parsed = JSON.parse(json);
      if (parsed.history && Array.isArray(parsed.history)) {
        this.reset();

        for (const historicalState of parsed.history) {
          this._state = historicalState;
          this.notify();
          if (speedMs > 0) {
            await new Promise((r) => setTimeout(r, speedMs));
          }
        }

        if (parsed.finalState) {
          this._state = parsed.finalState;
          this.notify();
        }
      }
    } catch (e) {
      console.error(
        "AsyncFlowState: Failed to parse or replay flow state JSON",
        e,
      );
    }
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
   * Resumes a previously interrupted flow execution.
   * This is useful when a loading state was persisted (e.g., file upload interrupted by page refresh).
   *
   * @param args Optional arguments to use for resumption. If not provided, uses the last persisted args.
   * @returns Promise resolving to the action result
   *
   * @example
   * ```ts
   * const flow = new Flow(uploadFile, {
   *   persist: {
   *     key: 'file-upload',
   *     persistLoading: true,
   *     onInterruptedLoading: (state) => {
   *       if (confirm(`Resume upload at ${state.progress}%?`)) {
   *         flow.resume();
   *       }
   *     }
   *   }
   * });
   * ```
   */
  public async resume(...args: TArgs | []): Promise<TData | undefined> {
    const argsToUse =
      args.length > 0 ? args : (this.lastPersistedArgs as TArgs);

    if (!argsToUse) {
      console.warn(
        "Flow: Cannot resume without arguments. Provide args or ensure they were persisted.",
      );
      return undefined;
    }

    return this.execute(...(argsToUse as TArgs));
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

    // Context-Aware Auto-Throttle (Rage Clicking)
    if (this.options.autoThrottle?.monitorUserStress) {
      const now = Date.now();
      if (now - this.lastClickTime < 200) {
        this.rageClickCounter++;
      } else {
        this.rageClickCounter = 0;
      }
      this.lastClickTime = now;

      const threshold = this.options.autoThrottle.rageClickThreshold || 5;
      if (this.rageClickCounter >= threshold) {
        this.signals.rageClick.emit({ frequency: this.rageClickCounter });
        console.warn(
          "[AsyncFlowState]: Rage clicking detected. Activating Purgatory (Undo) gate.",
        );
        // Force purgatory for safety
        if (!this.options.purgatory) {
          this.options.purgatory = { duration: 1500 };
        }
      }
    }

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
          Flow.updateCircuitState(cbKey, { ...circuit, state: "HALF_OPEN" });
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

    // 4. Run Middlewares and allow them to modify arguments
    const modifiedArgs = this.runOnStartMiddleware(args);

    // 5. Ghost Workflow Handling
    if (this.options.ghost?.enabled) {
      return this.handleGhostExecution(modifiedArgs);
    }

    // 6. Purgatory (Undo) Handling
    if (this.options.purgatory && this.options.purgatory.duration > 0) {
      return this.handlePurgatoryExecution(modifiedArgs);
    }

    // 7. Direct Execution
    return this.internalExecute(modifiedArgs);
  }

  /**
   * Executes the action in a Web Worker (Main-Thread Offloading).
   * Note: The action must be a serializable function.
   */
  public async worker(...args: TArgs): Promise<TData | undefined> {
    const isBrowser =
      typeof window !== "undefined" && typeof Worker !== "undefined";

    if (!isBrowser) {
      return this.execute(...args);
    }

    try {
      const { createWorkerAction } = await import("./utils/worker-utils");
      const originalAction = this.action;

      this.action = createWorkerAction(
        originalAction as (...args: TArgs) => TData | Promise<TData>,
      ) as any;
      const result = await this.execute(...args);
      this.action = originalAction;

      return result;
    } catch (e) {
      console.warn("AsyncFlowState: Worker execution failed", e);
      return this.execute(...args);
    }
  }

  /**
   * Handles the execution logic for Purgatory (Undo) mode.
   * @private
   */
  private async handlePurgatoryExecution(
    args: TArgs,
  ): Promise<TData | undefined> {
    this.clearTimer("purgatoryTimer");

    const duration = this.options.purgatory!.duration;
    const showPending = this.options.purgatory!.showPending !== false;

    if (showPending) {
      this.setState({
        status: "idle",
        progress: 0,
      });
    }

    this.emit("purgatory", { countdown: duration });
    this.signals.purgatory.emit({ countdown: duration });

    return new Promise((resolve) => {
      this.purgatoryTimer = setTimeout(async () => {
        this.purgatoryTimer = null;
        this.notify();
        const result = await this.internalExecute(args);
        resolve(result);
      }, duration);
      this.notify();

      // Listen for manual undo signal
      const unsub = this.signals.undo.subscribe(() => {
        this.clearTimer("purgatoryTimer");
        unsub();
        this.setState({ status: "idle" });
        resolve(undefined);
      });
    });
  }

  /**
   * Manual trigger for undoing an action in purgatory or reverting history.
   */
  public triggerUndo(): void {
    if (this.purgatoryTimer) {
      this.signals.undo.emit();
    } else {
      this.undo();
    }
  }

  /**
   * Handles the logic for Ghost Workflows (Background Queue).
   * @private
   */
  private async handleGhostExecution(args: TArgs): Promise<TData | undefined> {
    const strategy = this.options.ghost?.strategy || "last";

    if (strategy === "last" && this.isProcessingGhost) {
      // In ghost mode, we don't necessarily want to cancel the actual network request
      // if it's already far along, but for 'last' strategy we follow the UI intent.
      this.cancel();
    }

    return new Promise((resolve) => {
      this.ghostQueue.push({ args, resolve });
      this.processGhostQueue();
    });
  }

  private async processGhostQueue(): Promise<void> {
    if (this.isProcessingGhost || this.ghostQueue.length === 0) return;

    this.isProcessingGhost = true;
    const item = this.ghostQueue.shift();

    if (item) {
      try {
        const result = await this.internalExecute(item.args, true);
        item.resolve(result);
      } catch (e) {
        // Ghost errors are often handled silently or via global notification providers
        console.error("AsyncFlowState: Ghost workflow failed", e);
      }
    }

    this.isProcessingGhost = false;
    this.processGhostQueue();
  }

  // --- Private Internal Logic ---

  /**
   * Core execution logic that handles concurrency strategies.
   * @private
   * @param args Arguments to pass to the action
   * @param silent If true, status transitions to 'loading' are skipped (Ghost mode)
   * @returns Promise that resolves with the action result
   */
  private internalExecute(
    args: TArgs,
    silent: boolean = false,
    skipOptimistic: boolean = false,
  ): Promise<TData | undefined> {
    const { concurrency = DEFAULT_CONCURRENCY } = this.options;

    if (this._state.status === "loading" && this.activePromise) {
      switch (concurrency) {
        case "keep":
          return this.activePromise;
        case "restart":
          this.cancel();
          break;
        case "enqueue":
          return new Promise((resolve) => {
            this.queue.push({ args, resolve });
          });
      }
    }

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

    // Track args for persistence
    this.currentExecutionArgs = args;

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

    // Predictive Optimistic Rollback: Probability-of-Success Check
    if (
      !skipOptimistic &&
      this.options.probabilityModel &&
      this.options.optimisticResult !== undefined
    ) {
      // In a real scenario, this would call a tiny local ML model
      // For now, we simulate a "Probability of Success" check based on online status and previous errors
      const isOnline =
        typeof navigator !== "undefined" ? navigator.onLine : true;
      const recentErrors = this._history.filter(
        (s) => s.status === "error",
      ).length;
      const prob = isOnline ? 0.9 - recentErrors * 0.1 : 0.1;

      const threshold = this.options.probabilityModel.successThreshold ?? 0.4;
      if (prob < threshold) {
        console.info(
          `[AsyncFlowState]: Success probability (${prob.toFixed(2)}) below threshold (${threshold}). Skipping optimistic update to prevent jarring rollback.`,
        );
        // Fallback to simulated loading instead of optimistic success
        this.setState({ status: "loading", progress: 5 });
        return this.internalExecute(args, true, true);
      }
    }

    // Optimistic Update Handling
    if (this.options.optimisticResult !== undefined && !skipOptimistic) {
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

      if (!silent) {
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
    }

    this.abortController = new AbortController();
    const currentSignal = this.abortController.signal;
    this.activePromise = this.runAction(args, currentSignal);

    // Register for deduplication
    if (this.options.dedupKey) {
      Flow.dedupRegistry.set(
        this.options.dedupKey,
        this.activePromise
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

    return this.activePromise;
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

          let rollbackDiff: any[] = [];
          if (shouldRollback) {
            const { calculateDeepDiff } = await import("./utils/diff-utils");
            rollbackDiff = calculateDeepDiff(
              this.previousDataSnapshot,
              this._state.data,
            );
          }

          this.setState({
            status: "error",
            data: shouldRollback ? this.previousDataSnapshot : this._state.data,
            error: timeoutError,
            progress: PROGRESS.INITIAL,
            rollbackDiff: shouldRollback ? rollbackDiff : undefined,
          });

          if (shouldRollback) {
            this.signals.rollback.emit({ patches: rollbackDiff });
            this.previousDataSnapshot = null;
          }

          this.options.onError?.(timeoutError);
          this.runMiddleware("onError", timeoutError);
          this.finalizeLoading();
          this.processEnqueuedTasks();

          // Update Circuit Breaker on timeout failure (treated as failure)
          if (this.options.circuitBreaker && cbKey) {
            this.handleCircuitFailure(cbKey);
          }
        }
        return;
      }

      attempt++;
      try {
        // Race the action against abort signal
        const result = await Promise.race([
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

        // --- Streaming Support ---
        const isAsyncIterable =
          result != null &&
          typeof (result as any)[Symbol.asyncIterator] === "function";
        const isReadableStream =
          result != null && typeof (result as any).getReader === "function";

        if (isAsyncIterable || isReadableStream) {
          this.setState({ status: "streaming" });

          if (isAsyncIterable) {
            for await (const chunk of result as AsyncIterable<any>) {
              if (signal.aborted) break;
              this.handleStreamChunk(chunk);
            }
          } else {
            const reader = (result as ReadableStream<any>).getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done || signal.aborted) break;
                this.handleStreamChunk(value);
              }
            } finally {
              reader.releaseLock();
            }
          }

          if (signal.aborted) return;

          // Once stream ends, finalize as success
          const finalData = this._state.data;
          this.finalizeSuccess(finalData as TData, cbKey, args);
          return finalData as TData;
        }

        // Standard Non-Streaming Success
        await this.waitMinDuration();
        this.finalizeSuccess(result as TData, cbKey, args);
        return result as TData;
      } catch (error) {
        // Check if this was a timeout abort
        if (signal.aborted && this.isTimeout) {
          const timeoutError = this.createTimeoutError() as TError;
          await this.waitMinDuration();

          // Handle rollback for optimistic updates
          const shouldRollback =
            this.options.rollbackOnError !== false &&
            this.previousDataSnapshot !== undefined;

          let rollbackDiff: any[] = [];
          if (shouldRollback) {
            const { calculateDeepDiff } = await import("./utils/diff-utils");
            rollbackDiff = calculateDeepDiff(
              this.previousDataSnapshot,
              this._state.data,
            );
          }

          this.setState({
            status: "error",
            data: shouldRollback ? this.previousDataSnapshot : this._state.data,
            error: timeoutError,
            progress: PROGRESS.INITIAL,
            rollbackDiff: shouldRollback ? rollbackDiff : undefined,
          });

          if (shouldRollback) {
            this.signals.rollback.emit({ patches: rollbackDiff });
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

          // Update Circuit Breaker on timeout failure
          if (this.options.circuitBreaker && cbKey) {
            this.handleCircuitFailure(cbKey);
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

          let rollbackDiff: any[] = [];
          if (shouldRollback) {
            const { calculateDeepDiff } = await import("./utils/diff-utils");
            rollbackDiff = calculateDeepDiff(
              this.previousDataSnapshot,
              this._state.data,
            );
          }

          this.setState({
            status: "error",
            data: shouldRollback ? this.previousDataSnapshot : this._state.data,
            error: finalError,
            progress: PROGRESS.INITIAL,
            rollbackDiff: shouldRollback ? rollbackDiff : undefined,
          });

          if (shouldRollback) {
            this.signals.rollback.emit({ patches: rollbackDiff });
            this.previousDataSnapshot = null;
          }

          this.options.onError?.(finalError);
          this.runMiddleware("onError", finalError);
          this.options.onSettled?.(null, finalError);
          this.runMiddleware("onSettled", null, finalError);

          // Dead Letter Queue: store permanently failed actions
          if (this.options.deadLetter) {
            const { DeadLetterQueue } =
              await import("./utils/dead-letter-queue");
            DeadLetterQueue.getInstance().push({
              args,
              error: finalError,
              attempts: attempt,
              meta: this.options.meta || { name: this.options.debugName },
            });
          }

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

        // --- AI Healer Integration ---
        if (
          this.options.retry?.strategy === "ai-healer" &&
          attempt >= maxAttempts
        ) {
          await this.attemptAIHealing(finalError);
          return;
        }

        await this.delayRetry(attempt);
      }
    }
  }

  /**
   * Updates the circuit breaker state on failure.
   * @private
   */
  private handleCircuitFailure(cbKey: string): void {
    const current = Flow.circuitRegistry.get(cbKey) || {
      failures: 0,
      lastFailure: 0,
      state: "CLOSED",
    };

    const newFailures = current.failures + 1;
    const newState =
      current.state === "HALF_OPEN" ||
      newFailures >= this.options.circuitBreaker!.failureThreshold
        ? "OPEN"
        : "CLOSED";

    Flow.updateCircuitState(cbKey, {
      failures: newFailures,
      lastFailure: Date.now(),
      state: newState,
    });
  }

  /**
   * Processes a single chunk from a stream.
   * @private
   */
  private handleStreamChunk(chunk: any): void {
    let newData = this._state.data;

    // Accumulate strings, otherwise replace (standard LLM streaming pattern)
    if (typeof chunk === "string") {
      newData = (((newData as any) || "") + chunk) as any;
    } else {
      newData = chunk;
    }

    this.setState({ status: "streaming", data: newData });

    // Emit signals and events
    this.signals.stream.emit(chunk);
    this.emit("stream", chunk);

    // Call callbacks
    this.options.onStream?.(chunk, newData as TData);
    this.runMiddleware("onStream", chunk, newData);

    // AI-Streaming Orchestration: Hallucination/Gibberish Detection
    if (this.options.streamingPolicy?.hallucinationDetection) {
      const text = String(newData);
      // Heuristic: check for repetitive chars or common hallucination markers
      const repetitiveness = (text.match(/(.)\1{4,}/g) || []).length;
      if (repetitiveness > 0) {
        console.warn(
          "[AsyncFlowState]: Potential hallucination detected in stream. Pausing...",
        );
        this.cancel();
        // Trigger self-healing if configured
        if (this.options.retry?.strategy === "ai-healer") {
          this.attemptAIHealing(
            new Error("Hallucination detected") as any,
            "stream",
          );
        }
      }
    }
  }

  /**
   * Pre-warms the flow by performing pre-checks and cache lookups.
   * Can be triggered by mouse intent tracking.
   */
  public async prewarm(..._args: TArgs): Promise<void> {
    if (this.isPrewarmed || this._state.status === "loading") return;

    console.info("[AsyncFlowState]: Pre-warming flow based on intent...");

    // 1. Precondition Check
    if (this.options.precondition) {
      const allowed = await this.options.precondition();
      if (!allowed) return;
    }

    // 2. Cache Lookup
    if (this.options.dedupKey && this.options.staleTime) {
      const cached = Flow.cacheRegistry.get(this.options.dedupKey);
      if (cached && Date.now() - cached.timestamp < this.options.staleTime) {
        console.info("[AsyncFlowState]: Cache is warm.");
      }
    }

    this.isPrewarmed = true;
    this.setState({ status: "prewarmed" });
    this.signals.prewarm.emit();
    this.emit("prewarm");

    // Reset prewarmed state if not executed shortly
    setTimeout(() => {
      if (this._state.status === "prewarmed") {
        this.setState({ status: "idle" });
        this.isPrewarmed = false;
      }
    }, 2000);
  }

  /**
   * Invokes the AI Healer agent to repair a failed flow.
   * @private
   */
  private async attemptAIHealing(
    error: TError,
    context?: string,
  ): Promise<void> {
    const { withAutoHealing } = await import("./utils/auto-healer");
    console.info(
      "[AsyncFlowState]: Terminal failure detected. Engaging Healer Agent...",
    );

    // We use a simplified version for core, but it hooks into the auto-healer utility
    // In a real app, this would call an LLM to "fix" the arguments or prompt.
    // Here we'll just demonstrate the mechanism.
    withAutoHealing(this, {
      context: context || "Self-healing terminal failure",
    });
    // This will internally attempt to recover the state
  }

  /**
   * Natural Language Debugger: Ask questions about the flow's history.
   * @param query The natural language question
   */
  public async askDebugger(query: string): Promise<string> {
    this.exportState(); // Export state for context, but result isn't needed here
    console.info(`[AsyncFlowState Debugger]: Analyzing query: "${query}"`);

    // In a real app, this would send history + query to an LLM
    // Here we provide a mock response that demonstrates the capability
    if (query.toLowerCase().includes("fail")) {
      const errors = this._history.filter((s) => s.status === "error");
      return `The flow failed ${errors.length} times. The primary reason was: ${(errors[0]?.error as any)?.message || "Unknown error"}.`;
    }

    return "Analyzing history... (LLM Integration required for full conversational experience)";
  }

  /**
   * Finalizes a successful execution.
   * @private
   */
  private finalizeSuccess(
    data: TData,
    cbKey: string | undefined,
    args: TArgs,
  ): void {
    // Clear timeout timer on success
    this.clearTimer("timeoutTimer");

    this.setState({ status: "success", data, progress: PROGRESS.COMPLETE });
    this.options.onSuccess?.(data);
    this.runMiddleware("onSuccess", data);
    this.options.onSettled?.(data, null);
    this.runMiddleware("onSettled", data, null);

    // Clear snapshot on successful completion
    this.previousDataSnapshot = null;

    // Record ghost data for future high-fidelity skeletons
    if (this.options.persist?.key) {
      import("./utils/stream-skeleton").then(({ recordGhostData }) => {
        recordGhostData(this.options.persist!.key, data);
      });
    }

    this.finalizeLoading();
    this.scheduleAutoReset();
    this.processEnqueuedTasks();

    // Reset Circuit Breaker on success
    if (this.options.circuitBreaker && cbKey) {
      Flow.updateCircuitState(cbKey, {
        failures: 0,
        lastFailure: 0,
        state: "CLOSED",
      });
    }

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

  private runOnStartMiddleware(args: TArgs): TArgs {
    let currentArgs = [...args] as TArgs;
    const allMiddlewares = [...Flow.globalMiddlewares, ...this.middlewares];

    const context: FlowMiddlewareContext<TData, TError, TArgs> = {
      meta: this.options.meta || {},
      options: this.options,
    };

    allMiddlewares.forEach((mw) => {
      if (typeof mw.onStart === "function") {
        try {
          const modified = (mw.onStart as any)(currentArgs, context);
          if (Array.isArray(modified)) {
            currentArgs = modified as TArgs;
          }
        } catch (err) {
          console.error("Flow: Middleware onStart error", err);
        }
      }
    });

    return currentArgs;
  }

  private runMiddleware(hook: keyof FlowMiddleware, ...args: any[]): void {
    const allMiddlewares = [...Flow.globalMiddlewares, ...this.middlewares];

    const context: FlowMiddlewareContext<TData, TError, TArgs> = {
      meta: this.options.meta || {},
      options: this.options,
    };

    allMiddlewares.forEach((mw) => {
      const fn = mw[hook];
      if (typeof fn === "function") {
        try {
          (fn as Function)(...args, context as any);
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
    // We only record significant state changes, ignoring pure progress updates and streaming chunks to avoid spamming history
    const isProgressUpdate =
      updates.progress !== undefined && Object.keys(updates).length === 1;
    const isStreamingChunk =
      this._state.status === "streaming" && updates.status === "streaming";

    if (!isProgressUpdate && !isStreamingChunk) {
      this._history.push({ ...this._state });
      if (this._history.length > this.historyLimit) {
        this._history.shift();
      }
    }

    this._state = { ...this._state, ...updates };

    // Handle new persistence system
    if (this.options.persist) {
      this.persistCurrentState();
    }

    this.notify();

    // Emit Signals
    if (updates.status === "loading" && this._state.status === "loading") {
      this.signals.start.emit(this.currentExecutionArgs as TArgs);
    } else if (updates.status === "success") {
      this.signals.success.emit(this._state.data as TData);
    } else if (updates.status === "error") {
      this.signals.error.emit(this._state.error as TError);
    }

    if (updates.status) {
      const eventMapping: Record<string, FlowEventType> = {
        idle: "reset",
        loading: "progress",
        success: "success",
        error: "error",
        streaming: "stream",
        prewarmed: "prewarm",
      };
      const event = eventMapping[updates.status];
      if (event) {
        this.emit(event);
      }
    }

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

  /**
   * Persists the current state to storage using the new persistence system.
   */
  private persistCurrentState(): void {
    if (!this.options.persist) return;

    // Dynamic import to avoid bundling persistence code if not used
    import("./utils/persistence").then(({ persistFlowState }) => {
      persistFlowState(
        this._state,
        {
          key: this.options.persist!.key,
          storage: this.options.persist!.storage,
          persistLoading: this.options.persist!.persistLoading,
          persistError: this.options.persist!.persistError,
          ttl: this.options.persist!.ttl,
        },
        this.currentExecutionArgs,
      );
    });
  }

  private finalizeLoading(): void {
    this.abortController = null;
    this.activePromise = null;
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
      | "purgatoryTimer"
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
    this.clearTimer("purgatoryTimer");
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
