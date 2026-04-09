# Building a Resilient Form

Automate loading states, add error handling, and implement smart retries for a professional submission experience.

---

In this tutorial, we'll build a "Contact Us" form that doesn't just work — it feels premium. We'll use **AsyncFlowState** to handle all the "unhappy paths" that usually take hundreds of lines of boilerplate.

## 1. Setup

First, let's create a basic form with a `useFlow` hook. We'll assume you're using React, but this pattern works identically in Vue, Svelte, or SolidJS.

```tsx
import { useFlow } from "@asyncflowstate/react";

function ContactForm() {
  const flow = useFlow(async (data: FormData) => {
    // Simulate a server request
    await new Promise(r => setTimeout(r, 800));
    return await api.sendMessage(data);
  });

  return (
    <form {...flow.form()}>
      <input name="email" type="email" required />
      <textarea name="message" required />

      <button {...flow.button()}>
        {flow.loading ? "Sending..." : "Send Message"}
      </button>

      {flow.error && (
        <p ref={flow.errorRef} role="alert" className="error">
          {flow.error.message}
        </p>
      )}
    </form>
  );
}
```

### <i class="fa-solid fa-circle-check text-emerald-500"></i> What we just achieved:
*   **Automatic Loading**: The button disables itself and shows "Sending..." during the request.
*   **Double-Click Prevention**: The form won't submit twice if a user spam-clicks the button.
*   **Accessibility**: ARIA attributes like `aria-busy` and `aria-disabled` are managed for you.
*   **Error Focus**: If the server fails, the error message is automatically focused for screen readers via `flow.errorRef`.

---

## 2. Adding Self-Healing Retries

Network requests are fragile. Let's add an **Exponential Backoff** retry policy to handle transient network errors (like flickering Wi-Fi).

```tsx {7-10}
const flow = useFlow(sendMessage, {
  retry: {
    maxAttempts: 3,
    backoff: "exponential",
    jitter: true,
  },
  onError: (err) => toast.error(`Failed after 3 retries: ${err.message}`),
});
```

### Why this is "Premium":
By using **Jitter**, we prevent "stampeding" our server if multiple clients fail at the same time. The library handles the math — you just set the flag.

---

## 3. UI Polish with `minDuration`

Fast servers can sometimes feel "jittery" if the loading spinner disappears too quickly. We can enforce a minimum stable duration for the loading state.

```tsx {11-13}
const flow = useFlow(sendMessage, {
  retry: { /* ... */ },
  loading: {
    minDuration: 400, // loading state stays visible for at least 400ms
  },
});
```

::: tip UX Tip
This prevents the "flicker" effect on fast connections, making your app feel more deliberate and stable.
:::

---

## 4. Handling Field Validations

Often, server errors are specific to a field (e.g., "Email already exists"). AsyncFlowState can map these errors directly to your UI.

```tsx {9,17}
const flow = useFlow(sendMessage, {
  // Map server errors to specific field IDs
  onValidationError: (errors) => {
     // ... handle custom logic if needed
  }
});

return (
  <form {...flow.form()}>
    <input name="email" />
    {flow.fieldErrors.email && <span className="error">{flow.fieldErrors.email}</span>}
    {/* ... */}
  </form>
)
```

---

## 5. Final UX Summary

Your form now has:
1.  **Zero-Boilerplate Loading**: No manual `setLoading` state.
2.  **Resilience**: Smart retries with jitter and backoff.
3.  **Stability**: Guaranteed minimum loading time for a smoother UI.
4.  **Accessibility**: Industry-standard ARIA management.
5.  **Focus Management**: Automatic focus on error messages.

### <i class="fa-solid fa-rocket text-brand"></i> Next Steps
Learn how to use **Optimistic UI** to make this form feel even faster in the next tutorial.

[Go to Optimistic UI Tutorial →](/guide/tutorials/optimistic-patterns)
