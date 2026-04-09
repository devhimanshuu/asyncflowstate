# Provider Configuration (Vue)

<cite>
**Referenced Files in This Document**
- [packages/vue/src/components/FlowProvider.ts](file://packages/vue/src/components/FlowProvider.ts)
</cite>

Instead of passing `{ retry: { maxAttempts: 3 } }` into absolutely every `<script setup>` file individually, configure your defaults once via the native Vue `provide`/`inject` API wrapped by `@asyncflowstate/vue`.

## Implementation

Typically managed at the root of the app, e.g., in `App.vue` or your primary layout engine components:

```vue
<!-- App.vue -->
<script setup lang="ts">
import { provideFlowConfig } from '@asyncflowstate/vue';
import { toast } from 'vue-toastification';

provideFlowConfig({
  // Global retries
  retry: {
    maxAttempts: 2,
    backoff: 'exponential'
  },
  // Ensure loaders don't flash for 50ms fetches
  loading: {
    minDuration: 300, 
  },
  // Catch all errors globally
  onError: (error) => {
    toast.error(`Operation failed: ${error.message}`);
  }
});
</script>
```

## Cascade & Overrides

Any component deeply nested within `App.vue` will inherit this configuration via `inject`. However, nested local configurations seamlessly override their global counterparts:

```vue
<!-- Child.vue -->
<script setup>
const fastFlow = useFlow(fastAction, {
  // Overrides the minDuration 300 globally set, enabling raw flash
  loading: { minDuration: 0 },
});
</script>
```

Options deeply merge array configurations and spread dictionaries securely.
