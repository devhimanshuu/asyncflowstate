# @asyncflowstate/svelte

## 3.0.0

### Major Changes

- **Universal v3.0 Launch**: Full support for Flow DNA, Speculative Execution, and Collaborative Mesh networks.
- **Enhanced Framework Integration**: Performance optimizations and new framework-specific primitives for AI features.
- **Improved Resiliency**: Built-in self-healing and ambient failure pre-emption.

## 2.0.2

### Major Changes

- final v2.0.2 release

### Patch Changes

- Updated dependencies
  - @asyncflowstate/core@2.0.2

## 2.0.1

### Minor Changes

- update documentation links

### Patch Changes

- Updated dependencies
  - @asyncflowstate/core@2.1.0

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
