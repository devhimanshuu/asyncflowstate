# <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/solidjs/solidjs-original.svg" style="width: 38px; height: 38px; display: inline-block; margin-right: 12px; vertical-align: middle;" alt="SolidJS Logo" /> SolidJS Integration

The `@asyncflowstate/solid` package provides fine-grained reactive signals for SolidJS applications.

## Installation

```bash
npm install @asyncflowstate/solid @asyncflowstate/core
```

## Fine-Grained Reactivity (createFlow)

The `createFlow` primitive generates fine-grained reactive signals under the hood. No unnecessary VDOM diffing — only the DOM nodes directly reading the state properties will update.

### Example

```tsx
import { createFlow } from "@asyncflowstate/solid";

function UserCard() {
  const flow = createFlow(
    async (id: string) => {
      const response = await fetch(`/api/users/${id}`);
      return response.json();
    },
    {
      onSuccess: (user) => console.log("Fetched:", user.name),
      retry: { maxAttempts: 2 },
    },
  );

  return (
    <div>
      <button
        onClick={() => flow.execute("user-123")}
        disabled={flow.loading()}
      >
        {flow.loading() ? "Loading..." : "Fetch User"}
      </button>

      <Show when={flow.error()}>
        <p class="error">{flow.error()!.message}</p>
      </Show>

      <Show when={flow.data()}>
        <div class="user-card">
          <h2>{flow.data()!.name}</h2>
          <p>{flow.data()!.email}</p>
        </div>
      </Show>
    </div>
  );
}
```

## Signal-Based API

All state properties are SolidJS signals (getter functions):

| Property         | Type            | Description        |
| ---------------- | --------------- | ------------------ |
| `flow.status()`  | `string`        | Current flow state |
| `flow.loading()` | `boolean`       | Loading indicator  |
| `flow.data()`    | `T \| null`     | Last result        |
| `flow.error()`   | `Error \| null` | Last error         |

::: info Fine-Grained Reactivity
Because SolidJS uses signals, only the specific DOM nodes that read a signal will update when it changes — no unnecessary re-renders.
:::

## Native Form Handling

Wrap native DOM events effortlessly with Solid's declarative attributes while async flows manage the data and loading state behind the scenes.

### Example

```tsx
function ContactForm() {
  const flow = createFlow(async (formData: FormData) => {
    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });
    return response.json();
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    flow.execute(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" />
      <input name="email" type="email" placeholder="Email" />
      <textarea name="message" placeholder="Message" />

      <button type="submit" disabled={flow.loading()}>
        {flow.loading() ? "Sending..." : "Send Message"}
      </button>

      <Show when={flow.error()}>
        <p class="error">{flow.error()!.message}</p>
      </Show>

      <Show when={flow.data()}>
        <p class="success">Message sent!</p>
      </Show>
    </form>
  );
}
```

## Global Context Provider

Deliver application-wide flow defaults using the built-in SolidJS Context APIs via the `FlowProvider` component.

### Example

Configure global defaults using SolidJS context:

```tsx
import { FlowProvider } from "@asyncflowstate/solid";

function App() {
  return (
    <FlowProvider
      config={{
        retry: { maxAttempts: 3, backoff: "exponential" },
        loading: { minDuration: 400 },
      }}
    >
      <Routes />
    </FlowProvider>
  );
}
```

## Reactive Effects Integration

Integrate cleanly with `createEffect` and `createMemo` without tracking issues or stale closures, thanks to Solid's signal tracking.

### Example

```tsx
import { createEffect } from "solid-js";

function Dashboard() {
  const flow = createFlow(fetchDashboardData);

  createEffect(() => {
    if (flow.status() === "success") {
      navigate("/dashboard");
    }
  });

  return <button onClick={() => flow.execute()}>Load Dashboard</button>;
}
```

## Resource-Like Pattern

Substitute Solid's `createResource` with `createFlow` for powerful manual control, retry states, and sequential task coordination.

### Example

```tsx
function UserProfile(props) {
  const flow = createFlow(async (id: string) => api.getUser(id));

  // Trigger on prop change
  createEffect(() => {
    flow.execute(props.userId);
  });

  return (
    <Switch>
      <Match when={flow.loading()}>
        <Spinner />
      </Match>
      <Match when={flow.error()}>
        <ErrorMessage error={flow.error()!} />
      </Match>
      <Match when={flow.data()}>
        <UserCard user={flow.data()!} />
      </Match>
    </Switch>
  );
}
```

## Best Practices

Building a professional async experience in SolidJS requires leaning into its fine-grained reactivity. Follow these patterns for the best results.

### <i class="fa-solid fa-microchip text-brand-1 mr-2"></i> Fine-Grained Patterns

::: tip Don't destructure signals
Avoid destructuring the state properties of the object returned by `createFlow`. Because they are getter functions (signals), they must be called as functions in your JSX to maintain reactivity tracking.
```tsx
// Good
<span>{flow.loading() ? '...' : 'Ready'}</span>
```
:::

::: tip Use `Show` and `Switch`
Solid's control flow components are highly optimized for signal-based updates. Prefer using `<Show>` or `<Switch>` with `<Match>` over ternary operators for large UI transitions to ensure the VDOM-less engine performs at its peak.
:::

### <i class="fa-solid fa-layer-group text-cyan-500 mr-2"></i> Reactive Execution

::: info Prop-Driven Flows
To re-run a flow when a prop or signal changes, wrap the `execute()` call in a `createEffect`. Solid will automatically track the dependency and trigger the flow whenever the underlying value updates.
```tsx
createEffect(() => flow.execute(props.id));
```
:::

### <i class="fa-solid fa-universal-access text-purple-400 mr-2"></i> UX & Refinement

::: tip Rule of 400ms
Next JS or React actions can feel "jittery" if they return too quickly, causing a loading spinner to flash for just a few frames. Use `loading: { minDuration: 400 }` to ensure your UI feels stable and predictable.
:::

::: info Accessibility with `Match`
When using `<Switch>`, ensure your "Error" match focuses the attention of screen readers. While `createFlow` manages the state, you should still provide an accessible announcement when a flow transitions to the `error` state.
:::
