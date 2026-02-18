# React Package API

## Overview

`@asyncflowstate/react` provides React-first wrappers around the core `Flow` engine.

## Hooks

### `useFlow(action, options?)`

Main hook for a single async flow.

Returns:

- `status`: `"idle" | "loading" | "streaming" | "success" | "error"`
- `data`, `error`, `progress`
- `loading` / `isLoading`
- `isSuccess`, `isError`
- `execute(...args)`, `reset()`, `cancel()`, `setProgress(value)`
- `button(props?)`
- `form(options?)`
- `fieldErrors`
- `errorRef`
- `LiveRegion`
- `flow` (core instance)
- `signals`

### `useFlowParallel(input, strategy?)`

React wrapper over `FlowParallel`.

Returns aggregate state plus:

- `execute(...args)`
- `reset()`
- `cancel()`
- `loading`

### `useFlowSequence(steps)`

React wrapper over `FlowSequence`.

Returns sequence state plus:

- `execute(initialInput?)`
- `reset()`
- `cancel()`
- `loading`
- `currentStep`

### `useFlowList(action, options?)`

Manages keyed flow instances.

Returns:

- `execute(id, ...args)`
- `reset(id)`
- `cancel(id)`
- `getStatus(id)`
- `states`
- `isAnyLoading`

### `useInfiniteFlow(action, options)`

Pagination helper built on top of `useFlow`.

Returns:

- all `useFlow` fields
- `pages`
- `pageParams`
- `hasNextPage`
- `isFetchingNextPage`
- `fetchNextPage()`
- `refetch()`
- `reset()`

### `useFlowSuspense(action, options?)`

Suspense-aware `useFlow`:

- throws Promise while loading
- throws error in error state
- returns normal `useFlow` result otherwise

## Components

### `FlowProvider`

Provides global flow config via context.

Supports:

- global retry/loading/autoReset defaults
- global lifecycle callbacks
- global middleware via `behaviors`
- merge/replace mode via `overrideMode`

### `FlowNotificationProvider`

Subscribes to global `Flow` events and exposes:

- `onSuccess(event)`
- `onError(event)`

### `FlowDebugger`

Dev/debug UI for global flow events and timeline inspection.

### `ProgressiveFlow`

Progressive enhancement wrapper for form/link interaction with `useFlow`.

## Exports

`@asyncflowstate/react` re-exports all public APIs from `@asyncflowstate/core`.
