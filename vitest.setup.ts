import { expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * Setup file for Vitest
 * Configures test environment, cleanup, and utilities
 */

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/**
 * Global test utilities
 */
beforeEach(() => {
  // Reset any global state before each test
  vi.clearAllTimers();
});

/**
 * Custom matchers (if needed)
 */
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

/**
 * Mock timers setup
 * Uncomment if using fake timers in tests
 */
// vi.useFakeTimers();

/**
 * Suppress specific console messages in tests (optional)
 */
const originalError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterEach(() => {
  console.error = originalError;
});
