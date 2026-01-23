# Technical Gaps & Implementation Guide

> Detailed technical analysis of what's missing and how to implement it

---

## 1. Package Infrastructure Issues (Implemented in v1.0)

### Current State

```json
// packages/core/package.json
{
  "name": "@asyncflowstate/core",
  "version": "0.0.1",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

### Problems

- ❌ No `exports` field (modern bundlers won't work properly)
- ❌ No `module` field (ESM not supported)
- ❌ Missing metadata (description, keywords, etc.)
- ❌ No `sideEffects` field (tree-shaking won't work)
- ❌ `private: true` (can't publish to npm)

### Solution

```json
{
  "name": "@asyncflowstate/core",
  "version": "0.0.1",
  "description": "Framework-agnostic async UI behavior engine",
  "keywords": ["async", "ui", "state", "flow", "loading", "error-handling"],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/devhimanshuu/asyncflowstate.git",
    "directory": "packages/core"
  },
  "bugs": "https://github.com/devhimanshuu/asyncflowstate/issues",
  "homepage": "https://github.com/devhimanshuu/asyncflowstate#readme",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "sideEffects": false,
  "engines": {
    "node": ">=16.0.0"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.9.3",
    "vitest": "^4.0.17"
  }
}
```

---

## 2. Build Pipeline (Implemented in v1.0)

### Current State

- ✅ TypeScript source files exist
- ❌ No build output
- ❌ No build tool configured
- ❌ No dist/ directory

### Problem

Users can't install and use the package because there's no compiled output.

### Solution: Use tsup

**Why tsup?**

- Zero config
- Supports ESM + CJS
- Generates .d.ts files
- Fast (uses esbuild)
- Perfect for libraries

**Installation:**

```bash
pnpm add -D tsup -w
```

**Configuration (tsup.config.ts in each package):**

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false, // Keep readable for v1
});
```

**Build scripts:**

```json
{
  "scripts": {
    "build": "pnpm -r build",
    "build:core": "pnpm --filter @asyncflowstate/core build",
    "build:react": "pnpm --filter @asyncflowstate/react build"
  }
}
```

---

## 3. Future Roadmap: Next.js Package (@asyncflowstate/next)

**Status:** Deferred to v2.0 to focus on Core/React quality.

### Planned Features

- **Server Actions support**: Wrap server actions for consistent client-side flow state.
- **SSR/Hydration handling**: Ensure flow state is preserved across server and client boundaries.
- **Progressive Data Loading**: Integration with React Suspense and Streaming.

---

## 4. Error Handling Gaps (Implemented in v1.0)

### Current Implementation

```typescript
// flow.ts - Current
catch (error) {
  const typedError = error as TError;
  this.setState({ status: "error", error: typedError });
  this.options.onError?.(typedError);
}
```

### Problems

- ❌ No error classification
- ❌ No conditional retry logic
- ❌ All errors treated the same
- ❌ No user-friendly messages

### Enhanced Implementation

#### New types:

```typescript
// Add to flow.ts

export type ErrorType =
  | "network"
  | "validation"
  | "server"
  | "timeout"
  | "abort"
  | "unknown";

export interface ClassifiedError<TError = any> {
  type: ErrorType;
  originalError: TError;
  retryable: boolean;
  userMessage?: string;
  statusCode?: number;
}

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: "fixed" | "linear" | "exponential";
  shouldRetry?: (error: ClassifiedError, attempt: number) => boolean;
}
```

#### Error classifier:

```typescript
// Add to flow.ts

private classifyError(error: any): ClassifiedError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      originalError: error,
      retryable: true,
      userMessage: 'Network error. Please check your connection.',
    };
  }

  // Timeout
  if (error.name === 'AbortError' || error.name === 'TimeoutError') {
    return {
      type: 'timeout',
      originalError: error,
      retryable: true,
      userMessage: 'Request timed out. Please try again.',
    };
  }

  // HTTP errors
  if (error.response) {
    const status = error.response.status;

    if (status >= 400 && status < 500) {
      return {
        type: 'validation',
        originalError: error,
        retryable: false,
        statusCode: status,
        userMessage: error.response.data?.message || 'Invalid request.',
      };
    }

    if (status >= 500) {
      return {
        type: 'server',
        originalError: error,
        retryable: true,
        statusCode: status,
        userMessage: 'Server error. Please try again later.',
      };
    }
  }

  // Unknown
  return {
    type: 'unknown',
    originalError: error,
    retryable: false,
    userMessage: 'An unexpected error occurred.',
  };
}
```

