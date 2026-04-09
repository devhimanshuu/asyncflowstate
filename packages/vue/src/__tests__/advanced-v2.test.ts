import { describe, it, expect, vi } from 'vitest';
import { useFlow } from '../composables/useFlow';
import { effectScope, nextTick } from 'vue';

describe('useFlow Vue Advanced Features (v2.0.0)', () => {
  it('should expose triggerUndo for Purgatory', async () => {
    const action = vi.fn().mockResolvedValue('ok');
    const scope = effectScope();
    
    const flow: any = scope.run(() => {
      return useFlow(action, { purgatory: { duration: 100 } });
    });

    flow.execute();
    expect(flow.loading).toBe(true);
    expect(action).not.toHaveBeenCalled();

    flow.triggerUndo();
    await nextTick();
    
    expect(flow.loading).toBe(false);
    expect(action).not.toHaveBeenCalled();
    scope.stop();
  });

  it('should provide rollbackDiff ref', async () => {
    const action = vi.fn().mockRejectedValue(new Error('fail'));
    const scope = effectScope();
    
    const flow: any = scope.run(() => {
      return useFlow(action, { optimisticResult: { update: true } });
    });

    try { await flow.execute(); } catch (_e) { /* Expected */ }
    
    // Wait for diff calculation
    await new Promise(r => setTimeout(r, 50));
    
    expect(flow.rollbackDiff).toBeDefined();
    expect(flow.rollbackDiff.length).toBeGreaterThan(0);
    scope.stop();
  });

  it('should prefetch on hover via button()', async () => {
    const action = vi.fn().mockResolvedValue('hinted');
    const scope = effectScope();
    
    const flow: any = scope.run(() => {
      return useFlow(action, { predictive: { prefetchOnHover: true } });
    });

    const btnAttrs = flow.button();
    // Simulate hover
    btnAttrs.onMouseenter(new Event('mouseenter'));
    
    await new Promise(r => setTimeout(r, 50));
    expect(action).toHaveBeenCalled();
    scope.stop();
  });
});
