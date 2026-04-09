// @ts-nocheck
/**
 * AsyncFlowState - SolidJS Examples
 *
 * Demonstrates how to use @asyncflowstate/solid fine-grained primitives.
 */
import { Show, For } from "solid-js";
import {
  createFlow,
  createFlowList,
  createInfiniteFlow,
  FlowProvider,
} from "@asyncflowstate/solid";

// =============================================================================
// Example 1: Basic Reactive Data Fetching
// =============================================================================
export function BasicFetch() {
  const fetchUserFlow = createFlow(
    async (id: string) => {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    { retry: { maxAttempts: 2 } },
  );

  return (
    <section>
      <h2>Basic SolidJS Signal Fetching</h2>
      <button
        onClick={() => fetchUserFlow.execute("123")}
        disabled={fetchUserFlow.loading()}
      >
        {fetchUserFlow.loading() ? "Fetching..." : "Load User"}
      </button>

      <Show when={fetchUserFlow.data()}>
        {(user) => <p>Name: {user().name}</p>}
      </Show>

      <Show when={fetchUserFlow.error()}>
        {(err) => <p style="color: red">{err().message}</p>}
      </Show>
    </section>
  );
}

// =============================================================================
// Example 2: Flow List (Individual Loading States)
// =============================================================================
export function ListTracking() {
  const items = () => [
    { id: "1", name: "Item 1" },
    { id: "2", name: "Item 2" },
  ];

  const deleteList = createFlowList(async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  });

  return (
    <section>
      <h2>List Context Tracking</h2>
      <ul>
        <For each={items()}>
          {(item) => (
            <li>
              {item.name}
              <button
                onClick={() => deleteList.execute(item.id, item.id)}
                disabled={deleteList.getStatus(item.id).status === "loading"}
              >
                {deleteList.getStatus(item.id).status === "loading"
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </li>
          )}
        </For>
      </ul>
    </section>
  );
}

// =============================================================================
// Example 3: Context Provider App Base
// =============================================================================
export function App() {
  return (
    <FlowProvider
      config={{
        loading: { minDuration: 300 }, // Global prevent UI flashing
        retry: { backoff: "exponential" },
      }}
    >
      <div class="examples">
        <BasicFetch />
        <ListTracking />
      </div>
    </FlowProvider>
  );
}
