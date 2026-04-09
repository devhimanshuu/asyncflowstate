# Advanced Workflows (SolidJS)

<cite>
**Referenced Files in This Document**
- [packages/solid/src/primitives/createFlowSequence.ts](file://packages/solid/src/primitives/createFlowSequence.ts)
- [packages/solid/src/primitives/createFlowList.ts](file://packages/solid/src/primitives/createFlowList.ts)
</cite>

Integrate advanced pipelines inside heavily isolated mapping `<For>` iterators.

## `createFlowList` with `<For>` Loop Caching

When you map `<For>` dynamically across iterative rendering contexts safely, Solid binds references explicitly internally efficiently ensuring items securely isolate execution streams properly without re-triggering sibling renders!

```tsx
import { createFlowList } from "@asyncflowstate/solid";
import { For } from "solid-js";

const deletionEngine = createFlowList(deleteItemAPI);

<For each={items()}>
  {(item) => {
    // Correctly bind nested property derivations manually directly
    const status = () => deletionEngine.getStatus(item.id).status;
    return (
      <li>
        <button
          onClick={() => deletionEngine.execute(item.id, item.id)}
          disabled={status() === "loading"}
        >
          {status() === "loading" ? "Deleting" : "Delete"}
        </button>
      </li>
    );
  }}
</For>;
```

## `createFlowSequence`

Orchestrates sequential `<progress>` steps synchronously inside Solid components cleanly seamlessly:

```tsx
<Show when={sequence.currentStep()}>
  {(step) => <p>Currently processing component block: {step().name}</p>}
</Show>
```
