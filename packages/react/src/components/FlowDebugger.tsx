import React, { useState, useEffect, useRef, useMemo } from "react";
import { Flow, FlowEvent } from "@asyncflowstate/core";

export function FlowDebugger() {
    const [events, setEvents] = useState<FlowEvent[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<"list" | "timeline">("list");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return Flow.onEvent((event) => {
            setEvents((prev) => [...prev, event].slice(-100)); // Increased buffer
        });
    }, []);

    useEffect(() => {
        if (scrollRef.current && view === "list") {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events, view]);

    const timelineData = useMemo(() => {
        const flows: Record<string, {
            id: string;
            name: string;
            start?: number;
            end?: number;
            status: string;
            steps: { type: string; time: number }[];
        }> = {};

        events.forEach(event => {
            if (!flows[event.flowId]) {
                flows[event.flowId] = {
                    id: event.flowId,
                    name: event.flowName,
                    status: "idle",
                    steps: []
                };
            }

            const flow = flows[event.flowId];
            flow.steps.push({ type: event.type, time: event.timestamp });

            if (event.type === "start" && !flow.start) {
                flow.start = event.timestamp;
                flow.status = "loading";
            }
            if (event.type === "success" || event.type === "error" || event.type === "cancel") {
                flow.end = event.timestamp;
                flow.status = event.type;
            }
        });

        return Object.values(flows).sort((a, b) => (a.start || 0) - (b.start || 0));
    }, [events]);

    const minTime = useMemo(() => Math.min(...events.map(e => e.timestamp)), [events]);
    const maxTime = useMemo(() => Math.max(...events.map(e => e.timestamp)), [events]);
    const duration = maxTime - minTime || 1;

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
                    transition: "all 0.2s"
                }}
            >
                🔍 Debug Flows ({events.length})
            </button>
        );
    }

    return (
        <div
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                width: "600px",
                height: "500px",
                zIndex: 9999,
                background: "#1e1e1e",
                color: "#d4d4d4",
                border: "1px solid #333",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                fontFamily: "Inter, monospace",
                fontSize: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                overflow: "hidden"
            }}
        >
            <div
                style={{
                    padding: "10px 15px",
                    background: "#252526",
                    borderBottom: "1px solid #333",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: "bold" }}>Flow Debugger</span>
                    <div style={{ display: 'flex', background: '#333', borderRadius: '4px', padding: '2px' }}>
                        <button
                            onClick={() => setView("list")}
                            style={{
                                padding: '2px 8px',
                                border: 'none',
                                background: view === "list" ? "#555" : "transparent",
                                color: "#fff",
                                borderRadius: '2px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setView("timeline")}
                            style={{
                                padding: '2px 8px',
                                border: 'none',
                                background: view === "timeline" ? "#555" : "transparent",
                                color: "#fff",
                                borderRadius: '2px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            Timeline
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setEvents([])} style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer" }}>Clear</button>
                    <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", fontSize: '16px' }}>&times;</button>
                </div>
            </div>

            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "15px",
                    background: "#1a1a1a"
                }}
            >
                {events.length === 0 && (
                    <div style={{ color: "#666", textAlign: "center", marginTop: "150px" }}>
                        Waiting for flow events...
                    </div>
                )}

                {view === "list" ? (
                    events.map((event, i) => (
                        <div
                            key={i}
                            style={{
                                marginBottom: "8px",
                                padding: "8px",
                                background: "#252526",
                                borderRadius: "4px",
                                borderLeft: `4px solid ${getStatusColor(event.type)}`,
                                fontSize: '11px'
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <span style={{ fontWeight: "bold", color: getStatusColor(event.type), textTransform: 'uppercase' }}>
                                    {event.type}
                                </span>
                                <span style={{ color: "#666" }}>
                                    {new Date(event.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div style={{ color: "#eee", fontWeight: 500 }}>{event.flowName} <span style={{ color: '#555', fontSize: '9px' }}>#{event.flowId}</span></div>
                            {event.payload && (
                                <div style={{ marginTop: '5px', padding: '5px', background: '#111', borderRadius: '3px', overflow: 'hidden' }}>
                                    <pre style={{ margin: 0, fontSize: "9px", color: "#888", whiteSpace: 'pre-wrap' }}>
                                        {JSON.stringify(event.payload, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={{ position: 'relative', minHeight: '100%' }}>
                        {timelineData.map((flow, i) => {
                            const left = (((flow.start || minTime) - minTime) / duration) * 100;
                            const width = Math.max((((flow.end || maxTime) - (flow.start || minTime)) / duration) * 100, 0.5);

                            return (
                                <div key={flow.id} style={{ marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
                                        <span style={{ color: '#ccc' }}>{flow.name}</span>
                                        <span style={{ color: '#666' }}>{flow.end ? `${flow.end - (flow.start || 0)}ms` : 'pending...'}</span>
                                    </div>
                                    <div style={{ height: '12px', background: '#333', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                position: 'absolute',
                                                left: `${left}%`,
                                                width: `${width}%`,
                                                height: '100%',
                                                background: getStatusColor(flow.status),
                                                borderRadius: '6px',
                                                transition: 'all 0.3s ease-out'
                                            }}
                                        />
                                        {flow.steps.map((step, si) => (
                                            <div
                                                key={si}
                                                style={{
                                                    position: 'absolute',
                                                    left: `${((step.time - minTime) / duration) * 100}%`,
                                                    width: '2px',
                                                    height: '100%',
                                                    background: 'rgba(255,255,255,0.3)',
                                                    zIndex: 1
                                                }}
                                                title={step.type}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div style={{ padding: '8px 15px', background: '#252526', borderTop: '1px solid #333', fontSize: '10px', display: 'flex', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor('start') }}></div> Start
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor('success') }}></div> Success
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor('error') }}></div> Error
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor('retry') }}></div> Retry
                </div>
            </div>
        </div>
    );
}

function getStatusColor(type: string) {
    switch (type) {
        case "start": case "loading": return "#3794ff";
        case "success": return "#89d185";
        case "error": return "#f48771";
        case "retry": return "#cca700";
        case "progress": return "#b5cea8";
        case "cancel": return "#808080";
        case "reset": return "#666";
        case "stream": return "#b267e6";
        default: return "#aaa";
    }
}
