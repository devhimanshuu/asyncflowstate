# Real-World Patterns



Production-ready patterns for common application scenarios.

## E-Commerce: Add to Cart

<RealWorldPattern type="cart" class="my-8" />

```tsx
function AddToCartButton({ product }) {
  const flow = useFlow(
    async (item) => api.cart.add(item),
    {
      concurrency: "keep",
      onSuccess: () => {
        toast.success(`${product.name} added to cart`);
        updateCartCount((c) => c + 1);
      },
      loading: { minDuration: 300 },
    }
  );

  return (
    <button
      {...flow.button({ onClick: () => flow.execute(product) })}
      className="add-to-cart"
    >
      {flow.loading ? "Adding..." : flow.success ? <><i class="fa-solid fa-circle-check mr-2"></i> Added!</> : "Add to Cart"}
    </button>
  );
}
```

## Dashboard: Data Refresh

<RealWorldPattern type="dashboard" class="my-8" />

```tsx
function DashboardStats() {
  const flow = useFlow(api.getDashboardStats, {
    concurrency: "restart",
    retry: { maxAttempts: 2, backoff: "exponential" },
  });

  useEffect(() => {
    flow.execute();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => flow.execute(), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      {flow.loading && !flow.data && <DashboardSkeleton />}
      {flow.error && (
        <ErrorCard message={flow.error.message} onRetry={() => flow.execute()} />
      )}
      {flow.data && (
        <StatsGrid stats={flow.data} isRefreshing={flow.loading} />
      )}
    </div>
  );
}
```

## SaaS: Subscription Management

<RealWorldPattern type="saas" class="my-8" />

```tsx
function SubscriptionManager({ plan }) {
  const upgradeFlow = useFlow(api.subscription.upgrade, {
    onSuccess: () => {
      toast.success("Subscription upgraded!");
      refetchUser();
    },
    retry: { maxAttempts: 3, backoff: "exponential" },
    loading: { minDuration: 1000 }, // Payment feels more secure with delay
  });

  const cancelFlow = useFlow(api.subscription.cancel, {
    onSuccess: () => {
      toast.success("Subscription cancelled");
      refetchUser();
    },
  });

  return (
    <div>
      <h2>Current Plan: {plan.name}</h2>

      <button
        {...upgradeFlow.button({ onClick: () => upgradeFlow.execute("pro") })}
        className="upgrade-btn"
      >
        {upgradeFlow.loading ? "Processing payment..." : "Upgrade to Pro"}
      </button>

      <button
        onClick={() => {
          if (confirm("Cancel your subscription?")) {
            cancelFlow.execute();
          }
        }}
        disabled={cancelFlow.loading}
        className="cancel-btn"
      >
        {cancelFlow.loading ? "Cancelling..." : "Cancel Subscription"}
      </button>
    </div>
  );
}
```

## Chat: AI Message Streaming

<RealWorldPattern type="ai" class="my-8" />

```tsx
function ChatInterface() {
  const [messages, setMessages] = useState([]);

  const flow = useFlow(
    async function* (prompt: string) {
      setMessages((prev) => [...prev, { role: "user", content: prompt }]);

      const stream = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [...messages, { role: "user", content: prompt }],
        stream: true,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk.choices[0]?.delta?.content || "";
        yield fullResponse;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fullResponse },
      ]);
    },
    { concurrency: "keep" }
  );

  return (
    <div className="chat">
      <MessageList messages={messages} />
      {flow.loading && (
        <div className="assistant-message streaming">
          {flow.data || <TypingIndicator />}
        </div>
      )}
      <ChatInput onSend={(msg) => flow.execute(msg)} disabled={flow.loading} />
    </div>
  );
}
```

## Admin: Bulk Operations

<RealWorldPattern type="admin" class="my-8" />

```tsx
function BulkDeleteButton({ selectedIds }) {
  const flow = useFlow(
    async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) => api.deleteItem(id))
      );
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        throw new Error(`${failed.length} of ${ids.length} deletions failed`);
      }
      return { deleted: ids.length };
    },
    {
      concurrency: "keep",
      onSuccess: (result) => {
        toast.success(`Deleted ${result.deleted} items`);
        refetchItems();
      },
    }
  );

  return (
    <button
      onClick={() => {
        if (confirm(`Delete ${selectedIds.length} items?`)) {
          flow.execute(selectedIds);
        }
      }}
      disabled={flow.loading || selectedIds.length === 0}
    >
      {flow.loading
        ? `Deleting ${selectedIds.length} items...`
        : `Delete ${selectedIds.length} Selected`}
    </button>
  );
}
```

