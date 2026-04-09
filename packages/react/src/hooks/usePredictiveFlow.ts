import { useEffect, useRef, useCallback } from "react";
import { type FlowAction } from "@asyncflowstate/core";
import { useFlow, type ReactFlowOptions } from "./useFlow";

/**
 * usePredictiveFlow is a React hook that triggers a prefetch based on pointer velocity.
 * If the user's cursor is moving quickly towards the trigger element, the flow fires early.
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
  const velocityRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const now = Date.now();
      const dt = now - lastPosRef.current.t;
      if (dt > 0) {
        const dx = e.clientX - lastPosRef.current.x;
        const dy = e.clientY - lastPosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        velocityRef.current = dist / dt;
      }
      lastPosRef.current = { x: e.clientX, y: e.clientY, t: now };
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const predictHandle = useCallback(
    (_e: React.PointerEvent) => {
      // If velocity is high (> 2px/ms) and moving towards, prefetch!
      if (velocityRef.current > 2) {
        (flow.execute as any)();
      }
    },
    [flow],
  );

  // Wrap button to include velocity check
  const predictiveButton = useCallback(
    (props: any = {}) => {
      const original = flow.button(props);
      return {
        ...original,
        onPointerMove: (e: React.PointerEvent) => {
          predictHandle(e);
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
