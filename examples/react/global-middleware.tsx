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
  onStart: (args, context) => {
    // Note: We use the context to get a telemetry name or default to the flow's name
    const flowId = context.options.debugName || "unnamed_flow";
    startTimeMap.set(flowId, Date.now());
  },
  onSettled: (data, error, context) => {
    const flowId = context.options.debugName || "unnamed_flow";
    const start = startTimeMap.get(flowId);
    if (start) {
      const duration = Date.now() - start;
      const name = context.meta.telemetryName || flowId;
      console.log(
        `Global Telemetry: Flow [${name}] completed in ${duration}ms`,
      );
    }
  },
};

// ============================================================================
// Use Case 3: Toast Interceptor
// Automatically show success/error toasts based on meta flags
// ============================================================================

const toastInterceptor: FlowMiddleware = {
  onSuccess: (data, context) => {
    // Check for a 'toast' flag in the flow's meta
    if (context.meta.toast) {
      console.log(
        `Global Toast: [${context.meta.telemetryName || "Flow"}] Operation succeeded!`,
      );
    }
  },
  onError: (error, context) => {
    if (context.meta.toast) {
      console.error(
        `Global Toast: [${context.meta.telemetryName || "Flow"}] Operation failed!`,
        error,
      );
    }
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
      debugName: "SaveProfile",
      meta: { toast: true, telemetryName: "User_SaveProfile" },
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
        <p>Error occurred - check console for Auth Interceptor logic</p>
      )}
    </div>
  );
}
