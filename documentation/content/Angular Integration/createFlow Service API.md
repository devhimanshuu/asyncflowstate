# createFlow Service API

<cite>
**Referenced Files in This Document**
- [packages/angular/src/services/createFlow.ts](file://packages/angular/src/services/createFlow.ts)
</cite>

Directly modeled around scalable `@angular/core` logic mapping, the Angular instantiation wrapper constructs native `BehaviorSubject` integrations mapped tightly back into reactive RxJS topologies.

## BehaviorSubject Configuration

```ts
import { createFlow } from "@asyncflowstate/angular";

const apiFlow = createFlow(fetchLogic);
```

By explicitly mapping to RxJS logic, the system effectively exposes two properties mapping component lifecycles reliably.

1. `apiFlow.state$`: The direct `BehaviorSubject` observable returning immediate access context.
2. `apiFlow.state`: The synchronous standard payload format structure mapped securely bypassing `.subscribe` closures exclusively for logic interception triggers!

### The Native AsyncPipe Context Flow

Leveraging standard `*ngIf` declarations via `| async` safely resolves the observable explicitly rendering memory isolation optimally without invoking complex manual subscriptions.

```html
<ng-container *ngIf="apiFlow.state$ | async as state">
  <button (click)="apiFlow.execute()" [disabled]="state.loading">Run</button>
</ng-container>
```

### Dependency Service Injection Layout

The best practice in Angular environments dictates initializing flow logic natively wrapped in shared service objects to pipe cross component triggers predictably:

```typescript
@Injectable({ providedIn: "root" })
export class RootOrchestrator {
  public batchService = createFlow(backendTriggerAPI);
}
```
