/**
 * Default values for Flow configuration options.
 * These constants help maintain consistency and make the codebase more maintainable.
 * @internal
 */

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY = {
  /** Default number of retry attempts (1 means no retry) */
  MAX_ATTEMPTS: 1,
  /** Default delay between retries in milliseconds */
  DELAY: 1000,
  /** Default backoff strategy */
  BACKOFF: "fixed" as const,
} as const;

/**
 * Default loading state configuration
 */
export const DEFAULT_LOADING = {
  /** Minimum duration to stay in loading state (ms) */
  MIN_DURATION: 0,
  /** Delay before showing loading state (ms) */
  DELAY: 0,
} as const;

/**
 * Default concurrency strategy
 */
export const DEFAULT_CONCURRENCY = "keep" as const;

/**
 * Progress value constraints
 */
export const PROGRESS = {
  MIN: 0,
  MAX: 100,
  INITIAL: 0,
  COMPLETE: 100,
} as const;

/**
 * Backoff multipliers for retry strategies
 */
export const BACKOFF_MULTIPLIER = {
  LINEAR: 1,
  EXPONENTIAL_BASE: 2,
} as const;
