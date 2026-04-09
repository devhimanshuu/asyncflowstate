# <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/svelte/svelte-original.svg" style="width: 38px; height: 38px; display: inline-block; margin-right: 12px; vertical-align: middle;" alt="Svelte Logo" /> Svelte Integration

The `@asyncflowstate/svelte` package provides Svelte stores with `$` auto-subscription for seamless reactivity.

## Installation

```bash
npm install @asyncflowstate/svelte @asyncflowstate/core
```

## Core Store (createFlow)

The `createFlow` feature generates a reactive Svelte store that tracks all asynchronous states inherently. It integrates perfectly with Svelte's auto-subscription `$` syntax.

### Example

```svelte
<script>
  import { createFlow } from '@asyncflowstate/svelte';

  const flow = createFlow(
    async (id) => {
      const response = await fetch(`/api/users/${id}`);
      return response.json();
    },
    {
      onSuccess: (user) => console.log('Fetched:', user.name),
      retry: { maxAttempts: 2 },
    }
  );
</script>

<button
  on:click={() => flow.execute('user-123')}
  disabled={$flow.loading}
>
  {$flow.loading ? 'Loading...' : 'Fetch User'}
</button>

{#if $flow.error}
  <p class="error">{$flow.error.message}</p>
{/if}

{#if $flow.data}
  <div class="user-card">
    <h2>{$flow.data.name}</h2>
    <p>{$flow.data.email}</p>
  </div>
{/if}
```

## Store Properties

Access via `$flow` auto-subscription:

| Property        | Type            | Description        |
| --------------- | --------------- | ------------------ |
| `$flow.status`  | `string`        | Current flow state |
| `$flow.loading` | `boolean`       | Loading indicator  |
| `$flow.data`    | `T \| null`     | Last result        |
| `$flow.error`   | `Error \| null` | Last error         |

## Methods

Call directly on the store (not via `$`):

```svelte
<script>
  // Execute
  flow.execute(args);

  // Reset
  flow.reset();
</script>
```

## Form Handling

Handle form submissions and reactive data updates directly inside Svelte components without boilerplate.

### Example

```svelte
<script>
  import { createFlow } from '@asyncflowstate/svelte';

  const flow = createFlow(async (data) => {
    return await fetch('/api/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(r => r.json());
  });

  function handleSubmit(e) {
    const formData = new FormData(e.target);
    flow.execute(Object.fromEntries(formData));
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input name="name" placeholder="Name" />
  <input name="email" type="email" placeholder="Email" />

  <button type="submit" disabled={$flow.loading}>
    {$flow.loading ? 'Saving...' : 'Save'}
  </button>

  {#if $flow.error}
    <p class="error">{$flow.error.message}</p>
  {/if}

  {#if $flow.success}
    <p class="success">Saved successfully!</p>
  {/if}
</form>
```

## Advanced Patterns

## Reactive Search

By leveraging Svelte's reactive declarations (`$:`), you can create deeply integrated search workflows with built-in concurrency modifiers and debounce mechanics.

### Example

```svelte
<script>
  import { createFlow } from '@asyncflowstate/svelte';

  const searchFlow = createFlow(
    async (query) => {
      const res = await fetch(`/api/search?q=${query}`);
      return res.json();
    },
    { concurrency: 'restart', debounce: 300 }
  );

  let query = '';
  $: if (query.length > 2) searchFlow.execute(query);
</script>

<input bind:value={query} placeholder="Search..." />

{#if $searchFlow.loading}
  <p>Searching...</p>
{/if}

{#each $searchFlow.data ?? [] as item}
  <div>{item.name}</div>
{/each}
```

## Best Practices

Building a professional async experience in Svelte requires leveraging stores and reactive declarations effectively. Follow these patterns for the best results.

### <i class="fa-solid fa-bolt text-brand-1 mr-2"></i> Reactive Patterns

::: tip Stores are the key
The `createFlow` result is a standard Svelte store. Always use the `$` prefix to subscribe to the state in your markup. This ensures that Svelte automatically manages subscriptions and unsubscriptions for you.
```svelte
<button disabled={$flow.loading}>
  {$flow.loading ? '...' : 'Submit'}
</button>
```
:::

::: tip Use reactive declarations sparingly
While `$: searchFlow.execute(query)` is powerful, ensure you use `concurrency: 'restart'` and `debounce` to prevent excessive network requests when the user types quickly.
:::

### <i class="fa-solid fa-layer-group text-cyan-500 mr-2"></i> Global Configuration

::: info Context API for configuration
In Svelte, there is no direct equivalent to `provide/inject`. Instead, we recommend creating a shared `stores/flows.ts` file or using the Svelte `setContext/getContext` pattern to share a global configuration object across your component tree.
:::

### <i class="fa-solid fa-universal-access text-purple-400 mr-2"></i> User Experience (UX)

::: tip Rule of 400ms
Next JS or React actions can feel "jittery" if they return too quickly, causing a loading spinner to flash for just a few frames. Use `loading: { minDuration: 400 }` to ensure your UI feels stable and predictable.
:::

::: info Graceful Error States
Always use `{#if $flow.error}` to provide clear, accessible feedback. For a premium experience, combine this with a toast notification in the `onError` callback of your flow definition.
:::
