<script lang="ts">
/**
 * AsyncFlowState - Svelte Examples
 * 
 * Demonstrates how to use @asyncflowstate/svelte stores.
 */
import { 
  createFlow, 
  createFlowSequence, 
  createFlowList,
  createInfiniteFlow
} from '@asyncflowstate/svelte';

// =============================================================================
// Example 1: Basic Data Fetching
// =============================================================================
const fetchUserFlow = createFlow(
  async (id: string) => {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  },
  {
    retry: { maxAttempts: 2 },
  }
);

// =============================================================================
// Example 2: List Operations (e.g. Delete Buttons)
// =============================================================================
const deleteList = createFlowList(async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Deleted', id);
});

const items = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];

// =============================================================================
// Example 3: Infinite Scrolling
// =============================================================================
const postsFlow = createInfiniteFlow(
  async (cursor: number) => {
    // Simulated API response
    return { data: ['post1', 'post2'], nextCursor: cursor + 1 };
  },
  {
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor > 3 ? null : lastPage.nextCursor
  }
);
</script>

<div class="examples">
  
  <!-- Example 1 UI -->
  <section>
    <h2>Basic Data Fetching</h2>
    <button 
      on:click={() => fetchUserFlow.execute('123')} 
      disabled={$fetchUserFlow.loading}
    >
      {$fetchUserFlow.loading ? 'Fetching...' : 'Load User'}
    </button>
    
    {#if $fetchUserFlow.data}
      <p>Name: {$fetchUserFlow.data.name}</p>
    {/if}
    {#if $fetchUserFlow.error}
      <p class="error">{$fetchUserFlow.error.message}</p>
    {/if}
  </section>

  <!-- Example 2 UI -->
  <section>
    <h2>List Tracking</h2>
    <ul>
      {#each items as item}
        <li>
          {item.name}
          <button 
            on:click={() => deleteList.execute(item.id, item.id)}
            disabled={$deleteList.states[item.id]?.status === 'loading'}
          >
            {$deleteList.states[item.id]?.status === 'loading' ? 'Deleting...' : 'Delete'}
          </button>
        </li>
      {/each}
    </ul>
  </section>

  <!-- Example 3 UI -->
  <section>
    <h2>Infinite Flow</h2>
    {#each $postsFlow.pages as page, i}
      <div class="page">
        Page {i}: {page.data.join(', ')}
      </div>
    {/each}

    {#if $postsFlow.hasNextPage}
      <button 
        on:click={() => postsFlow.fetchNextPage()} 
        disabled={$postsFlow.isFetchingNextPage}
      >
        {$postsFlow.isFetchingNextPage ? 'Loading More...' : 'Load More'}
      </button>
    {:else}
      <p>No more posts.</p>
    {/if}
  </section>

</div>

<style>
.error { color: red; font-size: 0.8em; }
section { margin-bottom: 2rem; padding: 1rem; border: 1px solid #ccc; }
</style>
