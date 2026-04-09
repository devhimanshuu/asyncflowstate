# FlowProvider Configuration (SolidJS)

<cite>
**Referenced Files in This Document**
- [packages/solid/src/components/FlowProvider.tsx](file://packages/solid/src/components/FlowProvider.tsx)
</cite>

Global options inject completely natively over the standard standard generic Solid `Context` primitives effectively ensuring secure configurations mapped inside the DOM explicitly propagating smoothly downwards to child `<createFlow>` layouts without context breaks.

## Wiring Up `<FlowProvider>`

Configure standard system behaviors effectively at the literal root index module wrapping application routing.

```tsx
import { FlowProvider } from '@asyncflowstate/solid';
import { render } from 'solid-js/web';
import App from './App';

render(() => (
  <FlowProvider config={{
    retry: { maxAttempts: 5, delay: 1000 },
    loading: { minDuration: 400 }, // Stop UI flashing globally across ALL signals dynamically!
  }}>
    <App />
  </FlowProvider>
), document.getElementById('root')!);
```

## Behavior Cascade Details

Local definitions explicitly initialized physically via `createFlow(action, { ... })` locally will completely override overlapping property attributes specifically designated mapped efficiently over global defaults securely.
