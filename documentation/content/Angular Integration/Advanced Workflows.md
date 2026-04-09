# Advanced Workflows (Angular)

<cite>
**Referenced Files in This Document**
- [packages/angular/src/services/createFlowSequence.ts](file://packages/angular/src/services/createFlowSequence.ts)
- [packages/angular/src/services/createFlowList.ts](file://packages/angular/src/services/createFlowList.ts)
</cite>

Because all data operates under native `state$` stream behavior, combining sequential operations fits completely flawlessly into standard template variables!

## `createFlowSequence`

Instead of creating massive bloated internal logic tracking arrays of arrays and pipeline numbers manually, sequence orchestrators pipe perfectly into pure HTML representations.

```html
<ng-container *ngIf="sequence.state$ | async as pipeline">
  <h3>Active Block: {{ pipeline.currentStep.name }}</h3>

  <!-- Boot Orchestrator Button -->
  <button (click)="sequence.execute()">Start Bootup</button>
</ng-container>
```

## `createFlowList`

Dynamic iterations via `*ngFor` securely map component state mappings using the specific `list.states[ID]` properties!

```html
<ng-container *ngIf="deleteFlow.state$ | async as state">
  <li *ngFor="let item of items">
    <!-- Execute the flow tagged cleanly to independent payload IDs -->
    <button (click)="deleteFlow.execute(item.id, item.id)">
      {{ state.states[item.id]?.status === 'loading' ? 'Deleting' : 'Delete' }}
    </button>
  </li>
</ng-container>
```
