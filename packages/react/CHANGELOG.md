# Changelog - @asyncflowstate/react

## 1.0.1

### Patch Changes

- First release of AsyncFlowState
- Updated dependencies
  - @asyncflowstate/core@1.0.1

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-11

### Added

- Initial release of AsyncFlowState React integration
- `useFlow` hook for managing async operations in React
- `useFlowParallel` hook for concurrent async operations
- `useFlowSequence` hook for sequential async operations
- `useFlowList` hook for managing lists with async operations
- `useInfiniteFlow` hook for infinite scrolling and pagination
- `useFlowSuspense` hook for React Suspense integration
- `FlowProvider` component for global flow state management
- `FlowDebugger` component for development and debugging
- `FlowNotificationProvider` for toast-like notifications
- `ProgressiveFlow` component for progressive rendering
- Full TypeScript support
- React 18+ compatibility
- Accessibility features (ARIA labels, roles)
- Performance optimizations with memoization

### Features

- Declarative async state management
- Built-in loading and error states
- Automatic cleanup on unmount
- Error boundaries support
- Suspense compatibility
- Global notification system
- DevTools integration
- Form integration helpers
- Optimistic UI patterns support

## [Unreleased]

### Planned Features

- Enhanced performance monitoring
- Streaming integration
- Advanced caching strategies
- Component composition patterns

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.
