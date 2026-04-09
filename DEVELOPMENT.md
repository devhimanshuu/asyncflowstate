# Development Guide - AsyncFlowState

This guide covers development setup, project structure, and contribution guidelines for AsyncFlowState.

## Project Structure

```
asyncflowstate/
├── packages/
│   ├── core/                    # Framework-agnostic core engine
│   │   ├── src/
│   │   │   ├── __tests__/       # Core engine tests
│   │   │   ├── hooks/           # [Future: Custom hooks]
│   │   │   ├── components/      # [Future: Helper components]
│   │   │   ├── types/           # Type definitions
│   │   │   ├── utils/           # Utility functions
│   │   │   ├── flow.ts          # Main Flow class
│   │   │   ├── sequence.ts      # Sequential execution
│   │   │   ├── parallel.ts      # Parallel execution
│   │   │   └── index.ts         # Main exports
│   │   ├── dist/                # Compiled output
│   │   ├── package.json
│   │   ├── API.md               # API reference
│   │   ├── CHANGELOG.md         # Version history
│   │   └── .env.example         # Environment template
│   │
│   ├── react/                   # Official React bindings
│   │   ├── src/
│   │   │   ├── __tests__/       # React component tests
│   │   │   ├── hooks/           # React hooks
│   │   │   ├── components/      # React components
│   │   │   ├── types/           # Type definitions
│   │   │   ├── utils/           # Utility functions
│   │   │   └── index.ts         # Main exports
│   │   ├── dist/                # Compiled output
│   │   ├── package.json
│   │   ├── API.md               # Hook & Component API
│   │   ├── CHANGELOG.md         # Version history
│   │   └── .env.example         # Environment template
│   │
│   └── next/                    # Next.js integration
│       ├── src/
│       │   ├── __tests__/       # Next.js tests
│       │   ├── hooks/           # Next.js specific hooks
│       │   ├── types/           # Type definitions
│       │   ├── utils/           # Utility functions
│       │   └── index.ts         # Main exports
│       ├── dist/                # Compiled output
│       ├── package.json
│       ├── API.md               # Server Actions & Transitions API
│       ├── CHANGELOG.md         # Version history
│       └── .env.example         # Environment template
│
├── docs/                        # VitePress Documentation (Main Site)
│   ├── .vitepress/              # Site config and theme
│   ├── api/                     # Developer API references
│   ├── examples/                # Interactive examples
│   ├── frameworks/              # Framework specific guides
│   ├── guide/                   # Core architectural guides
│   ├── public/                  # Assets and icons
│   └── index.md                 # Landing page
│
├── examples/                    # Example projects
│   ├── core/                    # Core engine examples
│   ├── react/                   # React examples
│   └── next/                    # Next.js examples
│
├── .github/                     # GitHub workflows & templates
├── .vscode/                     # VS Code settings
├── vitest.config.ts            # Test configuration
├── vitest.setup.ts             # Test utilities & setup
├── eslint.config.mjs           # Linting rules
├── tsconfig.base.json          # Shared TypeScript config
├── package.json                # Root package.json
├── .npmrc                       # NPM configuration
├── .env.example                # Environment template
└── CONTRIBUTING.md             # Contribution guidelines
```

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install

# Install in specific package
cd packages/core
pnpm install
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test

# Run tests for specific package
cd packages/react
pnpm test

# Run with coverage
pnpm test:coverage
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
cd packages/core
pnpm build

# Watch mode
pnpm dev
```

### Linting & Type Checking

```bash
# Lint files
pnpm lint

# Type check (all packages)
pnpm typecheck

# Fix linting issues
pnpm lint:fix
```

## File Organization Best Practices

### Source Code Structure

- **`__tests__/`** - All test files (`.test.ts`, `.test.tsx`)
- **`hooks/`** - React hooks (React package only)
- **`components/`** - React components (React package only)
- **`types/`** - TypeScript type definitions and interfaces
- **`utils/`** - Utility functions and helpers
- **`index.ts`** - Main export file (re-exports from subdirectories)

### Naming Conventions

- **Files**: kebab-case (e.g., `useFlow.tsx`, `error-utils.ts`)
- **Directories**: kebab-case (e.g., `__tests__`, `types`, `utils`)
- **Classes**: PascalCase (e.g., `Flow`, `FlowProvider`)
- **Functions/Hooks**: camelCase or PascalCase for components (e.g., `useFlow`, `FlowProvider`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### Test File Naming

- Place alongside source with `.test.ts` or `.test.tsx` suffix
- Example: `src/__tests__/useFlow.test.tsx` for `src/hooks/useFlow.tsx`

## Contribution Workflow

1. **Create a branch**: `git checkout -b feature/my-feature`
2. **Make changes**: Follow the file organization guidelines
3. **Write tests**: Add tests in `__tests__/` directory
4. **Run tests**: Ensure all tests pass with `pnpm test`
5. **Lint code**: Run `pnpm lint:fix` to format code
6. **Type check**: Run `pnpm typecheck`
7. **Commit**: Use conventional commits (e.g., `feat:`, `fix:`, `refactor:`)
8. **Push and PR**: Submit a pull request

## Writing Code

### TypeScript

- Always use TypeScript
- Avoid `any` type - use proper typing
- Export types and interfaces from type definition files
- Use strict mode in `tsconfig.json`

### React Components

```typescript
// Example component with proper structure
import { ReactNode, memo } from "react";
import type { FlowState } from "@asyncflowstate/core";

interface MyComponentProps {
  status: FlowState;
  children?: ReactNode;
}

export const MyComponent = memo<MyComponentProps>(
  ({ status, children }) => {
    return <div>{children}</div>;
  }
);

MyComponent.displayName = "MyComponent";
```

### Hooks

```typescript
// Example hook structure
import { useCallback, useState, useEffect } from "react";

export function useMyHook(dependency: string) {
  const [state, setState] = useState<MyState | null>(null);

  const update = useCallback(() => {
    // Implementation
  }, [dependency]);

  useEffect(() => {
    update();
  }, [update]);

  return { state, update };
}
```

### Testing

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

describe("useMyHook", () => {
  it("should initialize with correct state", () => {
    const { result } = renderHook(() => useMyHook("test"));
    expect(result.current.state).toBeDefined();
  });
});
```

## Debugging

### Enable Debug Mode

```typescript
// In your code
const DEBUG = true;

if (DEBUG) {
  console.log("Debug info:", data);
}

// Or via environment
if (process.env.DEBUG === "true") {
  // Debug code
}
```

### VSCode Debug Configuration

A `.vscode/launch.json` file is provided. Use F5 to start debugging.

## Documentation

- Update `API.md` in package when adding new public APIs
- Update `CHANGELOG.md` with version notes
- Add examples in `examples/` directory
- Update main documentation in `documentation/content/`

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (x.Y.0): New features (backwards compatible)
- **PATCH** (x.y.Z): Bug fixes

Update CHANGELOG.md before releasing.

## Publishing

Only maintainers can publish to npm.

```bash
# Build all packages
pnpm build

# Publish (requires npm credentials)
pnpm publish:packages
```

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000
```

### Dependency Issues

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Type Errors

```bash
# Regenerate types
pnpm typecheck
```

## Resources

- [Main Documentation Web](../docs/)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [AsyncFlowState API Reference](../packages/core/API.md)
- [React Hooks API](../packages/react/API.md)
- [Next.js API](../packages/next/API.md)

## Getting Help

- Check [documentation](../documentation/)
- Review [examples](../examples/)
- Open an [issue](../../issues)
- Join discussions in [GitHub Discussions](../../discussions)
