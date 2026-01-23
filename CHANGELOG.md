# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-01-23

### Added

- **FlowProvider**: Global configuration system for React applications
  - `FlowProvider` component for setting default options across all flows
  - `useFlowContext` hook for accessing global configuration
  - Intelligent option merging with local options taking precedence
  - Support for nested providers with different configurations
  - Two merge modes: `merge` (default) and `replace`
  - Comprehensive test suite with 9 new tests
  - Full documentation and examples in `examples/react/flow-provider-examples.tsx`

### Changed

- Updated `useFlow` to automatically consume and merge global configuration from FlowProvider
- Improved build configuration: enabled `dts: true` in tsup for automatic declaration generation
- Simplified TypeScript configuration by removing composite project settings
- Updated build scripts to use only `tsup` (removed redundant `tsc` calls)

### Fixed

- Resolved TypeScript compilation issues with declaration file generation
- Fixed module resolution conflicts in monorepo setup

## [1.0.0] - 2026-01-18

### Added

- **Core Engine**:
  - `Flow` class for managing async action lifecycles.
  - Support for `loading`, `success`, `error`, and `idle` states.
  - Configurable `retry` logic with fixed, linear, and exponential backoff.
  - Concurrency management (`keep` and `restart` strategies).
  - Optimistic UI support via `optimisticResult`.
  - Automatic state reset via `autoReset`.
  - Perception controls: `minDuration` and `delay`.
  - Progress tracking via `setProgress`.
- **React Integration**:
  - `useFlow` hook for seamless state management.
  - `button()` and `form()` helpers for low-boilerplate UI integration.
  - Automatic `FormData` extraction and validation in forms.
  - Accessibility first: ARIA live regions and automatic error focus management.
- **Documentation**:
  - Comprehensive READMEs for root and packages.
  - Categorized examples for Core and React.
  - Full JSDoc documentation for all public APIs.
- **Infrastructure**:
  - Monorepo setup with `pnpm` workspaces.
  - Build pipeline using `tsup` and `tsc`.
  - Full test suite with Vitest.
