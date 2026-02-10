/**
 * Example: Using Lifecycle Hooks with AsyncFlowState
 *
 * This example demonstrates how to integrate AsyncFlowState with:
 * - Toast notification systems
 * - Logging services
 * - Analytics tracking
 * - Custom retry UI
 */

import React, { useEffect } from "react";
import { useFlow, FlowProvider } from "@asyncflowstate/react";

// Dummy declarations for external libraries used in examples
const toast = {
  success: (msg: string) => console.log("Toast Success:", msg),
  error: (msg: string) => console.error("Toast Error:", msg),
  info: (msg: string) => console.log("Toast Info:", msg),
  warning: (msg: string) => console.warn("Toast Warning:", msg),
};

const analytics = {
  track: (event: string, properties?: any) =>
    console.log("Analytics Track:", event, properties),
};

const api = {
  saveData: async (data: any) => ({ success: true, ...data }),
  save: async (data: any) => ({ success: true, id: "123", ...data }),
};

const logger = {
  info: (msg: string, meta?: any) => console.log("INFO:", msg, meta),
  error: (msg: string, error?: any) => console.error("ERROR:", msg, error),
  debug: (msg: string, meta?: any) => console.log("DEBUG:", msg, meta),
};

const Sentry = {
  captureException: (error: any) => console.error("Sentry:", error),
};

const NProgress = {
  start: () => console.log("NProgress Start"),
  done: () => console.log("NProgress Done"),
};

const uploadFile = async (file: File) => ({ url: "..." });
const processCheckout = async (items: any) => ({ orderId: "123", total: 0 });
const complexOperation = async () => ({ res: "ok" });
const YourApp = () => <div>App</div>;

// =============================================================================
function SaveButton() {
  const flow = useFlow(
    async (data) => {
      return await api.save(data);
    },
    {
      onStart: () => {
        console.log("Starting save operation...");
      },
      onSuccess: (result) => {
        toast.success(`Saved successfully! ID: ${result.id}`);
      },
      onError: (error) => {
        toast.error(`Failed to save: ${error.message}`);
      },
      onSettled: (data, error) => {
        console.log("Operation completed", { data, error });
      },
    },
  );

  return (
    <button {...flow.button()}>{flow.loading ? "Saving..." : "Save"}</button>
  );
}

// Example 2: Retry Progress UI
function UploadWithRetry() {
  const [retryStatus, setRetryStatus] = React.useState("");

  const flow = useFlow(uploadFile, {
    retry: {
      maxAttempts: 3,
      delay: 2000,
      backoff: "exponential",
    },
    onStart: () => {
      setRetryStatus("Uploading...");
    },
    onRetry: (error, attempt, maxAttempts) => {
      setRetryStatus(`Upload failed. Retrying... (${attempt}/${maxAttempts})`);
      toast.warning(`Retry attempt ${attempt} of ${maxAttempts}`);
    },
    onSuccess: () => {
      setRetryStatus("Upload complete!");
      toast.success("File uploaded successfully");
    },
    onError: (error) => {
      setRetryStatus("Upload failed after all retries");
      toast.error("Upload failed. Please try again later.");
    },
  });

  return (
    <div>
      <button {...flow.button()}>Upload File</button>
      {retryStatus && <p className="status">{retryStatus}</p>}
    </div>
  );
}

// Example 3: Analytics Tracking
function CheckoutButton() {
  const flow = useFlow(processCheckout, {
    onStart: (args) => {
      analytics.track("checkout_started", {
        items: args[0].items,
        total: args[0].total,
      });
    },
    onSuccess: (result) => {
      analytics.track("checkout_completed", {
        orderId: result.orderId,
        revenue: result.total,
      });
    },
    onError: (error) => {
      analytics.track("checkout_failed", {
        error: error.message,
        errorType: error.type,
      });
    },
    onCancel: () => {
      analytics.track("checkout_cancelled");
    },
  });

  return (
    <div>
      <button {...flow.button()}>Complete Purchase</button>
      {flow.loading && <button onClick={flow.cancel}>Cancel</button>}
    </div>
  );
}

// Example 4: Global Logging with FlowProvider
function App() {
  return (
    <FlowProvider
      config={{
        // Global lifecycle hooks for all flows
        onStart: (args) => {
          logger.debug("Flow started", { args });
        },
        onSuccess: (data) => {
          logger.info("Flow succeeded", { data });
        },
        onError: (error) => {
          logger.error("Flow failed", { error });
          // Send to error tracking service
          Sentry.captureException(error);
        },
        onSettled: (data, error) => {
          logger.debug("Flow settled", {
            success: !!data,
            failed: !!error,
          });
        },
        // Global retry configuration
        retry: {
          maxAttempts: 3,
          backoff: "exponential",
        },
      }}
    >
      <YourApp />
    </FlowProvider>
  );
}

// Example 5: Custom Loading Indicator with Lifecycle
function SmartLoadingButton() {
  const [operationLog, setOperationLog] = React.useState<string[]>([]);

  const addLog = (message: string) => {
    setOperationLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const flow = useFlow(
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (Math.random() > 0.5) throw new Error("Random failure");
      return "Success!";
    },
    {
      onStart: () => addLog("🚀 Operation started"),
      onRetry: (error, attempt, max) => {
        addLog(`🔄 Retry ${attempt}/${max} after error: ${error.message}`);
      },
      onSuccess: (data) => addLog(`✅ Success: ${data}`),
      onError: (error) => addLog(`❌ Failed: ${error.message}`),
      onSettled: () => addLog("🏁 Operation finished"),
      onCancel: () => addLog("⛔ Operation cancelled"),
      retry: { maxAttempts: 3, delay: 1000 },
    },
  );

  return (
    <div>
      <button {...flow.button()}>
        {flow.loading ? "Processing..." : "Start Operation"}
      </button>
      {flow.loading && <button onClick={flow.cancel}>Cancel</button>}

      <div className="log">
        <h3>Operation Log:</h3>
        {operationLog.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}

// Example 6: Combining Multiple Lifecycle Hooks
function CompleteExample() {
  const flow = useFlow(complexOperation, {
    // Called when execute() is invoked
    onStart: (args) => {
      console.log("Starting with args:", args);
      NProgress.start();
    },

    // Called after successful completion
    onSuccess: (data) => {
      console.log("Operation succeeded:", data);
      toast.success("Operation completed!");
    },

    // Called on each retry attempt
    onRetry: (error, attempt, maxAttempts) => {
      console.warn(`Retry ${attempt}/${maxAttempts}:`, error);
      toast.info(`Retrying... (${attempt}/${maxAttempts})`);
    },

    // Called after all retries fail
    onError: (error) => {
      console.error("Operation failed:", error);
      toast.error("Operation failed after retries");
      Sentry.captureException(error);
    },

    // Called when cancel() is invoked
    onCancel: () => {
      console.log("Operation cancelled by user");
      toast.info("Operation cancelled");
    },

    // Called after success OR error (like finally)
    onSettled: (data, error) => {
      console.log("Operation settled:", { data, error });
      NProgress.done();
      analytics.track("operation_completed", {
        success: !!data,
        error: error?.message,
      });
    },

    retry: {
      maxAttempts: 3,
      delay: 1000,
      backoff: "exponential",
    },
  });

  return (
    <button {...flow.button()}>
      {flow.loading ? "Processing..." : "Execute"}
    </button>
  );
}

export {
  SaveButton,
  UploadWithRetry,
  CheckoutButton,
  App,
  SmartLoadingButton,
  CompleteExample,
};
