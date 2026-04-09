// @ts-nocheck
/**
 * AsyncFlowState - Angular Examples
 *
 * Demonstrates how to use @asyncflowstate/angular factories with RxJS.
 */
import { Component, OnDestroy } from "@angular/core";
import { AsyncPipe, NgIf, NgFor } from "@angular/common";
import {
  createFlow,
  createFlowSequence,
  createFlowList,
} from "@asyncflowstate/angular";

@Component({
  selector: "app-examples",
  standalone: true,
  imports: [AsyncPipe, NgIf, NgFor],
  template: `
    <div class="examples">
      <!-- Example 1: Basic Flow -->
      <section *ngIf="userFlow.state$ | async as state">
        <h2>Basic BehaviorSubject Fetching</h2>

        <button (click)="userFlow.execute('123')" [disabled]="state.loading">
          {{ state.loading ? "Fetching..." : "Load User" }}
        </button>

        <div *ngIf="state.data">
          <p>Name: {{ state.data.name }}</p>
        </div>
        <div *ngIf="state.error" class="error">
          {{ state.error.message }}
        </div>
      </section>

      <!-- Example 2: Keyed List execution -->
      <section *ngIf="deleteFlow.state$ | async as listState">
        <h2>List Executions (No global blocking)</h2>
        <ul>
          <li *ngFor="let item of items">
            {{ item.name }}
            <button
              (click)="deleteFlow.execute(item.id, item.id)"
              [disabled]="listState.states[item.id]?.status === 'loading'"
            >
              {{
                listState.states[item.id]?.status === "loading"
                  ? "Deleting..."
                  : "Delete"
              }}
            </button>
          </li>
        </ul>
      </section>

      <!-- Example 3: Sequence -->
      <section *ngIf="sequence.state$ | async as seqState">
        <h2>Sequence Orchestration</h2>
        <button (click)="sequence.execute()" [disabled]="seqState.loading">
          Run Sequence ({{ seqState.progress }}%)
        </button>
        <p *ngIf="seqState.currentStep">
          Running: {{ seqState.currentStep.name }}
        </p>
      </section>
    </div>
  `,
  styles: [
    `
      .error {
        color: red;
        font-size: 0.8em;
      }
      section {
        margin-bottom: 2rem;
        padding: 1rem;
        border: 1px solid #ccc;
      }
    `,
  ],
})
export class ExamplesComponent implements OnDestroy {
  // 1. Basic Flow
  userFlow = createFlow(
    async (id: string) => {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    { retry: { maxAttempts: 3 } },
  );

  // 2. Flow List
  deleteFlow = createFlowList(async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
  items = [
    { id: "1", name: "Item 1" },
    { id: "2", name: "Item 2" },
  ];

  // 3. Flow Sequence
  sequence = createFlowSequence([
    { name: "Auth", flow: this.userFlow.flow },
    {
      name: "Fetch Data",
      flow: createFlow(async () => {
        /* another task */
      }).flow,
    },
  ]);

  ngOnDestroy() {
    // Cleanup subscriptions and flow instances
    this.userFlow.destroy();
    this.deleteFlow.destroy();
    this.sequence.destroy();
  }
}
