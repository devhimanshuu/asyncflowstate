<script setup lang="ts">
/**
 * AsyncFlowState - Vue Examples
 *
 * Demonstrates how to use @asyncflowstate/vue composables.
 */
import { ref } from "vue";
import {
  useFlow,
  useFlowSequence,
  useFlowParallel,
  provideFlowConfig,
} from "@asyncflowstate/vue";
import { z } from "zod";

// =============================================================================
// Example 1: Global Config Setup (Root Component Level)
// =============================================================================
provideFlowConfig({
  retry: { maxAttempts: 2, backoff: "exponential" },
  loading: { minDuration: 300 }, // Prevent UI flickering
});

// =============================================================================
// Example 2: Basic Data Fetching
// =============================================================================
const fetchUserFlow = useFlow(
  async (id: string) => {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error("User not found");
    return res.json();
  },
  {
    onSuccess: (user) => console.log("User loaded:", user),
  },
);

// =============================================================================
// Example 3: Form Handling with Zod Validation
// =============================================================================
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password too short"),
});

const loginFlow = useFlow(async (data: any) => {
  // API Call
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { token: "xyz" };
});

// =============================================================================
// Example 4: Sequential Workflow
// =============================================================================
const sequence = useFlowSequence([
  { name: "Validate", flow: loginFlow.flow }, // Link to existing flow
  {
    name: "Fetch Profile",
    flow: fetchUserFlow.flow,
    mapInput: (prevResult) => prevResult?.token, // Pipe result to next step
  },
]);
</script>

<template>
  <div class="examples">
    <!-- Example 2 UI -->
    <section>
      <h2>Basic Data Fetching</h2>
      <button
        v-bind="fetchUserFlow.button()"
        @click="fetchUserFlow.execute('123')"
      >
        {{ fetchUserFlow.loading ? "Fetching..." : "Load User" }}
      </button>

      <div v-if="fetchUserFlow.data">
        <p>Name: {{ fetchUserFlow.data.name }}</p>
      </div>
      <div v-if="fetchUserFlow.error" class="error">
        {{ fetchUserFlow.error.message }}
      </div>
    </section>

    <!-- Example 3 UI -->
    <section>
      <h2>Form Validation</h2>
      <form
        v-bind="loginFlow.form({ schema: formSchema, extractFormData: true })"
      >
        <div>
          <label>Email</label>
          <input name="email" type="email" />
          <span class="error" v-if="loginFlow.fieldErrors.email">
            {{ loginFlow.fieldErrors.email }}
          </span>
        </div>

        <div>
          <label>Password</label>
          <input name="password" type="password" />
          <span class="error" v-if="loginFlow.fieldErrors.password">
            {{ loginFlow.fieldErrors.password }}
          </span>
        </div>

        <button type="submit" :disabled="loginFlow.loading">
          {{ loginFlow.loading ? "Logging in..." : "Login" }}
        </button>
      </form>
    </section>

    <!-- Example 4 UI -->
    <section>
      <h2>Sequence Workflow</h2>
      <button @click="sequence.execute()" :disabled="sequence.loading">
        Run Async Sequence ({{ sequence.progress }}%)
      </button>
      <p>Current Step: {{ sequence.currentStep?.name || "Idle" }}</p>
    </section>
  </div>
</template>

<style scoped>
.error {
  color: red;
  font-size: 0.8em;
}
section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
}
</style>
