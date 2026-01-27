# Contributing to AsyncFlowState

Thank you for your interest in contributing to AsyncFlowState! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Quality Standards](#code-quality-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- pnpm >= 10.28.0

### Installation

```bash
# Clone the repository
git clone https://github.com/devhimanshuu/asyncflowstate.git
cd asyncflowstate

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Project Structure

```
asyncflowstate/
├── packages/
│   ├── core/          # Framework-agnostic core engine
│   └── react/         # React hooks and components
├── examples/          # Usage examples
└── .github/           # GitHub workflows and configurations
```

## Development Workflow

### Running in Development Mode

```bash
# Watch mode for all packages
pnpm dev

# Watch mode for specific package
pnpm --filter @asyncflowstate/core dev
pnpm --filter @asyncflowstate/react dev
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:core
pnpm build:react
```

### Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run tests with coverage
pnpm test:coverage
```

## Code Quality Standards

We maintain high code quality standards to ensure the codebase is maintainable and professional.

### TypeScript

- Use TypeScript strict mode
- Provide proper type annotations for public APIs
- Avoid `any` types unless absolutely necessary
- Use generics for reusable components

### Code Style

We use ESLint and Prettier for code formatting and linting.

```bash
# Check code style
pnpm lint
pnpm format:check

# Auto-fix issues
pnpm lint:fix
pnpm format
```

**Key conventions:**

- Use 2 spaces for indentation
- Use double quotes for strings
- Always use semicolons
- Use trailing commas
- Max line length: 80 characters

### Documentation

- All public APIs must have JSDoc comments
- Include `@example` tags for complex functions
- Document parameters with `@param`
- Document return values with `@returns`
- Add `@throws` for functions that may throw errors

**Example:**

````typescript
/**
 * Executes an async action with state management.
 *
 * @param action - The async function to execute
 * @param options - Configuration options
 * @returns Promise resolving to action result
 *
 * @example
 * ```ts
 * const flow = new Flow(fetchData);
 * await flow.execute();
 * ```
 */
````

### File Organization

- One class/interface per file for major exports
- Group related utilities in a single file
- Use `index.ts` for clean public exports
- Keep files under 600 lines when possible

## Testing Guidelines

### Writing Tests

- Write tests for all new features
- Maintain or improve code coverage
- Test edge cases and error conditions
- Use descriptive test names

```typescript
describe("Flow", () => {
  it("should transition to loading state when executing", async () => {
    // Arrange
    const flow = new Flow(async () => "data");

    // Act
    const promise = flow.execute();

    // Assert
    expect(flow.status).toBe("loading");
    await promise;
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Focus on critical paths and edge cases
- Test both success and failure scenarios

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(core): add progress tracking support

Implement setProgress method and progress state management.
Allows tracking upload/download progress.

Closes #123
```

```bash
fix(react): prevent memory leak in useFlow hook

Ensure flow subscription is properly cleaned up on unmount.
```

## Pull Request Process

1. **Fork and Branch**
   - Fork the repository
   - Create a feature branch: `git checkout -b feat/your-feature`

2. **Make Changes**
   - Write code following our standards
   - Add/update tests
   - Update documentation if needed

3. **Verify Quality**

   ```bash
   pnpm typecheck    # Check types
   pnpm lint         # Check linting
   pnpm test:run     # Run tests
   pnpm build        # Ensure builds succeed
   ```

4. **Commit**
   - Use conventional commit messages
   - Keep commits focused and atomic

5. **Push and Create PR**

   ```bash
   git push origin feat/your-feature
   ```

   - Create a pull request on GitHub
   - Fill out the PR template completely
   - Link related issues

6. **Code Review**
   - Address review feedback promptly
   - Keep PR scope focused
   - Be open to suggestions

7. **Merge**
   - Squash commits when merging
   - Ensure CI passes
   - Delete branch after merge

## Release Process

We use [Changesets](https://github.com/changesets/changesets) for version management.

### Creating a Changeset

```bash
pnpm changeset
```

Follow the prompts to:

1. Select affected packages
2. Choose version bump type (major/minor/patch)
3. Write a summary of changes

### Publishing (Maintainers Only)

```bash
pnpm version-packages  # Updates versions
pnpm release           # Builds and publishes
```

## Questions?

- Open an issue for bug reports or feature requests
- Start a discussion for questions or ideas
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AsyncFlowState! 🎉
