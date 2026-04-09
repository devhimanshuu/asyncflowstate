# Getting Started

<StateAnimation />

## Prerequisites

- Node.js ≥ 16.0.0
- A project using React, Vue, Svelte, Angular, SolidJS, or vanilla JS

## Installation

Choose the package for your framework:

::: code-group

```bash [React]
npm install @asyncflowstate/react @asyncflowstate/core
```

```bash [Next.js]
npm install @asyncflowstate/next @asyncflowstate/react @asyncflowstate/core
```

```bash [Vue]
npm install @asyncflowstate/vue @asyncflowstate/core
```

```bash [Svelte]
npm install @asyncflowstate/svelte @asyncflowstate/core
```

```bash [Angular]
npm install @asyncflowstate/angular @asyncflowstate/core
```

```bash [SolidJS]
npm install @asyncflowstate/solid @asyncflowstate/core
```

:::

::: tip Using pnpm?
Replace `npm install` with `pnpm add` in the commands above.
:::

## Your First Flow

### React

```tsx
import { useFlow } from "@asyncflowstate/react";

function SaveButton() {
  const flow = useFlow(async (data) => {
    return await api.save(data);
  });

  return (
    <button {...flow.button()}>
      {flow.loading ? "Saving..." : "Save Changes"}
    </button>
  );
}
```

That's it. With one hook, you get:

- <i class="fa-solid fa-circle-check text-brand mr-2"></i> Automatic loading state
- <i class="fa-solid fa-circle-check text-brand mr-2"></i> Double-click prevention (button is disabled while loading)
- <i class="fa-solid fa-circle-check text-brand mr-2"></i> ARIA attributes for accessibility
- <i class="fa-solid fa-circle-check text-brand mr-2"></i> Error state management

### What `flow.button()` Returns

The `button()` helper generates the props your button needs:

```ts
{
  onClick: () => flow.execute(),
  disabled: flow.loading,
  "aria-busy": flow.loading,
  "aria-disabled": flow.loading,
}
```

## Adding Error Handling

```tsx
function SaveButton() {
  const flow = useFlow(async (data) => api.save(data), {
    onSuccess: () => toast.success("Saved!"),
    onError: (err) => toast.error(err.message),
  });

  return (
    <div>
      <button {...flow.button()}>{flow.loading ? "Saving..." : "Save"}</button>
      {flow.error && (
        <p ref={flow.errorRef} role="alert">
          {flow.error.message}
        </p>
      )}
    </div>
  );
}
```

## Form Handling

```tsx
import { z } from "zod";

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
});

function ProfileForm() {
  const flow = useFlow(updateProfile);

  return (
    <form {...flow.form({ schema, extractFormData: true })}>
      <input name="username" />
      {flow.fieldErrors.username && <span>{flow.fieldErrors.username}</span>}

      <input name="email" />
      {flow.fieldErrors.email && <span>{flow.fieldErrors.email}</span>}

      <button type="submit" disabled={flow.loading}>
        Submit
      </button>
    </form>
  );
}
```

## Global Configuration

Wrap your app with `FlowProvider` to set defaults for all flows:

```tsx
import { FlowProvider } from "@asyncflowstate/react";

function App() {
  return (
    <FlowProvider
      config={{
        onError: (err) => toast.error(err.message),
        retry: { maxAttempts: 3, backoff: "exponential" },
        loading: { minDuration: 400 },
      }}
    >
      <YourApp />
    </FlowProvider>
  );
}
```

## Next Steps

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px;">

- <i class="fa-solid fa-book" style="margin-right: 8px; opacity: 0.8;"></i> [Core Engine →](/guide/core-engine)
- <i class="fa-brands fa-react" style="margin-right: 8px; opacity: 0.8;"></i> [React Integration →](/frameworks/react/)
- <i class="fa-solid fa-terminal" style="margin-right: 8px; opacity: 0.8;"></i> [Next.js Integration →](/frameworks/next/nextjs)
- <i class="fa-solid fa-gear" style="margin-right: 8px; opacity: 0.8;"></i> [Configuration →](/guide/configuration)
- <i class="fa-solid fa-repeat" style="margin-right: 8px; opacity: 0.8;"></i> [Retry & Error Handling →](/guide/retry-error-handling)
- <i class="fa-solid fa-list-check" style="margin-right: 8px; opacity: 0.8;"></i> [Examples →](/examples/)

</div>
