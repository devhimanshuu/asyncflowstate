# Form and Button Helpers (Vue)

<cite>
**Referenced Files in This Document**
- [packages/vue/src/composables/useFlow.ts](file://packages/vue/src/composables/useFlow.ts)
</cite>

Building forms manually is bloated. The `@asyncflowstate/vue` package includes standard layout bindings to skip writing boilerplate `@click` and `@submit.prevent` mechanisms.

## Button Bindings (`button()`)

The `button()` function generates standard HTML attributes ensuring accessible loading layouts and concurrency control via native disabled properties.

```vue
<script setup>
const saveFlow = useFlow(saveData);
</script>

<template>
  <!-- Auto injects :disabled="loading" and :aria-busy="loading" -->
  <button v-bind="saveFlow.button()" @click="saveFlow.execute(payload)">
    {{ saveFlow.loading ? 'Saving...' : 'Save' }}
  </button>
</template>
```

You can pass extensions directly into `button({ class: 'my-btn' })` to safely inject native attributes without overriding the internal spread.

## Form Bindings (`form()`)

The `form()` utility intercepts submit events, automatically extracts DOM payload data (if requested), validates via a robust schema, and conditionally fires the flow!

```vue
<script setup>
import { z } from 'zod';
const schema = z.object({ title: z.string().min(5) });

const flow = useFlow(submitData);
</script>

<template>
  <!-- v-bind auto assigns @submit.prevent and reads internal attributes! -->
  <form v-bind="flow.form({ schema, extractFormData: true })">
    <input name="title" />
    <span v-if="flow.fieldErrors.title">{{ flow.fieldErrors.title }}</span>

    <button type="submit">Publish</button>
  </form>
</template>
```

### `fieldErrors` Validation
When `schema` validation fails (Zod, Valibot, Yup), the flow is fundamentally halted **before** network interactions occur, and `fieldErrors` reactive ref updates populated dynamically.

- `flow.fieldErrors` (`Ref<Record<string, string>>`): Reactive object mapping `name` attributes to localized validation errors!
