# Predictive Prefetching <i class="fa-solid fa-sparkles text-amber-500"></i>

<PredictiveAnimation />

By recognizing user intent before they even click, you can completely erase perceived network latency.

AsyncFlowState exposes `predictive` options that automatically begin resolving flows when a user interacts with bounding boxes—such as hovering over a button or moving their mouse toward an actionable zone with high velocity.

## Enabling Hover Prefetch

If you use the included `button()` or `form()` helpers in the React, Vue, or Solid bindings, hover prefetching works completely automatically.

```ts
import { useFlow } from '@asyncflowstate/react';

const userFlow = useFlow(fetchUser, {
  predictive: {
    prefetchOnHover: true, // Will execute the flow on mouseEnter!
    hoverDelay: 100 // Wait 100ms so quick mouse pass-overs don't trigger it
  }
});

return (
  // The button helper natively binds the onMouseEnter events
  <button {...userFlow.button()}>
    View Profile
  </button>
)
```

## How It Avoids Spam

AsyncFlowState internally relies on your `concurrency`, `debounce`, and `staleTime` settings to ensure that rapid hovers do not launch duplicate requests.

If they hover over the button, the request fires. If they then click the button 300ms later, the library will reuse the `in-flight` request promise rather than spawning a new one.

To the user, the click instantly returned data!
