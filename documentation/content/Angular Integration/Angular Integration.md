# Angular Integration

<cite>
**Referenced Files in This Document**
- [packages/angular/src/services/createFlow.ts](file://packages/angular/src/services/createFlow.ts)
- [examples/angular/angular-examples.ts](file://examples/angular/angular-examples.ts)
</cite>

AsyncFlowState heavily embraces TypeScript boundaries within `@asyncflowstate/angular`. It abstracts complex class-based asynchronous executions by providing powerful `BehaviorSubject` objects tightly integrated to pair efficiently with Angular's `AsyncPipe`. 

## Installation

```bash
pnpm add @asyncflowstate/angular @asyncflowstate/core
```

## Core Fundamentals

### The `AsyncPipe` Advantage

Directly pair `state$` subjects mapping the status, data streams, and progression hooks.

```typescript
import { Component, OnDestroy } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { createFlow } from '@asyncflowstate/angular';

@Component({
  selector: 'app-user-fetcher',
  standalone: true,
  imports: [AsyncPipe, NgIf],
  template: `
    <ng-container *ngIf="userFlow.state$ | async as state">
      <button 
        (click)="userFlow.execute('123')" 
        [disabled]="state.loading">
        {{ state.loading ? 'Updating...' : 'Fetch User' }}
      </button>

      <!-- Response Rendering -->
      <pre *ngIf="state.data">{{ state.data | json }}</pre>
      
      <p *ngIf="state.error" class="error">{{ state.error.message }}</p>
    </ng-container>
  `
})
export class UserComponent implements OnDestroy {
  userFlow = createFlow(
    async (id: string) => {
      const res = await fetch(`/api/users/${id}`);
      return res.json();
    },
    { retry: { maxAttempts: 3, backoff: 'exponential' } }
  );

  ngOnDestroy() {
    this.userFlow.destroy();
  }
}
```

### Dependency Injection Pipeline

The system pairs remarkably well as a standard scalable `@Injectable()` service wrapper. Because it streams directly to `BehaviorSubject`, memory optimization can be fully isolated.

```typescript
@Injectable({ providedIn: 'root' })
export class OrchestrationService {
  public batchFlow = createFlowParallel({
    posts: postsFlow.flow,
    users: usersFlow.flow
  }, "allSettled");
  
  startEngine() {
    this.batchFlow.execute();
  }
}
```

## Advanced Operations

### RxJS Stream Composition

Since `.state$` yields observables, you can tap it securely to chain advanced logic!
```typescript
import { filter, map } from 'rxjs/operators';

this.myFlow.state$.pipe(
  filter(state => state.isSuccess),
  map(state => state.data)
).subscribe(payload => {
  // Post-flow isolated observable trigger!
})
```

## Best Practices
1. **Component teardown isolation**: Remember to always trigger `.destroy()` recursively on component teardown (`ngOnDestroy()`) inside non-singleton modules to release memory loops tied behind internal auto-revalidation checks.
2. **Template Binding**: The entire object wraps robustly inside an `ng-container`. Prefer capturing root variable derivations securely (e.g., `*ngIf="userFlow.state$ | async as state"`) rather than scattering observable subscription bindings universally over the template footprint to heavily optimize change detection loops!
