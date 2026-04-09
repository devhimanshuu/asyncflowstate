import React from "react";
import {
  FlowProvider,
  useFlow,
  type FlowMiddleware,
} from "@asyncflowstate/react";

// ============================================================================
// Use Case 1: Auth Interceptor
// Automatically trigger a login modal if any flow returns a 401
// ============================================================================

const authInterceptor: FlowMiddleware = {
  onError: (error: any) => {
    if (error?.status === 401) {
      console.log("Global Auth: Unauthorized! Triggering login modal...");
      // window.dispatchEvent(new CustomEvent('open-login-modal'));
    }
  },
};

// ============================================================================
// Use Case 2: Telemetry Interceptor
// Log execution time of specific flows to a monitoring service
// ============================================================================

const startTimeMap = new Map<string, number>();

const telemetryInterceptor: FlowMiddleware = {
  onStart: (args) => {
    // Note: This is simplified. In a real app, you'd use a unique request ID.
    startTimeMap.set("last_execution", Date.now());
  },
  onSettled: (data, error) => {
    const start = startTimeMap.get("last_execution");
    if (start) {
      const duration = Date.now() - start;
      console.log(`Global Telemetry: Flow completed in ${duration}ms`);
    }
  },
};

// ============================================================================
// Use Case 3: Toast Interceptor
// Automatically show success/error toasts based on meta flags
// ============================================================================

const toastInterceptor: FlowMiddleware = {
  onSuccess: (data) => {
    // In a real app, we would have access to the flow's meta via an internal registry
    // or by extending the middleware interface.
    // For now, we can use the 'meta' field if we attach it to the flow context.
    console.log("Global Toast: Operation succeeded!");
  },
  onError: (error) => {
    console.error("Global Toast: Operation failed!", error);
  },
};

// ============================================================================
// App Setup
// ============================================================================

export function GlobalMiddlewareDemo() {
  return (
    <FlowProvider
      config={{
        // Define global behaviors
        behaviors: [authInterceptor, telemetryInterceptor, toastInterceptor],
        // Global defaults
        retry: { maxAttempts: 2 },
      }}
    >
      <UserProfile />
    </FlowProvider>
  );
}

function UserProfile() {
  // This flow will automatically use all 3 global interceptors
  const saveProfile = useFlow(
    async (name: string) => {
      await new Promise((r) => setTimeout(r, 500));
      if (name === "trigger_error") throw { status: 401 };
      return { name };
    },
    {
      meta: { toast: true, telemetryName: "SaveProfile" },
    },
  );

  return (
    <div>
      <h1>Global Middleware Demo</h1>
      <button onClick={() => saveProfile.execute("John Doe")}>
        Save Profile (Success)
      </button>
      <button onClick={() => saveProfile.execute("trigger_error")}>
        Save Profile (401 Error)
      </button>

      {saveProfile.isLoading && <p>Loading...</p>}
      {saveProfile.isSuccess && <p>Saved: {saveProfile.data?.name}</p>}
      {saveProfile.isError && (
        <p>Error occurred check console (Auth Interceptor)</p>
      )}
    </div>
  );
}
