# Changelog - @asyncflowstate/core

## 2.0.1

### Minor Changes

- update documentation links

## 1.0.1

### Patch Changes

- First release of AsyncFlowState

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-11

### Added

- Initial release of AsyncFlowState core engine
- Framework-agnostic flow orchestration system
- Support for sequential, parallel, and complex async flows
- Built-in error handling and retry logic
- Flow state management (idle, pending, success, error, cancelled)
- Middleware system for flow interception
- Persistence utilities for state management
- Testing utilities and helpers
- TypeScript support with full type safety
- BroadcastChannel API support for cross-tab synchronization

### Features

- `Flow` class for managing async operations
- `sequence()` for sequential task execution
- `parallel()` for concurrent task execution
- Automatic error handling with customizable behavior
- Built-in retry mechanisms
- Event emission for lifecycle hooks
- Storage persistence API
- Testing utilities for mock flows

## [Unreleased]

### Planned Features

- Advanced scheduling options
- Performance metrics collection
- Enhanced middleware capabilities
- Plugin system for extensions

## Versioning

This package follows semantic versioning. Breaking changes will be announced in the CHANGELOG before release.

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.
