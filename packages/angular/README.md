<div align="center">
  <a href="https://github.com/devhimanshuu/asyncflowstate">
    <img src="https://raw.githubusercontent.com/devhimanshuu/asyncflowstate/main/assets/AsyncFlowState_logo.png" width="120" height="120" alt="AsyncFlowState Logo" />
  </a>
  <h1>@asyncflowstate/angular <span style="font-size: 14px; background: #dd003122; color: #dd0031; padding: 4px 10px; border-radius: 20px; vertical-align: middle; margin-left: 10px;">v3.0.0 Stable</span></h1>
  <p><b>Official Angular bindings for AsyncFlowState — the industry-standard engine for predictable async UI behavior.</b></p>

  <p>
    <a href="https://asyncflowstate-js.pages.dev/frameworks/angular"><img src="https://img.shields.io/badge/Documentation-Link-blue.svg" alt="Documentation" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License: MIT" /></a>
    <a href="https://www.npmjs.com/package/@asyncflowstate/angular"><img src="https://img.shields.io/npm/v/@asyncflowstate/angular?color=indigo" alt="NPM Version" /></a>
  </p>
</div>

## Installation

```bash
pnpm add @asyncflowstate/angular @asyncflowstate/core
```

## Quick Start

### Basic Usage

```typescript
import { Component, OnDestroy } from "@angular/core";
import { createFlow } from "@asyncflowstate/angular";
import { AsyncPipe, NgIf } from "@angular/common";

@Component({
  standalone: true,
  imports: [AsyncPipe, NgIf],
  template: `
    <ng-container *ngIf="userFlow.state$ | async as state">
      <button (click)="userFlow.execute('user-123')" [disabled]="state.loading">
        {{ state.loading ? "Loading..." : "Fetch User" }}
      </button>
      <p *ngIf="state.data">{{ state.data.name }}</p>
      <p *ngIf="state.error" class="error">{{ state.error.message }}</p>
    </ng-container>
  `,
})
export class UserComponent implements OnDestroy {
  userFlow = createFlow(
    async (id: string) => {
      const res = await fetch(`/api/users/${id}`);
      return res.json();
    },
    {
      onSuccess: (user) => console.log("Fetched:", user.name),
      retry: { maxAttempts: 3, backoff: "exponential" },
    },
  );

  ngOnDestroy() {
    this.userFlow.destroy();
  }
}
```

### In a Service

```typescript
import { Injectable, OnDestroy } from "@angular/core";
import { createFlow, createFlowList } from "@asyncflowstate/angular";

@Injectable({ providedIn: "root" })
export class UserService implements OnDestroy {
  fetchUser = createFlow(
    async (id: string) => {
      const res = await fetch(`/api/users/${id}`);
      return res.json();
    },
    { retry: { maxAttempts: 3 } },
  );

  deleteUser = createFlowList(async (id: string) => {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
  });

  ngOnDestroy() {
    this.fetchUser.destroy();
    this.deleteUser.destroy();
  }
}
```

### Using with RxJS

```typescript
import { createFlow } from "@asyncflowstate/angular";
import { filter, map } from "rxjs/operators";

const flow = createFlow(fetchData);

// Use RxJS operators on the observable
flow.state
  .pipe(
    filter((state) => state.isSuccess),
    map((state) => state.data),
  )
  .subscribe((data) => {
    console.log("Success:", data);
  });
```

### Sequential Workflows

```typescript
import { createFlowSequence } from "@asyncflowstate/angular";

const sequence = createFlowSequence([
  { name: "Validate", flow: validateFlow.flow },
  { name: "Submit", flow: submitFlow.flow },
  { name: "Notify", flow: notifyFlow.flow },
]);

// In template:
// <ng-container *ngIf="sequence.state$ | async as state">
//   <button (click)="sequence.execute()" [disabled]="state.loading">
//     Run Workflow ({{ state.progress }}%)
//   </button>
// </ng-container>
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** Self-healing async state using behavioral pattern matching.
- **Ambient Intelligence:** Predictive background monitoring for Angular services.
- **Speculative Execution:** Low-latency interactions based on intent prediction.
- **Emotional UX:** Adaptive system load-aware UI transitions.
- **Collaborative Mesh:** Real-time state synchronization across sessions.
- **Edge-First Actions:** Optimized for global edge networks.
- **Temporal Trace:** Full history replay for complex async sequences.
- **Telemetry Hub:** Integrated monitoring for all application flows.

## Comprehensive Examples

### 1. Enterprise Services: The Core Engine

Encapsulate your async logic in a service and expose it as a reactive flow.

```typescript
import { Injectable, OnDestroy } from "@angular/core";
import { createFlow } from "@asyncflowstate/angular";

