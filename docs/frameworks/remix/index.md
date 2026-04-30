# <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" style="width: 42px; height: 42px; display: inline-block; margin-right: 12px; vertical-align: middle; filter: grayscale(1) invert(0.5) sepia(1) hue-rotate(180deg) saturate(3);" alt="Remix Logo" /> Remix Integration

The `@asyncflowstate/remix` package provides specialized hooks for Remix applications, bridging the gap between Remix's Action/Loader lifecycle and AsyncFlowState's declarative loading engine.

## Installation

```bash
npm install @asyncflowstate/remix @asyncflowstate/react @asyncflowstate/core
```

## useActionFlow

The `useActionFlow` hook is designed to manage Remix **Server Actions**. It provides high-level control over form submissions, loading states, and result handling.

### Example

```tsx
import { useActionFlow } from "@asyncflowstate/remix";

export default function SearchPage() {
  // Integrates with Remix's useSubmit and useNavigation
  const { loading, data, error, form } = useActionFlow({
    onSuccess: (data) => console.log("Action completed:", data),
  });

  return (
    <form {...form({ extractFormData: true })} action="/search">
      <input name="q" placeholder="Search..." />
      <button type="submit" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
```

## Key Benefits in Remix

### 1. Unified Navigation State

Remix uses `useNavigation` to track global navigation. `useActionFlow` hooks into this state automatically, providing a single `loading` boolean that stays true until the action is fully settled and the page has been revalidated.

### 2. Form Method Compatibility

Works seamlessly with Remix's `method="post"` and standard HTML forms. The `form()` helper ensures that only one submission happens at a time, even if the user spam-clicks the submit button.

### 3. Handling Action Data

Access Remix's `actionData` directly through the flow's `data` property, with the added benefit of AI-healing and predictive prefetching support.

## Best Practices

Building a professional async experience in Remix requires deep integration with its router. Follow these patterns for the best results.

### <i class="fa-solid fa-code-merge text-brand-1 mr-2"></i> Form Integration

::: tip Form Helper
Always spread `{...form()}` onto your Remix `<form>` or `<Form>` tags. This automatically wires up AsyncFlowState's spam-prevention, focus management, and optimistic UI logic without conflicting with Remix's native submission engine.
:::

### <i class="fa-solid fa-face-smile text-cyan-500 mr-2"></i> User Experience

::: tip Sentiment Analysis
Turn on `sentiment: true` for long checkout or onboarding forms. If a user is struggling with validation errors (rage clicking), the engine can track the sentiment and trigger a simplified UI.
:::

### <i class="fa-solid fa-layer-group text-purple-400 mr-2"></i> Architectural Patterns

::: info Action/Loader Split
Use `useActionFlow` specifically for mutations (`POST`, `PUT`, `DELETE`), and leverage `useLoaderFlow` (or native Loaders) for highly dynamic client-side data fetching that supplements your server Loaders.
:::
