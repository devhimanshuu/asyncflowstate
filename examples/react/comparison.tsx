/**
 * AsyncFlowState - Before vs After Comparison
 * 
 * This file demonstrates the difference between manual async state management
 * and using @asyncflowstate/react.
 */

import React, { useState, useEffect } from 'react';
import { useFlow } from '@asyncflowstate/react';

// =============================================================================
// Scenario 1: Fetching Data on Mount
// =============================================================================

/**
 * BEFORE: Manual State Management
 * 
 * Logic is scattered across multiple hooks and requires boilerplate for
 * loading, error, and data states. Race conditions (e.g. if userId changes)
 * must be handled manually with a cleanup flag.
 */
export function ManualDataFetcher({ userId }: { userId: string }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return <div>User: {data.name}</div>;
}

/**
 * AFTER: Using AsyncFlowState
 * 
 * Logic is encapsulated in a single hook. Loading and error states are
 * handled automatically. Race conditions are managed internally — if a new
 * execute() is called before the previous one finishes, the late result 
 * is discarded or the flow is restarted based on strategy.
 */
export function AsyncFlowDataFetcher({ userId }: { userId: string }) {
  const userFlow = useFlow(
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    }
  );

  // Execute when userId changes
  useEffect(() => {
    userFlow.execute();
  }, [userId]);

  if (userFlow.loading) return <div>Loading...</div>;
  if (userFlow.error) return <div>Error: {(userFlow.error as Error).message}</div>;
  if (!userFlow.data) return null;

  return <div>User: {userFlow.data.name}</div>;
}

// =============================================================================
// Scenario 2: Form Submission (POST)
// =============================================================================

/**
 * BEFORE: Manual Form Submission
 * 
 * Requires manual state for loading, error, and success, plus
 * manual event handling and button disabling.
 */
export function ManualForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) throw new Error('Subscription failed');
      
      setIsSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        disabled={isSubmitting}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </button>
      {error && <p className="error">{error}</p>}
      {isSuccess && <p className="success">Subscribed!</p>}
    </form>
  );
}

/**
 * AFTER: Using AsyncFlowState
 * 
 * Boilerplate is eliminated. Button accessibility, auto-reset, 
 * and form binding are handled by helper methods.
 */
export function AsyncFlowForm() {
  const [email, setEmail] = useState('');
  
  const subscribeFlow = useFlow(
    async (email: string) => {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Subscription failed');
      return response.json();
    },
    {
      onSuccess: () => setEmail(''),
      autoReset: { enabled: true, delay: 5000 }
    }
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); subscribeFlow.execute(email); }}>
      <input 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        disabled={subscribeFlow.loading}
      />
      
      {/* The .button() helper manages aria-busy, disabled, and more */}
      <button {...subscribeFlow.button()} type="submit">
        {subscribeFlow.loading ? 'Subscribing...' : 'Subscribe'}
      </button>

      {subscribeFlow.error && (
        <p className="error">{(subscribeFlow.error as Error).message}</p>
      )}
      
      {subscribeFlow.status === 'success' && (
        <p className="success">Subscribed!</p>
      )}
    </form>
  );
}

// =============================================================================
// Scenario 3: UX Polish (Handling UI Flashes)
// =============================================================================

/**
 * BEFORE: Simple Loading State
 * 
 * If the API is fast, the loading spinner flashes for 50ms, 
 * which looks like a jarring glitch to the user.
 */
export function ManualFlashingLoader() {
  const [loading, setLoading] = useState(false);
  
  const handleAction = async () => {
    setLoading(true);
    await performFastAction(); // e.g. 50ms
    setLoading(false);
  };

  return (
    <button onClick={handleAction}>
      {loading ? '...' : 'Click Me'}
    </button>
  );
}

/**
 * AFTER: Controlled Loading Duration
 * 
 * AsyncFlowState can ensure loading states stay visible long enough 
 * to be perceived (minDuration) or don't show at all for super fast
 * requests (delay).
 */
export function AsyncFlowPolishedLoader() {
  const flow = useFlow(performFastAction, {
    loading: {
      minDuration: 500, // Ensure spinner shows for at least 500ms
      delay: 200,       // Don't show spinner if request finishes under 200ms
    }
  });

  return (
    <button {...flow.button()}>
      {flow.loading ? '⌛' : 'Click Me'}
    </button>
  );
}

async function performFastAction() {
  return new Promise(resolve => setTimeout(resolve, 50));
}
