import { ref, reactive, computed, onUnmounted } from "vue";
import {
  FlowSequence,
  type SequenceStep,
  type SequenceState,
} from "@asyncflowstate/core";

/**
 * Vue 3 composable for orchestrating sequential async workflows.
 * Each step executes in order, with optional input mapping between steps.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFlowSequence } from '@asyncflowstate/vue';
 *
 * const sequence = useFlowSequence([
 *   { name: 'Validate', flow: validateFlow },
 *   { name: 'Submit', flow: submitFlow, mapInput: (prev) => prev.data },
 *   { name: 'Notify', flow: notifyFlow },
 * ]);
 * </script>
 *
 * <template>
 *   <button @click="sequence.execute()" :disabled="sequence.loading">
 *     {{ sequence.loading ? `Step ${sequence.currentStepIndex + 1}...` : 'Run Workflow' }}
 *   </button>
 *   <p>Progress: {{ sequence.progress }}%</p>
 * </template>
 * ```
 */
export function useFlowSequence(steps: SequenceStep[]) {
  const sequence = new FlowSequence(steps);

  const status = ref(sequence.state.status);
  const progress = ref(sequence.state.progress);
  const results = ref(sequence.state.results);
  const error = ref(sequence.state.error);
  const currentStepIndex = ref(sequence.state.currentStepIndex);

  const loading = computed(() => status.value === "loading");
  const currentStep = computed(() =>
    currentStepIndex.value >= 0
      ? steps[currentStepIndex.value]
      : null,
  );

  const unsubscribe = sequence.subscribe((state: SequenceState) => {
    status.value = state.status;
    progress.value = state.progress;
    results.value = state.results;
    error.value = state.error;
    currentStepIndex.value = state.currentStepIndex;
  });

  onUnmounted(() => {
    unsubscribe();
  });

  return reactive({
    status,
    progress,
    results,
    error,
    currentStepIndex,
    loading,
    currentStep,
    execute: (initialInput?: any) => sequence.execute(initialInput),
    reset: () => sequence.reset(),
    cancel: () => sequence.cancel(),
  });
}
