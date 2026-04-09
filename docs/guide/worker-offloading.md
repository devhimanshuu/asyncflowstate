# Worker Offloading <i class="fa-solid fa-sparkles text-amber-500"></i>

<WorkerAnimation />

For computationally heavy tasks (like processing large datasets, calculating cryptographic hashes, or iterating 3D matrices), doing the work on the main UI thread will cause "jank" and freeze your UI.

AsyncFlowState allows you to seamlessly punt standard flows into a dedicated **Web Worker** using the `worker()` execution method.

## Usage

Instead of calling `.execute()`, simply call `.worker()`.

```ts
import { useFlow } from '@asyncflowstate/react';

// An intensely heavy function
const processPixels = async (data: any) => {
  let r = 0;
  for(let i=0; i<999999999; i++) { r += i; }
  return r;
};

const imageFlow = useFlow(processPixels);

// Offload it to a background thread! UI stays at 60 FPS <i class="fa-solid fa-sparkles text-amber-500"></i>
await imageFlow.worker(imageBufferData);
```

> [!WARNING] Restriction
> The action you provide to a `.worker()` execution must be a purely self-contained, serializable function. It cannot reference variables outside of its own block scope, and it cannot access the DOM or `window` object.
