# Building Collaborative Apps

Learn how to use Collaborative Flows to sync state across multiple tabs, devices, and users in real time using the new Mesh network features in v3.0.0.

## Prerequisites

- AsyncFlowState `v3.0.0`
- A WebSocket or BroadcastChannel understanding

## Step 1: Setting up the Mesh

To enable cross-tab communication, we initialize `FlowMesh` and attach it to our application. This establishes a leader-election process among the connected clients.

```typescript
import { FlowMesh } from "@asyncflowstate/core/utils/mesh";

const mesh = new FlowMesh({
  channel: "my-app-mesh",
  strategy: "leader-follower",
  shareCache: true,
  shareErrors: true,
});
```

## Step 2: Shared State & Optimistic UI

We can now define a flow that automatically syncs its state and optimistic updates across the mesh network.

```tsx
import { useCollaborativeFlow } from "@asyncflowstate/react";

function SharedTodoList() {
  const { data, execute, isLeader } = useCollaborativeFlow(
    async (newTodo) => {
      // Only the leader makes the actual API call
      const res = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify(newTodo),
      });
      return res.json();
    },
    {
      meshChannel: "my-app-mesh",
      syncAction: true,
      optimisticResult: (newTodo) => ({ id: Math.random(), title: newTodo }),
    },
  );

  return (
    <div>
      <h3>Todos {isLeader && "(Leader)"}</h3>
      <button onClick={() => execute("New Item")}>Add Item</button>
      <ul>
        {data?.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Step 3: Conflict Resolution

When multiple users try to update the same flow state simultaneously, we can use vector clocks built into `CollaborativeOptions` to resolve conflicts.

```tsx
import { useFlow } from "@asyncflowstate/react";

function DocumentEditor() {
  const { execute } = useFlow(updateDoc, {
    collaborative: {
      channel: "doc-123",
      resolveConflict: (localData, remoteData) => {
        // Simple last-write-wins or custom merge logic
        return localData.timestamp > remoteData.timestamp
          ? localData
          : remoteData;
      },
    },
  });

  // ...
}
```
