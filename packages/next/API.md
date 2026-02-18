# Next Package API

## Overview

`@asyncflowstate/next` adds Next.js-focused hooks on top of `@asyncflowstate/react`.

## Hooks

### `useServerActionFlow(action, options?)`

Thin wrapper over `useFlow` for Server Action usage.

Returns the same API shape as `useFlow`, including:

- `status`, `data`, `error`, `loading`, `progress`
- `execute(...args)`, `reset()`, `cancel()`, `setProgress()`
- `button()`, `form()`, `LiveRegion`, `errorRef`, `fieldErrors`
- `flow`, `signals`

### `useTransitionFlow(action, options?)`

Wraps flow execution in React transition APIs and integrates router refresh behavior.

Additional options:

- `refresh?: boolean`
- `revalidatePath?: string`
- `revalidateTag?: string`
- `scrollToTop?: boolean`

Additional return fields:

- `isPending` (flow loading OR transition pending)
- `isTransitionPending`
- `execute(...args)` (transition-wrapped)

## Re-exports

`@asyncflowstate/next` also re-exports:

- all public APIs from `@asyncflowstate/core`
- all public APIs from `@asyncflowstate/react`
