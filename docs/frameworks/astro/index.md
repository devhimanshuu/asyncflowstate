# <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/astro/astro-original.svg" style="width: 42px; height: 42px; display: inline-block; margin-right: 12px; vertical-align: middle;" alt="Astro Logo" /> Astro Integration

The `@asyncflowstate/astro` package brings declarative async flow management to Astro 4+ **Actions**.

## Installation

```bash
npm install @asyncflowstate/astro @asyncflowstate/core
```

## createAstroFlow

Astro Actions behave slightly differently than standard promises (they return `{ data, error }`). The `createAstroFlow` utility is designed to handle this specific structure while giving you all the power of the core engine.

### Example (Client-side usage)

```astro
---
// In your Astro component
---
<script>
import { actions } from 'astro:actions';
import { createAstroFlow } from '@asyncflowstate/astro';

const flow = createAstroFlow(actions.saveProfile);

const btn = document.getElementById('save-btn');
btn.addEventListener('click', async () => {
  const result = await flow.execute({ name: 'New Name' });
  if (result) {
    alert('Saved!');
  }
});

// Subscribe to state changes for UI updates
flow.subscribe((state) => {
  btn.disabled = flow.isLoading;
  btn.innerText = flow.isLoading ? 'Saving...' : 'Save';
});
</script>

<button id="save-btn">Save</button>
```

## Why use AsyncFlowState with Astro?

### Resilience in Static Sites

Astro often targets performance and static generation. When you do have interactive "islands" or client-side actions, AsyncFlowState ensures they are resilient to network jitters via built-in retries and circuit breakers.

### Zero-React Dependency

Unlike the `@asyncflowstate/react` package, the Astro integration targets the **Core** engine directly. This means you can use it in vanilla JS islands, Web Components, or even across different framework islands (Vue/Solid) while keeping a tiny bundle size.

### Automated Transitions

Even in a multi-page app (MPA), you can use the `purgatory` feature to hold navigation-related actions in a grace period, allowing users to undo "destructive" actions before they hit the server.

## Best Practices

Building a professional async experience in Astro requires leveraging its islands architecture. Follow these patterns for the best results.

### <i class="fa-solid fa-rocket text-brand-1 mr-2"></i> Island Architecture

::: tip Vanilla Islands
Use `createAstroFlow` inside standard `<script>` tags without needing any React or Vue framework wrapper. It keeps your JS bundle extremely small while providing robust state management.
:::

### <i class="fa-solid fa-bolt text-cyan-500 mr-2"></i> UX & Performance

::: tip Speculative Execution
Use `speculative: true` on form submissions to instantly predict the UI change before the Astro server action responds, completely masking network latency for the user.
:::

### <i class="fa-solid fa-code text-purple-400 mr-2"></i> Type Safety

::: info TypeScript Actions
Always define strict inputs and outputs for your Astro Actions. The `createAstroFlow` primitive will automatically infer these schemas, providing flawless end-to-end type safety in your client scripts.
:::
