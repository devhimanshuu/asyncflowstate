/**
 * Smart Persistence Examples
 * Demonstrates how AsyncFlowState can persist state across page refreshes
 * and resume interrupted operations like file uploads.
 */

import { Flow, generatePersistenceKey } from "@asyncflowstate/core";

// ============================================================================
// Example 1: Basic State Persistence
// ============================================================================

/**
 * Simple example: Persist successful data so it's available on page reload
 */
export function basicPersistenceExample() {
  const flow = new Flow(
    async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    },
    {
      persist: {
        key: "user-profile",
        storage: "local", // or 'session'
      },
    },
  );

  // On first load, execute the flow
  flow.execute("user-123");

  // On subsequent page loads, the data is automatically restored
  console.log(flow.data); // Will show cached data immediately
}

// ============================================================================
// Example 2: Resumable File Upload
// ============================================================================

/**
 * Advanced example: Resume a file upload that was interrupted by page refresh
 */
export function resumableFileUploadExample(file: File) {
  const fileId = "upload-abc123";

  const flow = new Flow(
    async (uploadFile: File) => {
      // Simulated chunked upload with progress tracking
      const totalChunks = Math.ceil(uploadFile.size / (1024 * 1024)); // 1MB chunks

      for (let i = 0; i < totalChunks; i++) {
        // Upload chunk
        await uploadChunk(uploadFile, i);

        // Update progress
        const progress = Math.round(((i + 1) / totalChunks) * 100);
        flow.setProgress(progress);

        // Small delay to simulate network
        await new Promise((r) => setTimeout(r, 100));
      }

      return { fileId, uploadedAt: new Date().toISOString() };
    },
    {
      persist: {
        key: generatePersistenceKey("file-upload", fileId),
        storage: "local",
        persistLoading: true, // KEY: Persist loading states
        ttl: 60 * 60 * 1000, // 1 hour

        // Called when an interrupted loading state is detected
        onInterruptedLoading: (state) => {
          const shouldResume = confirm(
            `Upload was interrupted at ${state.progress}%. Resume?`,
          );

          if (shouldResume) {
            // Resume with persisted args (file will be restored from state.lastArgs)
            // TypeScript requires args, but they're optional if persisted
            flow.resume(file);
          } else {
            // Clear the persisted state
            flow.reset();
          }
        },

        // Optional: Validate before restoring
        onRestore: (state) => {
          // Only restore if less than 1 hour old
          const age = Date.now() - state.timestamp;
          return age < 60 * 60 * 1000;
        },
      },

      onSuccess: (result) => {
        console.log("Upload complete!", result);
      },
    },
  );

  return flow;
}

// Helper function (mock)
async function uploadChunk(file: File, chunkIndex: number): Promise<void> {
  // Implementation would upload actual chunk
  console.log(`Uploading chunk ${chunkIndex}`);
}

// ============================================================================
// Example 3: Form Draft Auto-Save
// ============================================================================

/**
 * Auto-save form data as user types, restore on page reload
 */
export function formDraftExample() {
  const flow = new Flow(
    async (formData: { title: string; content: string }) => {
      // Save draft to server
      const response = await fetch("/api/drafts", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      return response.json();
    },
    {
      persist: {
        key: "blog-post-draft",
        storage: "local",
        ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      },

      // Debounce to avoid too many saves
      debounce: 1000,

      onSuccess: (draft) => {
        console.log("Draft saved:", draft);
      },
    },
  );

  // Restore draft on page load
  if (flow.data) {
    console.log("Restored draft:", flow.data);
    // Populate form fields with flow.data
  }

  return flow;
}

// ============================================================================
// Example 4: Shopping Cart Persistence
// ============================================================================

/**
 * Cart item interface
 */
export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

/**
 * Persist shopping cart across sessions
 */
export function shoppingCartExample() {
  const CartItemType: CartItem = {} as CartItem; // Type reference
  interface _CartItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }

  const flow = new Flow(
    async (items: CartItem[]) => {
      // Sync cart with server
      const response = await fetch("/api/cart", {
        method: "PUT",
        body: JSON.stringify({ items }),
      });
      return response.json();
    },
    {
      persist: {
        key: "shopping-cart",
        storage: "local",
        persistError: false, // Don't persist errors
      },

      // Optimistic updates for instant UI feedback
      optimisticResult: (prevData, [items]) => items,

      onSuccess: (cart) => {
        console.log("Cart synced:", cart);
      },
    },
  );

  // Cart is automatically restored on page load
  return flow;
}

// ============================================================================
// Example 5: Multi-Step Form with Progress Persistence
// ============================================================================

/**
 * Form progress interface
 */
export interface FormProgress {
  currentStep: number;
  data: {
    step1?: any;
    step2?: any;
    step3?: any;
  };
}

/**
 * Persist progress through a multi-step form wizard
 */
export function multiStepFormExample() {
  const FormProgressType: FormProgress = {} as FormProgress; // Type reference
  interface _FormProgress {
    currentStep: number;
    data: {
      step1?: any;
      step2?: any;
      step3?: any;
    };
  }

  const flow = new Flow(
    async (progress: FormProgress) => {
      // Save progress to server
      const response = await fetch("/api/form-progress", {
        method: "POST",
        body: JSON.stringify(progress),
      });
      return response.json();
    },
    {
      persist: {
        key: "multi-step-form",
        storage: "session", // Clear when browser closes

        onRestore: (state) => {
          // Show notification that progress was restored
          console.log(`Resuming from step ${state.data?.currentStep || 1}`);
          return true;
        },
      },
    },
  );

  return flow;
}

// ============================================================================
// Example 6: Background Sync with Persistence
// ============================================================================

/**
 * Persist pending operations for background sync
 */
export function backgroundSyncExample() {
  const flow = new Flow(
    async (operation: { type: string; payload: any }) => {
      // Attempt to sync with server
      const response = await fetch("/api/sync", {
        method: "POST",
        body: JSON.stringify(operation),
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      return response.json();
    },
    {
      persist: {
        key: "pending-sync-operations",
        storage: "local",
        persistLoading: true,
        persistError: true, // Persist errors to retry later

        onInterruptedLoading: (state) => {
          // Automatically retry on page load
          console.log("Retrying pending sync operation...");
          flow.resume();
        },
      },

      retry: {
        maxAttempts: 5,
        delay: 2000,
        backoff: "exponential",
      },
    },
  );

  return flow;
}
