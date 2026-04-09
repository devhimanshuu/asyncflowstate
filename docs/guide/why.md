# Why AsyncFlowState?

## The Before & After

Here is a common scenario: **submitting a form and handling the API response**.

### <i class="fa-solid fa-circle-xmark text-red-500 mr-2"></i> Before — Manual State Management

```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async (data) => {
  setLoading(true);
  setError(null);
  try {
    await api.save(data);
    alert("Saved!");
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};

return (
  <button onClick={handleSubmit} disabled={loading}>
    {loading ? "Saving..." : "Save"}
  </button>
);
```

**Problems with this approach:**

- No double-click prevention (what if `api.save` is slow?)
- No retry logic
- No accessibility attributes
- Must repeat this pattern for every async action
- Error handling is easy to forget

### <i class="fa-solid fa-circle-check text-brand mr-2"></i> After — With AsyncFlowState

```tsx
const flow = useFlow(api.save, {
  onSuccess: () => alert("Saved!"),
});

return (
  <button {...flow.button()}>{flow.loading ? "Saving..." : "Save"}</button>
);
```

**What you get for free:**

- <i class="fa-solid fa-circle-check text-brand mr-2"></i> Double submission prevention
- <i class="fa-solid fa-circle-check text-brand mr-2"></i> Automatic `disabled` and `aria-busy` attributes
- <i class="fa-solid fa-circle-check text-brand mr-2"></i> Consistent loading state management
- <i class="fa-solid fa-circle-check text-brand mr-2"></i> Clean error handling
- <i class="fa-solid fa-circle-check text-brand mr-2"></i> Zero boilerplate

## Comparison with Alternatives

### vs. React Query / SWR

|                | React Query / SWR                                                               | AsyncFlowState                                                                  |
| -------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Purpose**    | Data fetching & caching                                                         | Action behavior & UX                                                            |
| **Focus**      | GET requests, stale data                                                        | POST/PUT/DELETE actions                                                         |
| **Cache**      | Smart caching built-in                                                          | No cache (not needed)                                                           |
| **Use with**   | Reading data                                                                    | Writing data, user actions                                                      |
| **Works with** | <i class="fa-solid fa-circle-check text-brand mr-2"></i> Complements each other | <i class="fa-solid fa-circle-check text-brand mr-2"></i> Complements each other |

### vs. Redux / Zustand

|                    | Redux / Zustand                                                                 | AsyncFlowState                                                                  |
| ------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Purpose**        | Global state management                                                         | Action behavior management                                                      |
| **Scope**          | Entire app state                                                                | Individual async actions                                                        |
| **Complexity**     | Actions, reducers, middleware                                                   | One hook, zero config                                                           |
| **Learning curve** | Moderate to steep                                                               | Minimal                                                                         |
| **Works with**     | <i class="fa-solid fa-circle-check text-brand mr-2"></i> Complements each other | <i class="fa-solid fa-circle-check text-brand mr-2"></i> Complements each other |

### vs. Manual useState

|                       | Manual useState            | AsyncFlowState |
| --------------------- | -------------------------- | -------------- |
| **Boilerplate**       | High — repeated everywhere | None           |
| **Double submission** | Must implement manually    | Automatic      |
| **Retry logic**       | Must implement manually    | One config     |
| **Optimistic UI**     | Complex implementation     | One line       |
| **Accessibility**     | Usually forgotten          | Built-in       |
| **Error focus**       | Must implement manually    | Automatic      |

## When to Use AsyncFlowState

Use AsyncFlowState when you have:

- **Form submissions** — Login, registration, profile updates
- **CRUD operations** — Create, update, delete buttons
- **File uploads** — With progress tracking and retry
- **Payment flows** — Where double-submission is catastrophic
- **Multi-step workflows** — Sequential or parallel operations
- **Search with debounce** — Controlled async search inputs
- **Any button that calls an API** — The universal use case

::: warning When NOT to use AsyncFlowState

- Simple data fetching on mount → Use React Query / SWR
- Global application state → Use Redux / Zustand / Pinia
- Real-time subscriptions → Use dedicated WebSocket/SSE libraries
  :::
