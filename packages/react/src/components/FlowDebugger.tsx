import React, { useState, useEffect, useRef } from "react";
import { Flow, FlowEvent } from "@asyncflowstate/core";

export function FlowDebugger() {
    const [events, setEvents] = useState<FlowEvent[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return Flow.onEvent((event) => {
            setEvents((prev) => [...prev, event].slice(-50)); // Keep last 50 events
        });
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    zIndex: 9999,
                    padding: "8px 12px",
                    background: "#333",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                }}
            >
                Open Flow Debugger ({events.length})
            </button>
        );
    }

    return (
        <div
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                width: "400px",
                height: "500px",
                zIndex: 9999,
                background: "#1e1e1e",
                color: "#d4d4d4",
                border: "1px solid #333",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                fontFamily: "monospace",
                fontSize: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
        >
            <div
                style={{
                    padding: "10px",
                    background: "#252526",
                    borderBottom: "1px solid #333",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                }}
            >
                <span>AsyncFlowState Timeline</span>
                <div>
                    <button
                        onClick={() => setEvents([])}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "#aaa",
                            cursor: "pointer",
                            marginRight: "10px",
                        }}
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "#aaa",
                            cursor: "pointer",
                        }}
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "10px",
                }}
            >
                {events.length === 0 && (
                    <div style={{ color: "#666", textAlign: "center", marginTop: "100px" }}>
                        No events recorded yet.
                    </div>
                )}
                {events.map((event, i) => (
                    <div
                        key={i}
                        style={{
                            marginBottom: "8px",
                            padding: "6px",
                            background: "#2d2d2d",
                            borderRadius: "4px",
                            borderLeft: `4px solid ${getStatusColor(event.type)}`,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontWeight: "bold", color: getStatusColor(event.type) }}>
                                {event.type.toUpperCase()}
                            </span>
                            <span style={{ color: "#666" }}>
                                {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <div style={{ color: "#eee" }}>{event.flowName}</div>
                        {event.payload && (
                            <pre style={{ margin: "4px 0 0 0", fontSize: "10px", color: "#888", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {JSON.stringify(event.payload, null, 2)}
                            </pre>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function getStatusColor(type: string) {
    switch (type) {
        case "start": return "#3794ff";
        case "success": return "#89d185";
        case "error": return "#f48771";
        case "retry": return "#cca700";
        case "progress": return "#b5cea8";
        case "cancel": return "#808080";
        case "reset": return "#666";
        default: return "#aaa";
    }
}
