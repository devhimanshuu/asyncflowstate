# SolidJS Integration

<cite>
**Referenced Files in This Document**
- [packages/solid/src/primitives/createFlow.ts](file://packages/solid/src/primitives/createFlow.ts)
- [examples/solid/solid-examples.tsx](file://examples/solid/solid-examples.tsx)
</cite>

The `@asyncflowstate/solid` integration exposes hyper-optimized fine-grained signal accessors specifically modeled for SolidJS templating constraints. There are absolutely no unnecessary re-renders inside components utilizing this architecture!

## Installation

```bash
pnpm add @asyncflowstate/solid @asyncflowstate/core
```

## Signals Foundation

### `createFlow` Component Logic

States are explicitly wrapped inside `()` accessor bindings to capture direct updates.

```tsx
import { createFlow } from '@asyncflowstate/solid';
import { Show } from 'solid-js';

export function UserBlock() {
  const accountFlow = createFlow(
    async (id: string) => {
      const res = await fetch(`/api/user/${id}`);
      return res.json();
    }
  );

  return (
    <div>
      <button 
        onClick={() => accountFlow.execute('123')}
        disabled={accountFlow.loading()}
      >
        {accountFlow.loading() ? 'Loading...' : 'Go'}
      </button>

      <Show when={accountFlow.data()}>
        {(user) => <div>Welcome {user().name}</div>}
      </Show>
    </div>
  );
}
```

## `<Show>` & `<For>` Render Targets

### `createFlowList`

Handling dynamically managed keys and independent execution streams runs blazing fast in Solid.

```tsx
import { createFlowList } from '@asyncflowstate/solid';
import { For } from 'solid-js';

const deletionEngine = createFlowList(async (id: string) => api.deleteData(id));

<ul>
  <For each={items()}>
    {(item) => {
      // Solid caches the precise closure variables securely tied to signals!
      const status = () => deletionEngine.getStatus(item.id).status;
      return (
        <li>
          {item.name}
          <button 
            onClick={() => deletionEngine.execute(item.id, item.id)}
            disabled={status() === 'loading'}
          >
            {status() === 'loading' ? 'Deleting' : 'Delete'}
          </button>
        </li>
      );
    }}
  </For>
</ul>
```

### `<FlowProvider>` Configurations

Easily intercept signals globally, matching contexts with simple declarative roots:

```tsx
import { FlowProvider } from '@asyncflowstate/solid';

function App() {
  return (
    <FlowProvider config={{
      loading: { minDuration: 400 },
      retry: { maxAttempts: 4 }
    }}>
      <MyRoutedApplication />
    </FlowProvider>
  );
}
```

## Best Practices
1. **Never destructure accessors locally:** It is highly important in SolidJS *not* to destructure properties out of derived accessors unless explicitly executing reactive bindings. Keep derivations local (e.g. `flow.loading()` instead of `const load = flow.loading();`).
2. **Optimistic Updates API:** Due to accurate proxy-data propagation models, pairing Solid models directly to `optimisticResult` within `options` allows UI synchronization updates with sub-millisecond precision.