#### Enhanced retry logic:

```typescript
// Update execute() method

while (attempt < maxAttempts) {
  try {
    const data = await this.action(...args);
    // ... success handling
  } catch (error) {
    const classified = this.classifyError(error);

    // Check custom shouldRetry
    const shouldRetry =
      this.options.retry?.shouldRetry?.(classified, attempt) ??
      classified.retryable;

    if (!shouldRetry || attempt >= maxAttempts) {
      this.setState({
        status: "error",
        error: classified as TError,
      });
      this.options.onError?.(classified as TError);
      return;
    }

    // Wait before retry
    await this.wait(attempt);
  }
}
```

---

## 5. Form Integration Gaps (Implemented in v1.0)

### Current Implementation

```typescript
// useFlow.ts - Current
const form = useCallback(
  (props = {}) => {
    return {
      "aria-busy": flow.isLoading,
      onSubmit: async (e) => {
        e.preventDefault();
        await flow.execute(...(arguments as any));
      },
    };
  },
  [flow],
);
```

### Problems

- ❌ Doesn't extract FormData
- ❌ No validation support
- ❌ No field-level errors
- ❌ Type safety issues

### Enhanced Implementation

```typescript
// Add to useFlow.ts

interface FormHelperOptions<TData> {
  /** Extract FormData and pass to action */
  extractFormData?: boolean;
  /** Transform FormData to custom shape */
  transform?: (formData: FormData) => TData;
  /** Validate before submit */
  validate?: (data: TData) => Promise<Record<string, string> | null>;
  /** Reset form on success */
  resetOnSuccess?: boolean;
}

export function useFlow<TData, TError, TArgs extends any[]>(
  action: FlowAction<TData, TArgs>,
  options: FlowOptions<TData, TError> = {},
) {
  // ... existing code ...

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const form = useCallback(
    (formOptions: FormHelperOptions<any> = {}) => {
      return {
        ref: formRef,
        "aria-busy": flow.isLoading,
        onSubmit: async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          setFieldErrors({});

          const form = e.currentTarget;
          const formData = new FormData(form);

          // Extract or transform data
          let data: any;
          if (formOptions.transform) {
            data = formOptions.transform(formData);
          } else if (formOptions.extractFormData) {
            data = Object.fromEntries(formData.entries());
          } else {
            data = formData;
          }

          // Validate
          if (formOptions.validate) {
            const errors = await formOptions.validate(data);
            if (errors) {
              setFieldErrors(errors);
              return;
            }
          }

          // Execute
          const result = await flow.execute(data as any);

          // Reset on success
          if (result && formOptions.resetOnSuccess) {
            form.reset();
          }
        },
      };
    },
    [flow],
  );

  return {
    ...flow,
    form,
    fieldErrors,
    formRef,
  };
}
```

**Usage example:**

```typescript
const flow = useFlow(saveProfile, {
  form: {
    extractFormData: true,
    validate: async (data) => {
      if (!data.email) return { email: 'Email is required' };
      return null;
    },
    resetOnSuccess: true,
  }
});

<form {...flow.form()}>
  <input name="email" />
  {flow.fieldErrors.email && <span>{flow.fieldErrors.email}</span>}
  <button type="submit">Save</button>
</form>
```

---

## 6. Loading State Improvements (Implemented in v1.0)

### Current State

```typescript
// Only basic isLoading boolean
get isLoading() {
  return this._state.status === "loading";
}
```

### Problems

- ❌ Loading flash for fast requests
- ❌ No delayed spinner
- ❌ No progress tracking

### Enhanced Implementation

