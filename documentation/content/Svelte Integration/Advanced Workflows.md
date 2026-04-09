# Advanced Workflows (Svelte)

<cite>
**Referenced Files in This Document**
- [packages/svelte/src/stores/createFlowSequence.ts](file://packages/svelte/src/stores/createFlowSequence.ts)
- [packages/svelte/src/stores/createFlowList.ts](file://packages/svelte/src/stores/createFlowList.ts)
</cite>

Because Svelte templating structures map via `{#each}` loop syntax brilliantly, `AsyncFlowState` unlocks dynamic key loading directly inside iteration mapping to evade single page blocking models!

## `createFlowList`

Normally, iterating mapping elements across list deletion engines locks the main UI globally if you share boolean variables globally.

```svelte
<script>
  const deletionEngine = createFlowList(deleteItemAPI);
</script>

{#each items as item}
  <!-- Only disables the SPECIFIC item button! -->
  <button 
    on:click={() => deletionEngine.execute(item.id, item.id)}
    disabled={$deletionEngine.states[item.id]?.status === 'loading'}
  >
    Delete
  </button>
{/each}
```

## `createFlowSequence`

Create robust progression blocks to visually animate user flows natively.

```svelte
<script>
  const workflow = createFlowSequence([...steps]);
</script>

<!-- The `.progress` maps from 0 to 100 dynamically! -->
<progress value={$workflow.progress} max="100"></progress>
```
