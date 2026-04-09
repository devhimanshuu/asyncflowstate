# @asyncflowstate/solid

## 3.0.0

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

- 🎉 Initial release of `@asyncflowstate/solid` — Official SolidJS bindings for AsyncFlowState.
- `createFlow()` — Fine-grained reactive primitive with full lifecycle control.
- `createFlowSequence()` for orchestrating sequential workflows.
- `createFlowParallel()` for running flows in parallel with aggregate state.
- `createFlowList()` for managing multiple keyed flow instances.
- `FlowProvider` for global configuration via SolidJS context.
- Automatic cleanup via `onCleanup`.
- Full TypeScript support with generics.
- Schema validation support (Zod, Valibot, Yup).
- Auto-revalidation on focus and reconnect.