@Injectable({ providedIn: "root" })
export class ProductService implements OnDestroy {
  // 1. Define the flow in your service
  productDetails = createFlow((id: string) => api.fetchDetails(id), {
    retry: { maxAttempts: 3 },
    predictive: { prefetchOnHover: true },
  });

  ngOnDestroy() {
    this.productDetails.destroy();
  }
}
```

### 2. Component Integration: Reactive UI

Bind directly to the flow state with the `async` pipe.

```typescript
@Component({
  template: `
    <div *ngIf="productService.productDetails.state$ | async as state">
      <button
        (click)="productService.productDetails.execute(id)"
        [disabled]="state.loading"
      >
        {{ state.loading ? "Loading..." : "View Product" }}
      </button>

      <div *ngIf="state.data" class="content">
        {{ state.data.title }}
      </div>

      <p *ngIf="state.error" class="error">{{ state.error.message }}</p>
    </div>
  `,
})
export class ProductComponent {
  constructor(public productService: ProductService) {}
}
```

### 3. AI-Powered: Flow DNA & Self-Healing

Leverage behavioral pattern matching to optimize your Angular flows automatically.

```typescript
const flow = createFlow(api.syncData, {
  dna: {
    enabled: true,
    learningRate: 0.1, // Adapts to environmental network latency
  },
});
```

### 4. RxJS Power: Declarative Chaining

Transform and filter flow states using standard RxJS operators.

```typescript
this.authFlow.state$
  .pipe(
    filter((state) => state.status === "success"),
    switchMap((state) => this.profileFlow.execute(state.data.userId)),
  )
  .subscribe();
```

### 5. Multi-Step Workflows: `createFlowSequence`

Manage complex wizard steps with centralized progress tracking.

```typescript
const sequence = createFlowSequence([
  { name: "Validation", flow: step1.flow },
  { name: "Submission", flow: step2.flow },
  { name: "Analytics", flow: step3.flow },
]);

// Template:
// <progress [value]="sequence.state.progress" max="100"></progress>
```

## <i class="fa-solid fa-sparkles text-amber-500"></i> New in v3.0

- **Flow DNA:** Self-healing async state using behavioral pattern matching.
- **Ambient Intelligence:** Predictive background monitoring for Angular services.
- **Speculative Execution:** Low-latency interactions based on intent prediction.
- **Emotional UX:** Adaptive system load-aware UI transitions.
- **Collaborative Mesh:** Real-time state synchronization across sessions.
- **Edge-First Actions:** Optimized for global edge networks.
- **Temporal Trace:** Full history replay for complex async sequences.
- **Telemetry Hub:** Integrated monitoring for all application flows.

## API Reference

| Function                               | Description                                       |
| -------------------------------------- | ------------------------------------------------- |
| `createFlow(action, options?)`         | Core factory for managing async actions           |
| `createFlowSequence(steps)`            | Orchestrate sequential workflows                  |
| `createFlowParallel(flows, strategy?)` | Run flows in parallel                             |
| `createFlowList(action, options?)`     | Manage multiple keyed flow instances              |
| `createInfiniteFlow(action, options)`  | Manage paginated/infinite scrolling data fetching |

All instances expose `state$` (BehaviorSubject) and `state` (Observable) for template binding.

## Cleanup

Always call `destroy()` in `ngOnDestroy()`:

```typescript
ngOnDestroy() {
  this.flow.destroy();
}
```

## License

MIT © [AsyncFlowState Contributors](https://github.com/devhimanshuu/asyncflowstate)