## Search: Real-time Debouncing

<RealWorldPattern type="search" class="my-8" />

```tsx
function SearchBar() {
  const { execute, loading, data } = useFlow(api.search, {
    debounce: 300,
    concurrency: "restart", // Cancel previous search if new one starts
  });

  return (
    <div>
      <input 
        onChange={(e) => execute(e.target.value)} 
        placeholder="Type to search..." 
      />
      {loading && <Spinner />}
      <ul>
        {data?.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    </div>
  );
}
```

## Social: Optimistic Reactions

<RealWorldPattern type="optimistic" class="my-8" />

```tsx
function LikeButton({ post }) {
  const [isLiked, setIsLiked] = useState(post.isLiked);

  const { execute } = useFlow(api.posts.like, {
    onStart: () => setIsLiked(true), // Optimistic update
    onError: () => setIsLiked(post.isLiked), // Rollback on failure
  });

  return (
    <button onClick={() => execute(post.id)}>
      {isLiked ? <i class="fa-solid fa-heart text-red-500"></i> : <i class="fa-regular fa-heart opacity-40"></i>}
    </button>
  );
}
```

## Media: Reliable File Uploads

<RealWorldPattern type="upload" class="my-8" />

```tsx
function FileUploader() {
  const { execute, loading, status } = useFlow(api.upload, {
    retry: { 
      maxAttempts: 5, 
      shouldRetry: (err) => err.isNetworkError 
    },
  });

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) execute(file);
  };

  return (
    <div className="upload-zone">
      <input type="file" onChange={onFileChange} disabled={loading} />
      {status === "loading" && <ProgressBar />}
      {status === "success" && <p><i class="fa-solid fa-circle-check text-green-500 mr-2"></i> Upload complete!</p>}
    </div>
  );
}
```

## UX: Infinite Scrolling

<RealWorldPattern type="infinite-scroll" class="my-8" />

```tsx
function ItemList() {
  const { execute, status } = useFlow(fetchNextPage, {
    concurrency: "keep", // Prevent overlapping page fetches
  });

  // Trigger when scrolling to bottom
  const onScroll = (e) => {
    if (isNearBottom(e) && status !== "loading") {
      execute();
    }
  };

  return (
    <div onScroll={onScroll}>
      {items.map(i => <Item key={i.id} {...i} />)}
      {status === "loading" && <SkeletonLoader />}
    </div>
  );
}
```

## Logic: Multi-step Wizard

<RealWorldPattern type="wizard" class="my-8" />

```tsx
function SubscriptionWizard() {
  // Chain multiple async steps into one predictable flow
  const wizard = useFlowSequence([
    { name: "Validate", flow: validateData },
    { name: "Prepare", flow: createCustomer },
    { name: "Execute", flow: processPayment },
  ]);

  return (
    <div>
      <Progress steps={3} current={wizard.currentStep} />
      <button onClick={() => wizard.execute(formData)}>
        {wizard.loading ? "Processing..." : "Finish Setup"}
      </button>
    </div>
  );
}
```

## Resilience: Background Auto-save

<RealWorldPattern type="auto-save" class="my-8" />

```tsx
function DocumentEditor() {
  const saveFlow = useFlow(api.saveDocument, {
    concurrency: "restart", // New saves trump old ones
    debounce: 1000,         // Wait for user to stop typing
  });

  const onContentChange = (content) => {
    saveFlow.execute(content);
  };

  return (
    <div>
      <Editor onChange={onContentChange} />
      <SaveIndicator status={saveFlow.status} />
    </div>
  );
}
```

## Production Config

<RealWorldPattern type="production" class="my-10" />

A recommended global configuration for production apps:

```tsx
<FlowProvider
  config={{
    // Report errors to monitoring
    onError: (error) => {
      Sentry.captureException(error);
      if (error.status !== 401) {
        toast.error(error.message);
      }
    },

    // Smart retry for server errors
    retry: {
      maxAttempts: 3,
      delay: 1000,
      backoff: "exponential",
      shouldRetry: (error) => {
        return error.status >= 500 || error.message === "Network Error";
      },
    },

    // Polished loading UX
    loading: {
      minDuration: 400,
    },

    // Prevent double submissions
    concurrency: "keep",

    // Accessibility
    a11y: {
      liveRegionRel: "polite",
    },
  }}
>
  <App />
</FlowProvider>
```
