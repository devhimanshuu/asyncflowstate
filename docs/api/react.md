# React API Reference

Complete API reference for `@asyncflowstate/react`.

## useFlow

```ts
function useFlow<TInput, TOutput>(
  action: (...args: TInput[]) => Promise<TOutput>,
  options?: ReactFlowOptions<TInput, TOutput>,
): UseFlowResult<TInput, TOutput>;
```

### Parameters

| Parameter | Type                      | Description                |
| --------- | ------------------------- | -------------------------- |
| `action`  | `(...args) => Promise<T>` | The async function to wrap |
| `options` | `ReactFlowOptions`        | Configuration (optional)   |

### Return Value

```ts
interface UseFlowResult<TInput, TOutput> {
  // State
  status: "idle" | "loading" | "success" | "error";
  loading: boolean;
  data: TOutput | null;
  error: Error | null;
  idle: boolean;
  success: boolean;
  failed: boolean;

  // Actions
  execute: (...args: TInput[]) => Promise<TOutput>;
  reset: () => void;
  retry: () => Promise<TOutput>;
  setOptions: (opts: Partial<FlowOptions>) => void;

  // Helpers
  button: (overrides?: object) => ButtonProps;
  form: (opts?: FormHelperOptions) => FormProps;

  // Validation
  fieldErrors: Record<string, string>;

  // Accessibility
  errorRef: React.Ref<HTMLElement>;

  // Metadata
  executionCount: number;
  retryCount: number;
  progress: number;
}
```

---

## button()

Returns accessible props for button elements.

```ts
flow.button(overrides?: Partial<ButtonHTMLAttributes>): {
  onClick: () => void;
  disabled: boolean;
  "aria-busy": boolean;
  "aria-disabled": boolean;
  ...overrides;
}
```

### Usage

```tsx
// Basic
<button {...flow.button()}>Submit</button>

// With overrides
<button {...flow.button({ className: "primary-btn" })}>Submit</button>

// Custom onClick
<button {...flow.button({ onClick: () => flow.execute(customData) })}>
  Submit
</button>
```

---

## form()

Returns props for form elements with optional validation.

```ts
flow.form(options?: FormHelperOptions): {
  onSubmit: (e: FormEvent) => void;
  "aria-busy": boolean;
}
```

### FormHelperOptions

| Option            | Type                         | Description                   |
| ----------------- | ---------------------------- | ----------------------------- |
| `schema`          | `ZodSchema \| ValibotSchema` | Validation schema             |
| `extractFormData` | `boolean`                    | Auto-extract FormData entries |
| `resetOnSuccess`  | `boolean`                    | Reset form after success      |
| `focusFirstError` | `boolean`                    | Focus first invalid field     |

---

## FlowProvider

```tsx
<FlowProvider config={FlowProviderConfig}>{children}</FlowProvider>
```

### FlowProviderConfig

Extends `FlowOptions` with:

| Option         | Type                   | Default   | Description                            |
| -------------- | ---------------------- | --------- | -------------------------------------- |
| `overrideMode` | `"merge" \| "replace"` | `"merge"` | How local options interact with global |

### useFlowContext

Access the current provider config:

```ts
import { useFlowContext } from "@asyncflowstate/react";

const config = useFlowContext();
```

---

## ReactFlowOptions

Extends `FlowOptions` with React-specific settings:

```ts
interface ReactFlowOptions<TInput, TOutput> extends FlowOptions<
  TInput,
  TOutput
> {
  a11y?: {
    announceSuccess?: string | ((data: TOutput) => string);
    announceError?: string | ((error: Error) => string);
    liveRegionRel?: "polite" | "assertive";
  };
}
```

---

## useFlowSequence

```ts
function useFlowSequence(steps: FlowStep[]): {
  execute: (input: any) => Promise<any>;
  loading: boolean;
  currentStep: number;
  error: Error | null;
  data: any;
  reset: () => void;
};
```

## useFlowParallel

```ts
function useFlowParallel(flows: UseFlowResult[]): {
  execute: () => Promise<any[]>;
  loading: boolean;
  data: any[];
  error: Error | null;
  progress: number;
};
```
