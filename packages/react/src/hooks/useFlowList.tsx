import { useState, useCallback, useMemo } from "react";
import { Flow, FlowAction, FlowOptions, FlowState } from "@asyncflowstate/core";
import { useFlowContext, mergeFlowOptions } from "./FlowProvider";

export function useFlowList<TData = any, TError = any, TArgs extends any[] = any[]>(
    action: FlowAction<TData, TArgs>,
    options: FlowOptions<TData, TError, TArgs> = {}
) {
    const globalConfig = useFlowContext();
    const [flows, setFlows] = useState<Record<string, Flow<TData, TError, TArgs>>>({});
    const [states, setStates] = useState<Record<string, FlowState<TData, TError>>>({});

    const getFlow = useCallback((id: string) => {
        if (flows[id]) return flows[id];

        const mergedOptions = mergeFlowOptions(globalConfig, options);
        const newFlow = new Flow<TData, TError, TArgs>(action, mergedOptions);

        setFlows(prev => ({ ...prev, [id]: newFlow }));
        setStates(prev => ({ ...prev, [id]: newFlow.state }));

        newFlow.subscribe((state) => {
            setStates(prev => ({ ...prev, [id]: state }));
        });

        return newFlow;
    }, [action, flows, globalConfig, options]);

    const execute = useCallback((id: string, ...args: TArgs) => {
        return getFlow(id).execute(...args);
    }, [getFlow]);

    const reset = useCallback((id: string) => {
        if (flows[id]) flows[id].reset();
    }, [flows]);

    const cancel = useCallback((id: string) => {
        if (flows[id]) flows[id].cancel();
    }, [flows]);

    const getStatus = useCallback((id: string) => {
        return states[id] || { status: 'idle', data: null, error: null };
    }, [states]);

    return {
        execute,
        reset,
        cancel,
        getStatus,
        states,
        /**
         * Returns true if any flow in the list is loading.
         */
        isAnyLoading: useMemo(() =>
            Object.values(states).some(s => s.status === 'loading'),
            [states]),
    };
}
