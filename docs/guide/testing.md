# Testing & Network Jitter <i class="fa-solid fa-sparkles text-amber-500"></i>

<TestingJitterAnimation />

Testing asynchronous flows under perfect "localhost" conditions often hides fatal UX bugs triggered by flaky 3G mobile connections.

AsyncFlowState includes dedicated utilities to artificially simulate harsh network environments right in your development or test setup.

## Jitter Simulator

Wrap any standard async function in `simulateJitter()` to inject artificial latency, and induce randomized failures based on geometric probability.

```ts
import { simulateJitter } from "@asyncflowstate/core";

// Let's pretend this is a standard fast backend call
const fetchUser = async (id: string) => api.users.get(id);

// Now let's torture it
const flakyFetchUser = simulateJitter(fetchUser, {
  latency: [300, 1500], // Randomly waits between 300ms and 1500ms
  failureRate: 0.25, // Fails 25% of all calls
  errorObj: new Error("Flaky 3G connection simulating dropout"),
});

const flow = useFlow(flakyFetchUser, {
  retry: {
    maxAttempts: 5,
    backoff: "exponential",
  },
});
```

Using this utility allows you to perfectly visually calibrate your loading spinners, exponential backoff formulas, and Circuit Breaker thresholds without needing to throttle your entire system network.
