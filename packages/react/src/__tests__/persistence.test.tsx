import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { useFlow } from "../hooks/useFlow";
import { FlowProvider } from "../components/FlowProvider";

describe("useFlow Persistence", () => {
    const mockStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
    };

    beforeEach(() => {
        vi.stubGlobal("localStorage", mockStorage);
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function TestComponent({ action, options }: any) {
        const flow = useFlow(action, options);
        return (
            <div>
                <div data-testid="status">{flow.status}</div>
                <div data-testid="data">{JSON.stringify(flow.data)}</div>
                <button data-testid="execute" onClick={() => flow.execute()}>Execute</button>
                {flow.status === 'loading' && <div data-testid="progress">{flow.progress}%</div>}
            </div>
        );
    }

    it("should restore state from localStorage on mount", async () => {
        const persistedState = {
            status: "success",
            data: { msg: "restored" },
            timestamp: Date.now(),
        };
        mockStorage.getItem.mockReturnValue(JSON.stringify(persistedState));

        const action = vi.fn().mockResolvedValue({ msg: "new" });

        render(
            <FlowProvider>
                <TestComponent action={action} options={{ persist: { key: "react-flow" } }} />
            </FlowProvider>
        );

        // Should eventually show restored data
        await waitFor(() => {
            expect(screen.getByTestId("status").textContent).toBe("success");
            expect(screen.getByTestId("data").textContent).toContain("restored");
        });
    });

    it("should persist state to localStorage when action succeeds", async () => {
        const action = vi.fn().mockResolvedValue({ msg: "saved" });

        render(
            <FlowProvider>
                <TestComponent action={action} options={{ persist: { key: "save-flow" } }} />
            </FlowProvider>
        );

        await act(async () => {
            screen.getByTestId("execute").click();
        });

        await waitFor(() => {
            expect(screen.getByTestId("status").textContent).toBe("success");
        });

        // Wait for async persistence
        await act(async () => {
            await new Promise(r => setTimeout(r, 100));
        });

        expect(mockStorage.setItem).toHaveBeenCalledWith(
            "save-flow",
            expect.stringContaining('"status":"success"')
        );
        expect(mockStorage.setItem).toHaveBeenCalledWith(
            "save-flow",
            expect.stringContaining('"data":{"msg":"saved"}')
        );
    });
});
