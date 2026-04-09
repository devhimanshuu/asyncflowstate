# Angular Services

Complete API reference for `@asyncflowstate/angular`.

## createFlow

Core factory function for generating flow state containers with RxJS observable support.

```ts
function createFlow<TInput, TOutput>(
  action: (...args: TInput[]) => Promise<TOutput>,
  options?: FlowOptions<TInput, TOutput>,
): AngularFlow<TInput, TOutput>;
```

### Properties

| Property  | Type                         | Description                               |
| --------- | ---------------------------- | ----------------------------------------- |
| `state$`  | `BehaviorSubject<FlowState>` | Observable stream of state updates        |
| `status`  | `FlowStatus`                 | Current snapshot: `idle`, `loading`, etc. |
| `loading` | `boolean`                    | Current snapshot of loading state         |
| `data`    | `TOutput \| null`            | Current snapshot of data                  |
| `error`   | `Error \| null`              | Current snapshot of error                 |

### Methods

| Method    | Type                      | Description            |
| --------- | ------------------------- | ---------------------- |
| `execute` | `(...args) => Promise<T>` | Run the action         |
| `reset`   | `() => void`              | Reset state            |
| `destroy` | `() => void`              | Clean up subscriptions |

---

## flowConfigProvider

Sets global configuration for the Angular application using standard DI providers.

```ts
// app.module.ts or app.config.ts
import { provideFlowConfig } from "@asyncflowstate/angular";

providers: [
  provideFlowConfig({
    retry: { maxAttempts: 3 },
    loading: { minDuration: 400 },
  }),
];
```

---

## createFlowSequence

Executes incremental steps with isolated states, exposed as an observable sequence.

```ts
const sequence = createFlowSequence(steps);
// sequence.state$ | async
```
