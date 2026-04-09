# createFlow Signal API

<cite>
**Referenced Files in This Document**
- [packages/solid/src/primitives/createFlow.ts](file://packages/solid/src/primitives/createFlow.ts)
</cite>

SolidJS removes Virtual DOM constructs via a native Signal topology layout. So `@asyncflowstate/solid` ensures absolutely zero wasteful rerenders occur leveraging pure optimized signal layouts!

## Signal Destructuring Pipeline

When calling `createFlow`, the return mapping doesn't execute component loops identically to typical variable renders. Each payload explicitly operates securely isolated!

```tsx
import { createFlow } from '@asyncflowstate/solid';
import { Show } from 'solid-js';

const flow = createFlow(fetchLogic);
```

### Accessor Implementation Constraints

You *must* call properties explicitly rendering as function execution (`()`) inside templates to bind accurately!

**DON'T DO THIS:**
```tsx
const { loading } = flow; // Disconnects mapping!
return <span class={loading() ? '...' : ''} />
```

**DO THIS:**
```tsx
return <span class={flow.loading() ? '...' : ''} />
```

### `<Show>` Interceptor Integrations

Pairs naturally across `<Show>` condition boundaries efficiently. Any nested children inside `<Show when={flow.data()}>` automatically suspend updates till data completely parses rendering correctly without breaking memory bindings safely.
