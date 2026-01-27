import { FlowError, FlowErrorType } from "./flow";

/**
 * Utility functions for creating and handling FlowError instances.
 * These helpers simplify error handling and categorization in your application.
 * @module
 */

/**
 * Creates a FlowError from any error object with automatic type detection.
 *
 * @param error The error to wrap
 * @param options Optional overrides for error properties
 * @returns A properly formatted FlowError
 *
 * @example
 * ```ts
 * try {
 *   await fetch('/api/data');
 * } catch (err) {
 *   const flowError = createFlowError(err);
 *   console.log(flowError.type); // Automatically detected
 * }
 * ```
 */
export function createFlowError<TError = unknown>(
  error: TError,
  options?: Partial<Omit<FlowError<TError>, "originalError">>,
): FlowError<TError> {
  const detectedType = detectErrorType(error);
  const defaultMessage = getErrorMessage(error);

  return {
    type: options?.type ?? detectedType,
    message: options?.message ?? defaultMessage,
    originalError: error,
    isRetryable: options?.isRetryable ?? isErrorRetryable(detectedType),
  };
}

/**
 * Automatically detects the error type based on common error patterns.
 *
 * @param error The error to analyze
 * @returns The detected FlowErrorType
 *
 * @example
 * ```ts
 * const error = new Error('Network timeout');
 * const type = detectErrorType(error); // FlowErrorType.TIMEOUT
 * ```
 */
export function detectErrorType(error: unknown): FlowErrorType {
  if (!error) {
    return FlowErrorType.UNKNOWN;
  }

  const errorStr = String(error).toLowerCase();
  const errorMessage =
    error instanceof Error ? error.message.toLowerCase() : errorStr;

  // Network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("connection") ||
    errorStr.includes("networkerror")
  ) {
    return FlowErrorType.NETWORK;
  }

  // Timeout errors
  if (
    errorMessage.includes("timeout") ||
    errorMessage.includes("timed out") ||
    errorMessage.includes("aborted")
  ) {
    return FlowErrorType.TIMEOUT;
  }

  // Permission/Auth errors
  if (
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("forbidden") ||
    errorMessage.includes("permission") ||
    errorMessage.includes("401") ||
    errorMessage.includes("403")
  ) {
    return FlowErrorType.PERMISSION;
  }

  // Validation errors
  if (
    errorMessage.includes("validation") ||
    errorMessage.includes("invalid") ||
    errorMessage.includes("required") ||
    errorMessage.includes("400")
  ) {
    return FlowErrorType.VALIDATION;
  }

  // Server errors
  if (
    errorMessage.includes("server") ||
    errorMessage.includes("500") ||
    errorMessage.includes("503") ||
    errorMessage.includes("502")
  ) {
    return FlowErrorType.SERVER;
  }

  return FlowErrorType.UNKNOWN;
}

/**
 * Determines if an error type is typically retryable.
 *
 * @param errorType The error type to check
 * @returns true if the error is typically safe to retry
 *
 * @example
 * ```ts
 * const retryable = isErrorRetryable(FlowErrorType.NETWORK);
 * console.log(retryable); // true
 *
 * const notRetryable = isErrorRetryable(FlowErrorType.VALIDATION);
 * console.log(notRetryable); // false
 * ```
 */
export function isErrorRetryable(errorType: FlowErrorType): boolean {
  switch (errorType) {
    case FlowErrorType.NETWORK:
    case FlowErrorType.TIMEOUT:
    case FlowErrorType.SERVER:
      return true;
    case FlowErrorType.VALIDATION:
    case FlowErrorType.PERMISSION:
      return false;
    case FlowErrorType.UNKNOWN:
    default:
      return false;
  }
}

/**
 * Extracts a human-readable message from any error object.
 *
 * @param error The error to extract a message from
 * @returns A readable error message
 *
 * @example
 * ```ts
 * const error = new Error('Something went wrong');
 * const message = getErrorMessage(error);
 * console.log(message); // "Something went wrong"
 *
 * const unknownError = { code: 500 };
 * const message2 = getErrorMessage(unknownError);
 * console.log(message2); // "An unknown error occurred"
 * ```
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "An unknown error occurred";
}

/**
 * Type guard to check if an error is a FlowError.
 *
 * @param error The error to check
 * @returns true if the error is a FlowError
 *
 * @example
 * ```ts
 * const error = createFlowError(new Error('Test'));
 * if (isFlowError(error)) {
 *   console.log(error.type); // Safe to access FlowError properties
 * }
 * ```
 */
export function isFlowError<TError = unknown>(
  error: unknown,
): error is FlowError<TError> {
  return (
    error !== null &&
    typeof error === "object" &&
    "type" in error &&
    "message" in error &&
    "originalError" in error &&
    "isRetryable" in error &&
    Object.values(FlowErrorType).includes(
      (error as FlowError).type as FlowErrorType,
    )
  );
}
