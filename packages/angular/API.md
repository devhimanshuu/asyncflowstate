# Angular Package - API Reference & Usage Guide

## Overview

`@asyncflowstate/angular` provides Observable/BehaviorSubject-based factory functions for the AsyncFlowState engine.

## Services

### createFlow(action, options?)

Core factory for managing a single async action. Returns a `state$` BehaviorSubject.

```typescript
import { createFlow } from "@asyncflowstate/angular";

const flow = createFlow(async (id: string) => api.fetchUser(id), {
  retry: { maxAttempts: 3, backoff: "exponential" },
});

// In template with async pipe:
// <ng-container *ngIf="flow.state$ | async as state">
//   <button [disabled]="state.loading">{{ state.loading ? 'Loading...' : 'Go' }}</button>
// </ng-container>
```

### createFlowSequence(steps)

Factory for sequential workflows. Returns `state$` Observable.

### createFlowParallel(flows, strategy?)

Factory for parallel execution. Returns `state$` Observable.

### createFlowList(action, options?)

Factory for multiple keyed flow instances. Returns `state$` Observable.

### createInfiniteFlow(action, options)

Factory for paginated data fetching. Returns `state$` Observable.

## Types

```typescript
import type {
  AngularFlowOptions,
  FlowSignalState,
  AngularInfiniteFlowOptions,
} from "@asyncflowstate/angular";
```
