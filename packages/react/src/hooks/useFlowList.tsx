import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  Flow,
  type FlowAction,
  type FlowOptions,
  type FlowState,
} from "@asyncflowstate/core";
import { useFlowContext, mergeFlowOptions } from "../components/FlowProvider";

export function useFlowList<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: FlowAction<TData, TArgs>,
  options: FlowOptions<TData, TError, TArgs> = {},
) {
  const globalConfig = useFlowContext();
  const flowsRef = useRef<Record<string, Flow<TData, TError, TArgs>>>({});
  const unsubscribersRef = useRef<Record<string, () => void>>({});
  const [states, setStates] = useState<
    Record<string, FlowState<TData, TError>>
  >({});

  const getMergedOptions = useCallback(
    () => mergeFlowOptions(globalConfig, options),
    [globalConfig, options],
  );

  const getFlow = useCallback(
    (id: string) => {
      const existing = flowsRef.current[id];
      if (existing) {
        return existing;
      }

      const flow = new Flow<TData, TError, TArgs>(action, getMergedOptions());
      flowsRef.current[id] = flow;
      setStates((prev) => ({ ...prev, [id]: flow.state }));

      unsubscribersRef.current[id] = flow.subscribe((state) => {
        setStates((prev) => ({ ...prev, [id]: state }));
      });

      return flow;
    },
    [action, getMergedOptions],
  );

  useEffect(() => {
    const merged = getMergedOptions();
    Object.values(flowsRef.current).forEach((flow) => flow.setOptions(merged));
  }, [getMergedOptions]);

  useEffect(() => {
    return () => {
      Object.values(unsubscribersRef.current).forEach((unsubscribe) =>
        unsubscribe(),
      );
      Object.values(flowsRef.current).forEach((flow) => flow.dispose());
      unsubscribersRef.current = {};
      flowsRef.current = {};
    };
  }, []);

  const execute = useCallback(
    (id: string, ...args: TArgs) => getFlow(id).execute(...args),
    [getFlow],
  );

  const reset = useCallback((id: string) => {
    const flow = flowsRef.current[id];
    if (flow) {
      flow.reset();
    }
  }, []);

  const cancel = useCallback((id: string) => {
    const flow = flowsRef.current[id];
    if (flow) {
      flow.cancel();
    }
  }, []);

  const getStatus = useCallback(
    (id: string): FlowState<TData, TError> =>
      states[id] || {
        status: "idle",
        data: null,
        error: null,
        progress: 0,
      },
    [states],
  );

  return {
    execute,
    reset,
    cancel,
    getStatus,
    states,
    isAnyLoading: useMemo(
      () => Object.values(states).some((state) => state.status === "loading"),
      [states],
    ),
  };
}
