# <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg" style="width: 38px; height: 38px; display: inline-block; margin-right: 12px; vertical-align: middle;" alt="Angular Logo" /> Angular Integration

The `@asyncflowstate/angular` package provides Observable/BehaviorSubject bindings for Angular applications.

## Installation

```bash
npm install @asyncflowstate/angular @asyncflowstate/core
```

## Core Service (createFlow)

The `createFlow` feature generates an isolated flow state container instance. This instance acts as a fully self-contained state machine that ties directly into your component's template lifecycle using Angular observables.

### Example

```typescript
import { Component, OnDestroy } from "@angular/core";
import { createFlow } from "@asyncflowstate/angular";

@Component({
  selector: "app-user",
  template: `
    <ng-container *ngIf="userFlow.state$ | async as state">
      <button (click)="userFlow.execute('user-123')" [disabled]="state.loading">
        {{ state.loading ? "Loading..." : "Fetch User" }}
      </button>

      <div *ngIf="state.error" class="error">
        {{ state.error.message }}
      </div>

      <div *ngIf="state.data" class="user-card">
        <h2>{{ state.data.name }}</h2>
        <p>{{ state.data.email }}</p>
      </div>
    </ng-container>
  `,
})
export class UserComponent implements OnDestroy {
  userFlow = createFlow(
    async (id: string) => {
      const response = await fetch(`/api/users/${id}`);
      return response.json();
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

## Observable API (RxJS)

AsyncFlowState exposes the current state through an RxJS `BehaviorSubject` via the `state$` property, allowing seamless native integration with Async Pipes and manual subscription logic.

### Example

The flow exposes a `state$` Observable (BehaviorSubject) that emits state updates:

```typescript
interface FlowState<T> {
  status: "idle" | "loading" | "success" | "error";
  loading: boolean;
  data: T | null;
  error: Error | null;
}
```

### Using the Async Pipe

```html
<ng-container *ngIf="flow.state$ | async as state">
  <!-- Reactive template -->
</ng-container>
```

### Manual Subscription

```typescript
export class MyComponent implements OnInit, OnDestroy {
  flow = createFlow(fetchData);
  private subscription: Subscription;

  ngOnInit() {
    this.subscription = this.flow.state$.subscribe((state) => {
      if (state.status === "success") {
        this.router.navigate(["/dashboard"]);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.flow.destroy();
  }
}
```

## Form Integration

Easily trace form validations and seamlessly wrap Angular Template-Driven or Reactive Forms with flow states.

### Example

```typescript
@Component({
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [(ngModel)]="formData.name" name="name" />
      <input [(ngModel)]="formData.email" name="email" type="email" />

      <ng-container *ngIf="saveFlow.state$ | async as state">
        <button type="submit" [disabled]="state.loading">
          {{ state.loading ? "Saving..." : "Save" }}
        </button>
        <p *ngIf="state.error" class="error">{{ state.error.message }}</p>
      </ng-container>
    </form>
  `,
})
export class ProfileFormComponent implements OnDestroy {
  formData = { name: "", email: "" };

  saveFlow = createFlow(async (data: typeof this.formData) => {
    return await fetch("/api/profile", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.json());
  });

  onSubmit() {
    this.saveFlow.execute(this.formData);
  }

  ngOnDestroy() {
    this.saveFlow.destroy();
  }
}
```

::: warning Cleanup
Always call `this.flow.destroy()` in `ngOnDestroy()` to prevent memory leaks from lingering subscriptions.
:::

## Dependency Injection

Create globally or feature-scoped async services by instantiating `createFlow` inside an `@Injectable` service, providing singleton flows across your app.

### Example

```typescript
@Injectable({ providedIn: "root" })
export class UserService {
  private fetchFlow = createFlow(async (id: string) => api.getUser(id), {
    retry: { maxAttempts: 2 },
  });

  get state$() {
    return this.fetchFlow.state$;
  }

  fetchUser(id: string) {
    return this.fetchFlow.execute(id);
  }

  destroy() {
    this.fetchFlow.destroy();
  }
}
```

## Best Practices

Building a professional async experience in Angular requires a focus on observables and lifecycle safety. Follow these patterns for the best results.

### <i class="fa-solid fa-code text-brand-1 mr-2"></i> Observable Patterns

::: tip Prefer the Async Pipe
Whenever possible, use the `| async` pipe in your templates. This automatically handles subscription and unsubscription for you, reducing boilerplate and preventing potential memory leaks.
```html
<div *ngIf="flow.state$ | async as state">
  {{ state.loading ? '...' : 'Data Ready' }}
</div>
```
:::

::: tip Centralize in Services
Instead of creating flows directly in your components, move them to `@Injectable()` services. This allows multiple components to share the same flow engine and state results across different parts of your application.
:::

### <i class="fa-solid fa-shield-halved text-emerald-500 mr-2"></i> Lifecycle Safety

::: danger The `destroy()` Call
Always ensure `this.flow.destroy()` is called in `ngOnDestroy`. Because Angular components are frequently created and destroyed, failing to clean up your flow engine can lead to orphaned subscriptions and performance degradation.
:::

### <i class="fa-solid fa-gauge-high text-cyan-500 mr-2"></i> UX & Performance

::: info Change Detection
AsyncFlowState uses `BehaviorSubject` internally, which integrates seamlessly with `ChangeDetectionStrategy.OnPush`. This ensures your components only re-render when the flow state actually changes, optimizing performance for complex dashboards.
:::

::: tip Rule of 400ms
Next JS or React actions can feel "jittery" if they return too quickly, causing a loading spinner to flash for just a few frames. Use `loading: { minDuration: 400 }` to ensure your UI feels stable and predictable.
:::
