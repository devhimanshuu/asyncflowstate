# Advanced Workflows (Vue)

<cite>
**Referenced Files in This Document**
- [packages/vue/src/composables/useFlowSequence.ts](file://packages/vue/src/composables/useFlowSequence.ts)
- [packages/vue/src/composables/useFlowParallel.ts](file://packages/vue/src/composables/useFlowParallel.ts)
</cite>

Native implementations of complex orchestrations dynamically tailored inside the Vue Composition scope.

## `useFlowSequence`

Pipelines multiple discrete `Flow` objects linearly.

```vue
<script setup>
const sequence = useFlowSequence([
  { name: 'Auth', flow: authFlow.flow },
  { name: 'Prefetch', flow: pullDataFlow.flow, mapInput: (authRes) => authRes.token }
]);
</script>

<template>
  <div>
    <button @click="sequence.execute()">Start System Boot</button>
    
    <!-- Reactively sync with pipeline step names -->
    <p v-if="sequence.loading">Booting up: {{ sequence.currentStep?.name }}</p>
    
    <!-- Native % progression outputs! -->
    <progress :value="sequence.progress" max="100"></progress>
  </div>
</template>
```

## `useFlowParallel`

Parallelizes execution states matching `Promise.all` or `Promise.allSettled`.

```vue
<script setup>
const parallel = useFlowParallel(
  {
    profile: profileFlow.flow,
    posts: postsFlow.flow
  },
  "all" // Returns single error failure state if any fail
);
</script>
```

## `useFlowList`

Prevents loading indicator freezing where rendering isolated deletion actions in `v-for`.

```vue
<script setup>
const deleteList = useFlowList(deleteAPI);
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <button 
        @click="deleteList.execute(item.id, item.id)"
        :disabled="deleteList.states.value[item.id]?.status === 'loading'"
      >
        Delete
      </button>
    </li>
  </ul>
</template>
```
