# @asyncflowstate/solid

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
