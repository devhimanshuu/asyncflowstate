import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFlow } from '../stores/createFlow';
import { get } from 'svelte/store';

describe('createFlow Svelte Advanced Features (v2.0.0)', () => {

  it('should expose triggerUndo store method', async () => {
    const action = vi.fn().mockResolvedValue('ok');
    const flow = createFlow(action, { purgatory: { duration: 100 } });

    flow.execute();
    expect(get(flow).loading).toBe(true);
    expect(action).not.toHaveBeenCalled();

    flow.triggerUndo();
    expect(get(flow).loading).toBe(false);
    expect(action).not.toHaveBeenCalled();
  });

  it('should include rollbackDiff in store state', async () => {
    const action = vi.fn().mockRejectedValue('fail');
    const flow = createFlow(action, { 
      optimisticResult: { update: 1 } 
    });

    try { await flow.execute(); } catch (_e) { /* Expected */ }
    
    expect(get(flow).rollbackDiff).toBeDefined();
    expect(get(flow).rollbackDiff!.length).toBeGreaterThan(0);
  });

  it('should allow worker() execution', async () => {
    const action = vi.fn().mockResolvedValue('processed');
    const flow = createFlow(action);

    await flow.worker('data');
    expect(get(flow).data).toBe('processed');
    expect(action).toHaveBeenCalledWith('data');
  });
});