```typescript
// Add to FlowOptions
export interface LoadingOptions {
  /** Minimum time to show loading state (prevents flash) */
  minDuration?: number; // ms
  /** Delay before showing loading state (skeleton pattern) */
  delay?: number; // ms
}

export interface FlowOptions<TData = any, TError = any> {
  // ... existing options ...
  loading?: LoadingOptions;
}

// Add to FlowState
export interface FlowState<TData = any, TError = any> {
  status: FlowStatus;
  data: TData | null;
  error: TError | null;
  progress?: number; // 0-100
}

// Update Flow class
export class Flow<TData = any, TError = any, TArgs extends any[] = any[]> {
  private loadingStartTime: number | null = null;
  private loadingDelayTimer: any = null;
  private isLoadingDelayed = false;

  async execute(...args: TArgs): Promise<TData | undefined> {
    // ... existing concurrency logic ...

    this.loadingStartTime = Date.now();

    // Handle loading delay
    const loadingDelay = this.options.loading?.delay ?? 0;
    if (loadingDelay > 0) {
      this.isLoadingDelayed = true;
      this.loadingDelayTimer = setTimeout(() => {
        if (this._state.status === "loading") {
          this.isLoadingDelayed = false;
          this.notify();
        }
      }, loadingDelay);
    } else {
      this.setState({ status: "loading", error: null });
    }

    try {
      const data = await this.action(...args);

      // Enforce minimum loading duration
      await this.enforceMinLoadingDuration();

      this.setState({ status: "success", data });
      return data;
    } catch (error) {
      await this.enforceMinLoadingDuration();
      // ... error handling ...
    } finally {
      this.clearLoadingDelay();
    }
  }

  private async enforceMinLoadingDuration() {
    const minDuration = this.options.loading?.minDuration ?? 0;
    if (minDuration > 0 && this.loadingStartTime) {
      const elapsed = Date.now() - this.loadingStartTime;
      const remaining = minDuration - elapsed;
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
    }
  }

  private clearLoadingDelay() {
    if (this.loadingDelayTimer) {
      clearTimeout(this.loadingDelayTimer);
      this.loadingDelayTimer = null;
    }
    this.isLoadingDelayed = false;
  }

  get isLoading() {
    return this._state.status === "loading" && !this.isLoadingDelayed;
  }

  // For progress tracking (e.g., file uploads)
  setProgress(progress: number) {
    if (this._state.status === "loading") {
      this.setState({ progress: Math.min(100, Math.max(0, progress)) });
    }
  }
}
```

**Usage:**

```typescript
const flow = useFlow(uploadFile, {
  loading: {
    minDuration: 300, // Prevent flash
    delay: 200, // Show skeleton first
  }
});

// For uploads
const uploadFlow = useFlow(async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return fetch('/api/upload', {
    method: 'POST',
    body: formData,
    onUploadProgress: (e) => {
      uploadFlow.setProgress((e.loaded / e.total) * 100);
    }
  });
});

// In UI
{uploadFlow.loading && uploadFlow.progress && (
  <ProgressBar value={uploadFlow.progress} />
)}
```

---

## 7. Accessibility Gaps (Implemented in v1.0)

### Current State

```typescript
// useFlow.ts - Current
const errorRef = useRef<HTMLElement | null>(null);

useEffect(() => {
  if (snapshot.status === "error" && errorRef.current) {
    errorRef.current.focus();
  }
}, [snapshot.status]);
```

### Problems

- ❌ No screen reader announcements
- ❌ No live regions
- ❌ Limited ARIA support

### Enhanced Implementation

```typescript
// Add to useFlow.ts

interface A11yOptions {
  /** Announce success to screen readers */
  announceSuccess?: string | ((data: TData) => string);
  /** Announce error to screen readers */
  announceError?: string | ((error: TError) => string);
  /** Auto-focus element on error */
  focusOnError?: boolean;
  /** Live region politeness */
  liveRegion?: 'polite' | 'assertive';
}

export function useFlow<TData, TError, TArgs extends any[]>(
  action: FlowAction<TData, TArgs>,
  options: FlowOptions<TData, TError> & { a11y?: A11yOptions } = {}
) {
  const [announcement, setAnnouncement] = useState('');
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Handle announcements
  useEffect(() => {
    if (snapshot.status === 'success' && options.a11y?.announceSuccess) {
      const message = typeof options.a11y.announceSuccess === 'function'
        ? options.a11y.announceSuccess(snapshot.data)
        : options.a11y.announceSuccess;
      setAnnouncement(message);
    }

    if (snapshot.status === 'error' && options.a11y?.announceError) {
      const message = typeof options.a11y.announceError === 'function'
        ? options.a11y.announceError(snapshot.error)
        : options.a11y.announceError;
      setAnnouncement(message);
    }
  }, [snapshot.status]);

  // Enhanced button helper with ARIA
  const button = useCallback((props = {}) => {
    return {
      disabled: flow.isLoading,
      'aria-busy': flow.isLoading,
      'aria-invalid': flow.isError,
      'aria-describedby': flow.isError ? 'flow-error' : undefined,
      ...props,
    };
  }, [flow]);

  // Live region component
  const LiveRegion = () => (
    <div
      ref={liveRegionRef}
      role="status"
      aria-live={options.a11y?.liveRegion ?? 'polite'}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );

  return {
    ...flow,
    button,
    LiveRegion,
    announcement,
  };
}
```

