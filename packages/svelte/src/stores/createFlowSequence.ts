import { writable } from "svelte/store";
import {
  FlowSequence,
  type SequenceStep,
  type SequenceState,
} from "@asyncflowstate/core";

/**
 * Creates a Svelte store for orchestrating sequential async workflows.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createFlowSequence } from '@asyncflowstate/svelte';
 *   const sequence = createFlowSequence([
 *     { name: 'Validate', flow: validateFlow.flow },
 *     { name: 'Submit', flow: submitFlow.flow },
 *   ]);
 * </script>
 *
 * <button on:click={() => sequence.execute()} disabled={$sequence.loading}>
 *   Step: {$sequence.currentStep?.name ?? 'Ready'} ({$sequence.progress}%)
 * </button>
 * ```
 */
export function createFlowSequence(steps: SequenceStep[]) {
  const sequence = new FlowSequence(steps);

  const store = writable<
    SequenceState & { loading: boolean; currentStep: SequenceStep | null }
  >({
    ...sequence.state,
    loading: false,
    currentStep: null,
  });

  const unsubscribe = sequence.subscribe((state) => {
    store.set({
      ...state,
      loading: state.status === "loading",
      currentStep:
        state.currentStepIndex >= 0 ? steps[state.currentStepIndex] : null,
    });
  });

  return {
    subscribe: store.subscribe,
    execute: (initialInput?: any) => sequence.execute(initialInput),
    reset: () => sequence.reset(),
    cancel: () => sequence.cancel(),
    destroy: () => unsubscribe(),
  };
}
