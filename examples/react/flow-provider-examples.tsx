/**
 * AsyncFlowState - FlowProvider Examples
 *
 * These examples demonstrate how to use FlowProvider for global configuration.
 */

import React from "react";
import { FlowProvider, useFlow } from "@asyncflowstate/react";

// =============================================================================
// Example 1: Global Error Handling with Toast
// =============================================================================

// Mock toast library
const toast = {
  error: (message: string) => console.error("Toast:", message),
  success: (message: string) => console.log("Toast:", message),
};

/**
 * BEFORE: Every component needs its own error handler
 */
export function WithoutProvider() {
  const saveFlow = useFlow(
    async (data: any) => {
      const response = await fetch("/api/save", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Save failed");
      return response.json();
    },
    {
      onError: (err: any) => toast.error(err.message), // Repeated everywhere
    },
  );

  const deleteFlow = useFlow(
    async (id: number) => {
      const response = await fetch(`/api/delete/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
    },
    {
      onError: (err: any) => toast.error(err.message), // Repeated again
    },
  );

  return (
    <div>
      <button onClick={() => saveFlow.execute({ name: "Test" })}>Save</button>
      <button onClick={() => deleteFlow.execute(1)}>Delete</button>
    </div>
  );
}

/**
 * AFTER: Global error handler configured once
 */
export function WithProviderApp() {
  return (
    <FlowProvider
      config={{
        onError: (err: any) => toast.error(err.message),
        retry: { maxAttempts: 3, backoff: "exponential" },
        loading: { minDuration: 300 },
      }}
    >
      <Dashboard />
    </FlowProvider>
  );
}

function Dashboard() {
  // No need to specify onError - it's inherited from FlowProvider
  const saveFlow = useFlow(async (data: any) => {
    const response = await fetch("/api/save", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Save failed");
    return response.json();
  });

  const deleteFlow = useFlow(async (id: number) => {
    const response = await fetch(`/api/delete/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Delete failed");
  });

  return (
    <div>
      <button onClick={() => saveFlow.execute({ name: "Test" })}>Save</button>
      <button onClick={() => deleteFlow.execute(1)}>Delete</button>
    </div>
  );
}

// =============================================================================
// Example 2: Global Retry Configuration
// =============================================================================

export function AppWithGlobalRetry() {
  return (
    <FlowProvider
      config={{
        retry: {
          maxAttempts: 3,
          delay: 1000,
          backoff: "exponential",
        },
        onError: (err: any) => {
          console.error("Global error handler:", err);
          toast.error(`Error: ${err.message}`);
        },
      }}
    >
      <NetworkSensitiveApp />
    </FlowProvider>
  );
}

function NetworkSensitiveApp() {
  // This flow inherits retry configuration from FlowProvider
  const fetchUserFlow = useFlow(async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  });

  // This flow overrides the retry configuration
  const criticalFlow = useFlow(
    async (data: any) => {
      const response = await fetch("/api/critical", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Critical operation failed");
      return response.json();
    },
    {
      retry: { maxAttempts: 5 }, // Override global maxAttempts
      // Still inherits delay and backoff from global config
    },
  );

  return (
    <div>
      <button onClick={() => fetchUserFlow.execute("123")}>
        Fetch User (3 retries)
      </button>
      <button onClick={() => criticalFlow.execute({ important: true })}>
        Critical Action (5 retries)
      </button>
    </div>
  );
}

// =============================================================================
// Example 3: Global UX Polish Settings
// =============================================================================

export function AppWithUXPolish() {
  return (
    <FlowProvider
      config={{
        loading: {
          minDuration: 500, // Prevent UI flashes
          delay: 200, // Don't show spinner for fast requests
        },
        autoReset: {
          enabled: true,
          delay: 3000, // Auto-reset success state after 3s
        },
      }}
    >
      <SmoothUIApp />
    </FlowProvider>
  );
}

function SmoothUIApp() {
  const quickActionFlow = useFlow(async () => {
    // Simulates a fast API call (100ms)
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { success: true };
  });

  const slowActionFlow = useFlow(async () => {
    // Simulates a slow API call (2s)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { success: true };
  });

  return (
    <div>
      <button {...quickActionFlow.button()}>
        {quickActionFlow.loading ? "Loading..." : "Quick Action"}
      </button>
      <button {...slowActionFlow.button()}>
        {slowActionFlow.loading ? "Loading..." : "Slow Action"}
      </button>
      {quickActionFlow.status === "success" && <p>Quick action succeeded!</p>}
      {slowActionFlow.status === "success" && <p>Slow action succeeded!</p>}
    </div>
  );
}

// =============================================================================
// Example 4: Nested Providers for Different Sections
// =============================================================================

export function AppWithNestedProviders() {
  return (
    <FlowProvider
      config={{
        onError: (err: any) => toast.error(err.message),
        retry: { maxAttempts: 2 },
      }}
    >
      <MainApp />
    </FlowProvider>
  );
}

function MainApp() {
  return (
    <div>
      <h1>Main App (2 retries)</h1>
      <RegularSection />

      {/* Admin section has different requirements */}
      <FlowProvider
        config={{
          retry: { maxAttempts: 5 },
          loading: { minDuration: 500 },
          onError: (err: any) => {
            console.error("Admin error:", err);
            toast.error(`Admin Error: ${err.message}`);
          },
        }}
      >
        <AdminSection />
      </FlowProvider>
    </div>
  );
}

function RegularSection() {
  const flow = useFlow(async () => {
    throw new Error("Regular error");
  });

  return (
    <div>
      <h2>Regular Section</h2>
      <button onClick={() => flow.execute()}>Trigger Error (2 retries)</button>
    </div>
  );
}

function AdminSection() {
  const flow = useFlow(async () => {
    throw new Error("Admin error");
  });

  return (
    <div>
      <h2>Admin Section</h2>
      <button onClick={() => flow.execute()}>Trigger Error (5 retries)</button>
    </div>
  );
}

// =============================================================================
// Example 5: Complete Real-World Setup
// =============================================================================

export function ProductionApp() {
  return (
    <FlowProvider
      config={{
        // Global error handling
        onError: (err: any) => {
          // Log to error tracking service
          console.error("Error tracked:", err);

          // Show user-friendly message
          if (err.message.includes("network")) {
            toast.error("Network error. Please check your connection.");
          } else if (err.message.includes("unauthorized")) {
            toast.error("Session expired. Please log in again.");
          } else {
            toast.error("Something went wrong. Please try again.");
          }
        },

        // Global success handling
        onSuccess: (data: any) => {
          console.log("Action succeeded:", data);
        },

        // Retry configuration for resilience
        retry: {
          maxAttempts: 3,
          delay: 1000,
          backoff: "exponential",
          shouldRetry: (error: any, attempt: number) => {
            // Don't retry on validation errors
            if (error.message.includes("validation")) return false;
            // Don't retry on auth errors
            if (error.message.includes("unauthorized")) return false;
            // Retry on network errors
            return true;
          },
        },

        // UX polish
        loading: {
          minDuration: 300, // Prevent flashes
          delay: 150, // Don't show spinner immediately
        },

        // Auto-reset success messages
        autoReset: {
          enabled: true,
          delay: 5000,
        },

        // Prevent double-submissions
        concurrency: "keep",
      }}
    >
      <AppContent />
    </FlowProvider>
  );
}

function AppContent() {
  const loginFlow = useFlow(
    async (credentials: { email: string; password: string }) => {
      const response = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      if (!response.ok) throw new Error("Login failed");
      return response.json();
    },
    {
      // Override global onSuccess for this specific flow
      onSuccess: (user: any) => {
        toast.success(`Welcome back, ${user.name}!`);
        // Redirect to dashboard
      },
    },
  );

  return (
    <div>
      <button
        onClick={() =>
          loginFlow.execute({ email: "user@example.com", password: "pass" })
        }
      >
        {loginFlow.loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