**Usage:**

```typescript
const flow = useFlow(saveProfile, {
  a11y: {
    announceSuccess: 'Profile saved successfully',
    announceError: (error) => `Error: ${error.message}`,
    focusOnError: true,
    liveRegion: 'polite',
  }
});

<>
  <flow.LiveRegion />
  <button {...flow.button()}>Save Profile</button>
  {flow.error && <div id="flow-error">{flow.error.message}</div>}
</>
```

---

## 8. Testing Utilities Missing

### What's Needed

Create `@asyncflowstate/testing` package:

```typescript
// packages/testing/src/index.ts

import { Flow, FlowState, FlowStatus } from "@asyncflowstate/core";
import { vi } from "vitest";

/**
 * Create a mock Flow instance for testing
 */
export function createMockFlow<TData = any, TError = any>(
  initialState?: Partial<FlowState<TData, TError>>,
): Flow<TData, TError> {
  const mockAction = vi.fn().mockResolvedValue(initialState?.data ?? null);
  const flow = new Flow(mockAction);

  if (initialState) {
    // @ts-ignore - accessing private state for testing
    flow._state = {
      status: "idle",
      data: null,
      error: null,
      ...initialState,
    };
  }

  return flow;
}

/**
 * Wait for flow to reach a specific status
 */
export async function waitForFlow<TData, TError>(
  flow: Flow<TData, TError>,
  status: FlowStatus,
  timeout = 5000,
): Promise<FlowState<TData, TError>> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(`Flow did not reach status "${status}" within ${timeout}ms`),
      );
    }, timeout);

    const unsubscribe = flow.subscribe((state) => {
      if (state.status === status) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(state);
      }
    });

    // Check current state
    if (flow.status === status) {
      clearTimeout(timeoutId);
      unsubscribe();
      resolve(flow.state);
    }
  });
}

/**
 * Custom matchers for Vitest
 */
export const flowMatchers = {
  toBeLoading(flow: Flow) {
    return {
      pass: flow.isLoading,
      message: () =>
        `Expected flow to be loading, but status was "${flow.status}"`,
    };
  },
  toBeSuccess(flow: Flow) {
    return {
      pass: flow.isSuccess,
      message: () =>
        `Expected flow to be success, but status was "${flow.status}"`,
    };
  },
  toBeError(flow: Flow) {
    return {
      pass: flow.isError,
      message: () =>
        `Expected flow to be error, but status was "${flow.status}"`,
    };
  },
};
```

**Usage in tests:**

```typescript
import {
  createMockFlow,
  waitForFlow,
  flowMatchers,
} from "@asyncflowstate/testing";
import { expect } from "vitest";

expect.extend(flowMatchers);

test("should handle success", async () => {
  const flow = createMockFlow({ status: "idle" });

  const promise = flow.execute();
  expect(flow).toBeLoading();

  await waitForFlow(flow, "success");
  expect(flow).toBeSuccess();
  expect(flow.data).toBe("test");
});
```

---

## Summary of Technical Gaps

| Gap                   | Severity     | Effort | Priority |
| --------------------- | ------------ | ------ | -------- |
| Package.json metadata | 🔴 Critical  | Low    | 1        |
| Build pipeline        | 🔴 Critical  | Low    | 1        |
| Next.js package       | 🔴 Critical  | High   | 2        |
| Documentation         | 🔴 Critical  | High   | 1        |
| Examples              | 🔴 Critical  | High   | 1        |
| Error classification  | 🟡 Important | Medium | 3        |
| Form integration      | 🟡 Important | Medium | 3        |
| Loading improvements  | 🟡 Important | Low    | 4        |
| Accessibility         | 🟡 Important | Medium | 4        |
| Testing utilities     | 🟡 Important | Medium | 5        |

**Next Steps:**

1. Fix package.json files (30 min)
2. Set up build pipeline with tsup (1 hour)
3. Write documentation (2-3 days)
4. Create examples (3-4 days)
5. Implement Next.js package (2-3 days)
6. Add enhancements (1-2 weeks)
