# Cross-Tab Synchronization <i class="fa-solid fa-sparkles text-amber-500"></i>

<SyncAnimation />

When a user has your application open in multiple browser tabs simultaneously, managing state across them can be chaotic. If they log out in Tab A, Tab B shouldn't stay logged in. 

AsyncFlowState natively leverages the browser's `BroadcastChannel` API to instantly synchronize exact state replicas across all active windows.

## Usage

Simply define a unique `sync.channel` string in your Flow config.

```ts
import { useFlow } from '@asyncflowstate/react';

const checkoutFlow = useFlow(runCheckout, {
  sync: {
    channel: 'checkout-state', // Unique key for this channel
    syncLoading: true, // Will also broadcast the "Loading..." spinner to other tabs
  }
});
```

That's it! When `checkoutFlow` transitions to a Success or Error state in Tab A, Tab B will reactively mirror the exact state without needing to ping the server again. 
