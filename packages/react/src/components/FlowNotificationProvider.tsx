import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { Flow, FlowEvent } from "@asyncflowstate/core";

export interface NotificationHandlers {
    onSuccess?: (event: FlowEvent) => void;
    onError?: (event: FlowEvent) => void;
}

const FlowNotificationContext = createContext<NotificationHandlers | null>(null);

export function FlowNotificationProvider({
    children,
    onSuccess,
    onError,
}: NotificationHandlers & { children: ReactNode }) {
    useEffect(() => {
        return Flow.onEvent((event) => {
            if (event.type === "success" && onSuccess) {
                onSuccess(event);
            } else if (event.type === "error" && onError) {
                onError(event);
            }
        });
    }, [onSuccess, onError]);

    return (
        <FlowNotificationContext.Provider value={{ onSuccess, onError }}>
            {children}
        </FlowNotificationContext.Provider>
    );
}
