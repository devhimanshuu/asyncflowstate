import { useState, useEffect, useRef, useMemo } from "react";
import { FlowParallel, ParallelState, ParallelStrategy, Flow } from "@asyncflowstate/core";

export function useFlowParallel(
    input: Flow<any, any, any>[] | Record<string, Flow<any, any, any>>,
    strategy: ParallelStrategy = "all"
) {
    const [parallel] = useState(() => new FlowParallel(input, strategy));
    const [state, setState] = useState<ParallelState>(() => parallel.state);

    useEffect(() => {
        return parallel.subscribe(setState);
    }, [parallel]);

    return {
        ...state,
        loading: state.status === "loading",
        execute: parallel.execute.bind(parallel),
        reset: parallel.reset.bind(parallel),
        cancel: parallel.cancel.bind(parallel),
    };
}
