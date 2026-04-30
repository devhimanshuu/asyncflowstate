import { useCallback } from "react";
import { type FlowAction, IntentTracker } from "@asyncflowstate/core";
import { useFlow, type ReactFlowOptions } from "./useFlow";

/**
 * usePredictiveFlow is a React hook that triggers a pre-warm based on pointer trajectory.
 * This feature uses a tiny, local ML-style heuristic (via IntentTracker) to monitor mouse trajectories.
 * It predicts which button the user is about to click and executes pre-checks and cache-lookups early.
 *
 * @param action The asynchronous function to manage.
 * @param options Configuration for prediction and flow behavior.
 * @returns Flow state and helpers.
 */
export function usePredictiveFlow<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: FlowAction<TData, TArgs>,
  options: ReactFlowOptions<TData, TError, TArgs> = {},
) {
  const flow = useFlow(action, options);

  const predictHandle = useCallback(
    (rect: DOMRect) => {
      const tracker = IntentTracker.getInstance();
      const probability = tracker.predictIntent(rect);
      const threshold = options.predictive?.threshold ?? 0.7;

      if (probability >= threshold) {
        // Execute Pre-check and Cache-lookup phases before the finger touches the screen
        (flow.prewarm as any)();
      }
    },
    [flow, options.predictive?.threshold],
  );

  // Wrap button to include velocity check
  const predictiveButton = useCallback(
    (props: any = {}) => {
      const original = flow.button(props);
      return {
        ...original,
        onPointerMove: (e: React.PointerEvent) => {
          predictHandle(e.currentTarget.getBoundingClientRect());
          if (props.onPointerMove) props.onPointerMove(e);
        },
      };
    },
    [flow, predictHandle],
  );

  return {
    ...flow,
    button: predictiveButton,
  };
}
