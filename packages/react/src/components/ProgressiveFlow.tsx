import React, { useState, useEffect, useCallback, type ReactNode, type FormEvent } from "react";
import { useFlow, type ReactFlowOptions } from "../hooks/useFlow";

/**
 * Props for ProgressiveFlow component.
 */
export interface ProgressiveFlowProps<
    TData = any,
    TError = any,
    TArgs extends any[] = any[],
> {
    /** The action to execute. Should be a Server Action or an async function. */
    action: (...args: TArgs) => Promise<TData>;
    /** Options for the underlying useFlow hook. */
    options?: ReactFlowOptions<TData, TError, TArgs>;
    /**
     * The child element. Must be either a <form> or an <a> tag,
     * or a function that receives the flow state and returns a ReactNode.
     */
    children: ReactNode | ((props: {
        flow: ReturnType<typeof useFlow<TData, TError, TArgs>>;
        isHydrated: boolean;
    }) => ReactNode);
    /**
     * The native URL to use for the form action if JS is disabled.
     * Only used for <form> tags.
     */
    fallbackUrl?: string;
    /**
     * The HTTP method for the fallback form. Default: 'POST'
     */
    fallbackMethod?: "GET" | "POST";
}

/**
 * ProgressiveFlow component implement Progressive Enhancement for Async Flows.
 * It renders a standard HTML <form> or <a> tag for users without JS or during hydration,
 * then "upgrades" to a full AsyncFlow once hydrated.
 */
export function ProgressiveFlow<
    TData = any,
    TError = any,
    TArgs extends any[] = any[],
>({
    action,
    options,
    children,
    fallbackUrl,
    fallbackMethod = "POST",
}: ProgressiveFlowProps<TData, TError, TArgs>) {
    const [isHydrated, setIsHydrated] = useState(false);
    const flow = useFlow(action, options);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            if (isHydrated) {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                // We cast formData to TArgs if appropriate, though useFlow usually takes structured args.
                // For forms, we assume the action handles FormData or we spread it.
                // Special case: if action only takes one arg and it's FormData
                (flow.execute as any)(formData);
            }
        },
        [isHydrated, flow],
    );

    // If children is a function, we just call it with the state
    if (typeof children === "function") {
        return <>{children({ flow, isHydrated })}</>;
    }

    // Otherwise, we clone the child and inject the necessary props
    if (React.isValidElement(children)) {
        const child = children as React.ReactElement<any>;

        if (child.type === "form") {
            return React.cloneElement(child, {
                action: isHydrated ? undefined : fallbackUrl || "#",
                method: isHydrated ? undefined : fallbackMethod,
                onSubmit: handleSubmit,
                "data-hydrated": isHydrated,
            });
        }

        if (child.type === "a") {
            return React.cloneElement(child, {
                onClick: (e: React.MouseEvent) => {
                    if (isHydrated) {
                        e.preventDefault();
                        (flow.execute as any)();
                    }
                    child.props.onClick?.(e);
                },
                "data-hydrated": isHydrated,
            });
        }
    }

    return <>{children}</>;
}
