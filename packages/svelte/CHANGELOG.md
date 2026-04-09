# @asyncflowstate/svelte

## 2.0.0

### Major Changes

- 🎉 Initial release of `@asyncflowstate/svelte` — Official Svelte bindings for AsyncFlowState.
- `createFlow()` — Svelte store with full lifecycle control and auto-subscription via `$`.
- `createFlowSequence()` for orchestrating sequential workflows.
- `createFlowParallel()` for running flows in parallel with aggregate state.
- `createFlowList()` for managing multiple keyed flow instances.
- Compatible with Svelte 4 (stores) and Svelte 5 (runes).
- Full TypeScript support with generics.
- Auto-revalidation on focus and reconnect.
