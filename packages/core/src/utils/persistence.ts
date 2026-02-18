import type { FlowState, FlowStatus } from "../flow";
import { getStorage } from "./storage";

/**
 * Extended state that can be persisted, including metadata for resumption.
 */
export interface PersistedFlowState<TData = any, TError = any> {
  status: FlowStatus;
  data: TData | null;
  error: TError | null;
  progress?: number;
  /** Timestamp when the state was persisted */
  timestamp: number;
  /** Arguments used in the last execution (for resumption) */
  lastArgs?: any[];
  /** Whether this was a loading state that was interrupted */
  wasLoading?: boolean;
}

/**
 * Options for state persistence behavior.
 */
export interface PersistenceOptions {
  /**
   * Unique key to identify this flow's persisted state.
   */
  key: string;
  /**
   * Storage type: 'local' for localStorage, 'session' for sessionStorage.
   * Default: 'local'
   */
  storage?: "local" | "session";
  /**
   * Whether to persist loading states (useful for resumable operations).
   * Default: false
   */
  persistLoading?: boolean;
  /**
   * Whether to persist error states.
   * Default: false
   */
  persistError?: boolean;
  /**
   * Time in milliseconds after which persisted state is considered stale and ignored.
   * Default: 24 hours (86400000ms)
   */
  ttl?: number;
  /**
   * Callback invoked when a persisted state is restored.
   * Return false to reject the restoration.
   */
  onRestore?: (state: PersistedFlowState) => boolean | Promise<boolean>;
  /**
   * Callback invoked when a loading state is detected on restore.
   * Allows the app to show a "Resume?" UI.
   */
  onInterruptedLoading?: (state: PersistedFlowState) => void;
}

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Persists the current flow state to storage.
 */
export function persistFlowState<TData, TError>(
  state: FlowState<TData, TError>,
  options: PersistenceOptions,
  lastArgs?: any[],
): void {
  const storage = getStorage(options.storage);
  if (!storage) return;

  // Skip persistence based on options
  if (state.status === "loading" && !options.persistLoading) return;
  if (state.status === "error" && !options.persistError) return;

  const persistedState: PersistedFlowState<TData, TError> = {
    status: state.status,
    data: state.data,
    error: state.error,
    progress: state.progress,
    timestamp: Date.now(),
    lastArgs,
    wasLoading: state.status === "loading",
  };

  try {
    storage.setItem(options.key, JSON.stringify(persistedState));
  } catch (e) {
    console.warn("Flow: Failed to persist state", e);
  }
}

/**
 * Restores a persisted flow state from storage.
 * Returns null if no valid state is found or if it's stale.
 */
export async function restoreFlowState<TData, TError>(
  options: PersistenceOptions,
): Promise<PersistedFlowState<TData, TError> | null> {
  const storage = getStorage(options.storage);
  if (!storage) return null;

  try {
    const stored = storage.getItem(options.key);
    if (!stored) return null;

    const persistedState = JSON.parse(stored) as PersistedFlowState<
      TData,
      TError
    >;

    // Check TTL
    const ttl = options.ttl ?? DEFAULT_TTL;
    const age = Date.now() - persistedState.timestamp;
    if (age > ttl) {
      // State is stale, clear it
      clearFlowState(options);
      return null;
    }

    // Allow custom validation
    if (options.onRestore) {
      const allowed = await options.onRestore(persistedState);
      if (!allowed) {
        clearFlowState(options);
        return null;
      }
    }

    // Notify about interrupted loading
    if (persistedState.wasLoading && options.onInterruptedLoading) {
      options.onInterruptedLoading(persistedState);
    }

    return persistedState;
  } catch (e) {
    console.warn("Flow: Failed to restore persisted state", e);
    return null;
  }
}

/**
 * Clears persisted state from storage.
 */
export function clearFlowState(options: PersistenceOptions): void {
  const storage = getStorage(options.storage);
  if (!storage) return;

  try {
    storage.removeItem(options.key);
  } catch (e) {
    console.warn("Flow: Failed to clear persisted state", e);
  }
}

/**
 * Helper to generate a persistence key from a flow name and optional scope.
 */
export function generatePersistenceKey(
  flowName: string,
  scope?: string,
): string {
  const base = `asyncflow:${flowName}`;
  return scope ? `${base}:${scope}` : base;
}
